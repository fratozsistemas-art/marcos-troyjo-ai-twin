import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit } from './utils/rateLimiter.js';
import { validateString, validateEnum } from './utils/inputValidator.js';

Deno.serve(async (req) => {
    const startTime = Date.now();
    
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const rateCheck = checkRateLimit(user.email, 'executeContentCurationWorkflow');
        if (!rateCheck.allowed) {
            return Response.json({ 
                error: 'Rate limit exceeded',
                retryAfter: rateCheck.retryAfter 
            }, { status: 429 });
        }

        const body = await req.json();

        // Input validation
        const workflowId = validateString(body.workflow_id, { maxLength: 100, paramName: 'workflow_id' });
        const contentId = validateString(body.content_id, { maxLength: 100, paramName: 'content_id' });
        const contentType = validateEnum(
            body.content_type,
            ['article', 'document', 'fact', 'publication'],
            'content_type'
        );

        // Fetch workflow configuration
        const workflow = await base44.asServiceRole.entities.ContentCurationWorkflow.filter({ 
            id: workflowId 
        });

        if (!workflow || workflow.length === 0) {
            return Response.json({ error: 'Workflow not found' }, { status: 404 });
        }

        const config = workflow[0];

        if (config.status !== 'active') {
            return Response.json({ error: 'Workflow is not active' }, { status: 400 });
        }

        // Fetch content
        let content;
        try {
            switch (contentType) {
                case 'article':
                    const articles = await base44.asServiceRole.entities.Article.filter({ id: contentId });
                    content = articles[0];
                    break;
                case 'document':
                    const docs = await base44.asServiceRole.entities.Document.filter({ id: contentId });
                    content = docs[0];
                    break;
                case 'fact':
                    const facts = await base44.asServiceRole.entities.StrategicFact.filter({ id: contentId });
                    content = facts[0];
                    break;
            }
        } catch (error) {
            return Response.json({ error: 'Content not found' }, { status: 404 });
        }

        if (!content) {
            return Response.json({ error: 'Content not found' }, { status: 404 });
        }

        // Execute workflow based on type
        let executionResult;
        
        switch (config.workflow_type) {
            case 'auto_collection_assignment':
                executionResult = await executeCollectionAssignment(base44, content, contentType, config);
                break;
            case 'content_review_flagging':
                executionResult = await executeReviewFlagging(base44, content, contentType, config);
                break;
            case 'tag_auto_assignment':
                executionResult = await executeTagAssignment(base44, content, contentType, config);
                break;
            case 'trend_based_suggestions':
                executionResult = await executeTrendSuggestions(base44, content, contentType, config);
                break;
            case 'content_quality_check':
                executionResult = await executeQualityCheck(base44, content, contentType, config);
                break;
            default:
                return Response.json({ error: 'Unknown workflow type' }, { status: 400 });
        }

        const executionTime = Date.now() - startTime;

        // Create execution record
        const execution = await base44.asServiceRole.entities.WorkflowExecution.create({
            workflow_id: workflowId,
            content_id: contentId,
            content_type: contentType,
            execution_status: executionResult.status,
            actions_taken: executionResult.actions,
            ai_confidence: executionResult.confidence,
            reasoning: executionResult.reasoning,
            collections_assigned: executionResult.collections_assigned || [],
            tags_added: executionResult.tags_added || [],
            flags_raised: executionResult.flags_raised || [],
            execution_time_ms: executionTime,
            needs_review: !config.auto_approve || executionResult.confidence < config.criteria.min_confidence,
            error_message: executionResult.error
        });

        // Update workflow stats
        await base44.asServiceRole.entities.ContentCurationWorkflow.update(workflowId, {
            execution_count: (config.execution_count || 0) + 1,
            last_execution: new Date().toISOString(),
            success_rate: calculateSuccessRate(config, executionResult.status === 'success')
        });

        return Response.json({
            success: true,
            execution_id: execution.id,
            status: executionResult.status,
            actions_taken: executionResult.actions,
            confidence: executionResult.confidence,
            needs_review: execution.needs_review,
            execution_time_ms: executionTime
        });

    } catch (error) {
        console.error('Workflow execution error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});

async function executeCollectionAssignment(base44, content, contentType, config) {
    const title = content.title || content.name || '';
    const tags = content.tags || [];
    const description = content.description || content.summary || '';

    // Use collection suggestion function
    const response = await base44.asServiceRole.functions.invoke('suggestCollections', {
        content_type: contentType,
        title,
        tags,
        description
    });

    const suggestions = response.data.suggested_collections || [];
    const highConfidenceSuggestions = suggestions.filter(s => 
        s.confidence >= (config.criteria.min_confidence || 0.7)
    );

    const actions = [];
    const collectionsAssigned = [];

    if (config.auto_approve && highConfidenceSuggestions.length > 0) {
        // Auto-assign to collections
        for (const suggestion of highConfidenceSuggestions) {
            try {
                const collection = await base44.asServiceRole.entities.ContentCollection.filter({
                    id: suggestion.collection_id
                });
                
                if (collection && collection[0]) {
                    const currentItems = collection[0].content_items || [];
                    const newItem = {
                        content_type: contentType,
                        content_id: content.id,
                        added_date: new Date().toISOString(),
                        notes: `Auto-added by workflow (confidence: ${Math.round(suggestion.confidence * 100)}%)`,
                        order: currentItems.length
                    };

                    await base44.asServiceRole.entities.ContentCollection.update(suggestion.collection_id, {
                        content_items: [...currentItems, newItem]
                    });

                    collectionsAssigned.push(suggestion.collection_id);
                    actions.push({
                        action_type: 'assign_to_collection',
                        status: 'success',
                        details: {
                            collection_name: suggestion.collection_name,
                            confidence: suggestion.confidence
                        }
                    });
                }
            } catch (error) {
                actions.push({
                    action_type: 'assign_to_collection',
                    status: 'failed',
                    details: { error: error.message }
                });
            }
        }
    }

    return {
        status: actions.some(a => a.status === 'success') ? 'success' : 'pending_review',
        actions,
        confidence: Math.max(...suggestions.map(s => s.confidence), 0),
        reasoning: response.data.overall_assessment,
        collections_assigned: collectionsAssigned
    };
}

async function executeReviewFlagging(base44, content, contentType, config) {
    const title = content.title || content.name || '';
    const contentText = content.body || content.detail || content.description || '';
    const sentiment = content.sentiment;
    const qualityTier = content.quality_tier;

    const flags = [];
    const actions = [];

    // Check sentiment
    if (config.criteria.sentiment_threshold && sentiment) {
        if (sentiment === config.criteria.sentiment_threshold || 
            (sentiment === 'negative' && config.criteria.sentiment_threshold !== 'positive')) {
            flags.push({
                flag_type: 'sentiment_match',
                reason: `Content sentiment is ${sentiment}`,
                severity: 'medium'
            });
        }
    }

    // Check quality tier
    if (config.criteria.quality_tier && qualityTier) {
        if (config.criteria.quality_tier.includes(qualityTier)) {
            flags.push({
                flag_type: 'quality_tier_match',
                reason: `Content quality tier is ${qualityTier}`,
                severity: 'high'
            });
        }
    }

    // AI analysis for additional flags
    const analysisPrompt = `Analyze this ${contentType} for review flags:

Title: ${title}
Content: ${contentText.substring(0, 2000)}

Check for:
1. Factual accuracy concerns
2. Bias or polarization
3. Outdated information
4. Incomplete analysis
5. Tone appropriateness

Return JSON with flags array containing: flag_type, reason, severity (low/medium/high)`;

    try {
        const aiAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    flags: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                flag_type: { type: "string" },
                                reason: { type: "string" },
                                severity: { type: "string" }
                            }
                        }
                    },
                    overall_assessment: { type: "string" }
                }
            }
        });

        flags.push(...(aiAnalysis.flags || []));

        if (flags.length > 0) {
            actions.push({
                action_type: 'flag_for_review',
                status: 'success',
                details: { flags_count: flags.length }
            });
        }

    } catch (error) {
        actions.push({
            action_type: 'flag_for_review',
            status: 'failed',
            details: { error: error.message }
        });
    }

    return {
        status: flags.length > 0 ? 'pending_review' : 'success',
        actions,
        confidence: 0.85,
        reasoning: 'Content flagged based on criteria and AI analysis',
        flags_raised: flags
    };
}

