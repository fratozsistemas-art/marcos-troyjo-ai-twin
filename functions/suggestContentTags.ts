import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit } from './utils/rateLimiter.js';
import { validateString, validateEnum, validateNumber } from './utils/inputValidator.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const rateCheck = checkRateLimit(user.email, 'suggestContentTags');
        if (!rateCheck.allowed) {
            return Response.json({ 
                error: 'Rate limit exceeded',
                retryAfter: rateCheck.retryAfter 
            }, { status: 429 });
        }

        const body = await req.json();

        // Input validation
        const contentType = validateEnum(
            body.content_type, 
            ['article', 'document', 'fact', 'publication', 'book', 'interview'],
            'content_type'
        );
        const title = validateString(body.title, { maxLength: 500, paramName: 'title' });
        const content = validateString(body.content, { maxLength: 50000, paramName: 'content' });
        const existingTags = body.existing_tags || [];
        const maxTags = validateNumber(body.max_tags || 10, { min: 1, max: 20, integer: true });

        // Build context for LLM
        let analysisContext = `Title: ${title}\n\n`;
        
        if (body.description) {
            analysisContext += `Description: ${validateString(body.description, { maxLength: 2000 })}\n\n`;
        }
        
        analysisContext += `Content:\n${content.substring(0, 10000)}\n\n`; // Limit for token efficiency
        
        if (existingTags.length > 0) {
            analysisContext += `Existing tags: ${existingTags.join(', ')}\n\n`;
        }

        // Call LLM for tag suggestions
        const tagSuggestionPrompt = `You are an expert content taxonomist specializing in geopolitics, economics, international trade, and strategic analysis.

Analyze the following ${contentType} and suggest relevant tags that accurately categorize its content.

${analysisContext}

Requirements:
1. Suggest ${maxTags} highly relevant tags
2. Tags should be:
   - Specific and descriptive
   - In Portuguese (BR) or English based on content language
   - Cover: geographic regions, topics, institutions, actors, time periods
   - Use established terminology from geopolitics/economics
3. Avoid generic tags like "interesting" or "important"
4. Consider: New ESG (Economy+Security+Geopolitics), Power-Shoring, Trust-based globalization, BRICS, Trampulence
5. Return ONLY a JSON array of tag strings, no additional text

Example format: ["brics", "energia_limpa", "brasil", "competitividade", "power_shoring"]`;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: tagSuggestionPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    suggested_tags: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of suggested tags"
                    },
                    confidence_scores: {
                        type: "array",
                        items: { type: "number" },
                        description: "Confidence score for each tag (0-1)"
                    },
                    reasoning: {
                        type: "string",
                        description: "Brief explanation of tag selection"
                    }
                }
            }
        });

        const suggestedTags = llmResponse.suggested_tags || [];
        const confidenceScores = llmResponse.confidence_scores || [];

        // Combine with existing tags and deduplicate
        const allTags = [...new Set([...existingTags, ...suggestedTags])];

        // Create response with metadata
        const tagSuggestions = suggestedTags.map((tag, idx) => ({
            tag,
            confidence: confidenceScores[idx] || 0.8,
            is_new: !existingTags.includes(tag)
        }));

        return Response.json({
            success: true,
            content_type: contentType,
            suggested_tags: tagSuggestions,
            reasoning: llmResponse.reasoning,
            all_tags: allTags,
            metadata: {
                analyzed_at: new Date().toISOString(),
                model_used: 'gpt-4o-mini',
                content_length: content.length
            }
        });

    } catch (error) {
        console.error('Error suggesting tags:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});