async function executeTagAssignment(base44, content, contentType, config) {
    const title = content.title || content.name || '';
    const contentText = content.body || content.detail || content.description || '';
    const existingTags = content.tags || [];

    // Use tag suggestion function
    const response = await base44.asServiceRole.functions.invoke('suggestContentTags', {
        content_type: contentType,
        title,
        content: contentText,
        existing_tags: existingTags,
        max_tags: 10
    });

    const suggestions = response.data.suggested_tags || [];
    const highConfidenceTags = suggestions
        .filter(s => s.is_new && s.confidence >= (config.criteria.min_confidence || 0.7))
        .map(s => s.tag);

    const actions = [];
    let tagsAdded = [];

    if (config.auto_approve && highConfidenceTags.length > 0) {
        try {
            const updatedTags = [...new Set([...existingTags, ...highConfidenceTags])];
            
            switch (contentType) {
                case 'article':
                    await base44.asServiceRole.entities.Article.update(content.id, { tags: updatedTags });
                    break;
                case 'document':
                    await base44.asServiceRole.entities.Document.update(content.id, { tags: updatedTags });
                    break;
                case 'fact':
                    await base44.asServiceRole.entities.StrategicFact.update(content.id, { tags: updatedTags });
                    break;
            }

            tagsAdded = highConfidenceTags;
            actions.push({
                action_type: 'add_tags',
                status: 'success',
                details: { tags_added: highConfidenceTags.length }
            });
        } catch (error) {
            actions.push({
                action_type: 'add_tags',
                status: 'failed',
                details: { error: error.message }
            });
        }
    }

    return {
        status: actions.some(a => a.status === 'success') ? 'success' : 'pending_review',
        actions,
        confidence: Math.max(...suggestions.map(s => s.confidence), 0),
        reasoning: response.data.reasoning,
        tags_added: tagsAdded
    };
}

async function executeTrendSuggestions(base44, content, contentType, config) {
    // Analyze recent content trends
    const recentContent = await base44.asServiceRole.entities.Article.list('-created_date', 50);
    
    const trendPrompt = `Analyze content trends and suggest updates:

Current content: "${content.title}"
Tags: ${(content.tags || []).join(', ')}

Recent trending topics from platform:
${recentContent.slice(0, 10).map(c => `- ${c.title} (tags: ${(c.tags || []).join(', ')})`).join('\n')}

Suggest:
1. If current content should be updated based on trends
2. New content ideas related to emerging trends
3. Tags to add/remove for better discoverability

Return JSON with: should_update (boolean), update_suggestions (array), new_content_ideas (array), tag_changes (object)`;

    try {
        const trendAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt: trendPrompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    should_update: { type: "boolean" },
                    update_suggestions: {
                        type: "array",
                        items: { type: "string" }
                    },
                    new_content_ideas: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                relevance_score: { type: "number" }
                            }
                        }
                    },
                    tag_changes: {
                        type: "object",
                        properties: {
                            add: { type: "array", items: { type: "string" } },
                            remove: { type: "array", items: { type: "string" } }
                        }
                    }
                }
            }
        });

        const actions = [{
            action_type: 'create_suggestion',
            status: 'success',
            details: {
                should_update: trendAnalysis.should_update,
                suggestions_count: trendAnalysis.update_suggestions?.length || 0,
                ideas_count: trendAnalysis.new_content_ideas?.length || 0
            }
        }];

        return {
            status: 'success',
            actions,
            confidence: 0.8,
            reasoning: `Analyzed trends and generated ${trendAnalysis.new_content_ideas?.length || 0} content suggestions`,
            trend_suggestions: trendAnalysis
        };

    } catch (error) {
        return {
            status: 'failed',
            actions: [{
                action_type: 'create_suggestion',
                status: 'failed',
                details: { error: error.message }
            }],
            confidence: 0,
            reasoning: 'Failed to analyze trends',
            error: error.message
        };
    }
}

async function executeQualityCheck(base44, content, contentType, config) {
    const title = content.title || content.name || '';
    const contentText = content.body || content.detail || content.description || '';

    const qualityPrompt = `Perform quality check on this ${contentType}:

Title: ${title}
Content: ${contentText.substring(0, 3000)}

Evaluate:
1. Content completeness (1-10)
2. Accuracy/factual reliability (1-10)
3. Clarity and readability (1-10)
4. Depth of analysis (1-10)
5. Citation/source quality (1-10)

Return JSON with scores, overall_quality (1-10), issues (array), recommendations (array)`;

    try {
        const qualityAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt: qualityPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    completeness: { type: "number" },
                    accuracy: { type: "number" },
                    clarity: { type: "number" },
                    depth: { type: "number" },
                    citations: { type: "number" },
                    overall_quality: { type: "number" },
                    issues: {
                        type: "array",
                        items: { type: "string" }
                    },
                    recommendations: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        const flags = [];
        if (qualityAnalysis.overall_quality < 6) {
            flags.push({
                flag_type: 'low_quality',
                reason: `Overall quality score: ${qualityAnalysis.overall_quality}/10`,
                severity: 'high'
            });
        }

        if (qualityAnalysis.issues && qualityAnalysis.issues.length > 0) {
            qualityAnalysis.issues.forEach(issue => {
                flags.push({
                    flag_type: 'quality_issue',
                    reason: issue,
                    severity: 'medium'
                });
            });
        }

        return {
            status: flags.length > 0 ? 'pending_review' : 'success',
            actions: [{
                action_type: 'quality_check',
                status: 'success',
                details: qualityAnalysis
            }],
            confidence: qualityAnalysis.overall_quality / 10,
            reasoning: `Quality score: ${qualityAnalysis.overall_quality}/10`,
            flags_raised: flags,
            quality_analysis: qualityAnalysis
        };

    } catch (error) {
        return {
            status: 'failed',
            actions: [{
                action_type: 'quality_check',
                status: 'failed',
                details: { error: error.message }
            }],
            confidence: 0,
            reasoning: 'Failed to check quality',
            error: error.message
        };
    }
}

function calculateSuccessRate(config, isSuccess) {
    const currentCount = config.execution_count || 0;
    const currentRate = config.success_rate || 1.0;
    const successCount = Math.round(currentCount * currentRate);
    
    const newSuccessCount = isSuccess ? successCount + 1 : successCount;
    const newTotalCount = currentCount + 1;
    
    return newSuccessCount / newTotalCount;
}