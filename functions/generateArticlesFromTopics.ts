import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { batch_size = 5, filter_by_frequency = false, min_frequency = 3 } = await req.json();

        // Get all tracked topics
        const userProfiles = await base44.asServiceRole.entities.UserProfile.list();
        const topicsMap = new Map();

        // Aggregate topics from all users
        for (const profile of userProfiles) {
            if (profile.topics && Array.isArray(profile.topics)) {
                for (const topic of profile.topics) {
                    if (topicsMap.has(topic.name)) {
                        const existing = topicsMap.get(topic.name);
                        existing.frequency += topic.frequency || 1;
                        existing.last_seen = new Date(Math.max(
                            new Date(existing.last_seen),
                            new Date(topic.last_seen)
                        ));
                    } else {
                        topicsMap.set(topic.name, {
                            name: topic.name,
                            frequency: topic.frequency || 1,
                            last_seen: topic.last_seen || new Date().toISOString()
                        });
                    }
                }
            }
        }

        // Convert to array and filter
        let topics = Array.from(topicsMap.values());
        
        if (filter_by_frequency) {
            topics = topics.filter(t => t.frequency >= min_frequency);
        }

        // Sort by frequency (most frequent first)
        topics.sort((a, b) => b.frequency - a.frequency);

        // Limit batch size
        const topicsToProcess = topics.slice(0, batch_size);

        // Check which topics already have articles
        const existingArticles = await base44.asServiceRole.entities.Article.list();
        const existingTitles = new Set(existingArticles.map(a => a.title.toLowerCase()));

        const results = [];
        
        for (const topic of topicsToProcess) {
            // Skip if article already exists
            if (existingTitles.has(topic.name.toLowerCase())) {
                results.push({
                    topic: topic.name,
                    status: 'skipped',
                    reason: 'article_exists'
                });
                continue;
            }

            try {
                // Generate deep article
                const articleResponse = await base44.asServiceRole.functions.invoke('draftArticle', {
                    topic: topic.name,
                    tone: 'analytical and diplomatic',
                    length: 'long',
                    use_rag: false
                });

                if (!articleResponse.data?.body) {
                    results.push({
                        topic: topic.name,
                        status: 'failed',
                        reason: 'empty_response'
                    });
                    continue;
                }

                // Generate SEO metadata
                const seoPrompt = `Para o artigo sobre "${topic.name}", gere:
1. SEO Title (max 60 chars)
2. Meta Description (max 160 chars)
3. 5 Keywords relevantes

Formato JSON: {"seo_title": "...", "seo_description": "...", "seo_keywords": ["...", "..."]}`;

                const seoResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                    prompt: seoPrompt,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            seo_title: { type: "string" },
                            seo_description: { type: "string" },
                            seo_keywords: { type: "array", items: { type: "string" } }
                        }
                    }
                });

                // Create article
                const article = await base44.asServiceRole.entities.Article.create({
                    title: topic.name,
                    subtitle: `Análise Profunda: ${topic.name}`,
                    type: 'opiniao',
                    summary: articleResponse.data.body.substring(0, 300) + '...',
                    body: articleResponse.data.body,
                    seo_title: seoResponse.seo_title || topic.name,
                    seo_description: seoResponse.seo_description || '',
                    seo_keywords: seoResponse.seo_keywords || [],
                    authors: ['Marcos Troyjo'],
                    tags: [topic.name],
                    status: 'revisao',
                    quality_tier: 'ai_generated',
                    approval_status: 'pendente',
                    reading_time: articleResponse.data.estimated_reading_time,
                    version_history: [{
                        version: 1,
                        edited_by: 'AI System',
                        edited_at: new Date().toISOString(),
                        changes: 'Geração automática via tópicos mapeados',
                        tier_change: 'ai_generated'
                    }]
                });

                // Create notification
                await base44.asServiceRole.entities.UserNotification.create({
                    user_email: user.email,
                    title: 'Artigo Gerado Automaticamente',
                    message: `Artigo sobre "${topic.name}" foi gerado e aguarda revisão.`,
                    type: 'success',
                    category: 'content',
                    action_url: `/article/${article.id}`
                });

                results.push({
                    topic: topic.name,
                    status: 'success',
                    article_id: article.id,
                    word_count: articleResponse.data.body.split(' ').length
                });

            } catch (error) {
                console.error(`Error generating article for ${topic.name}:`, error);
                results.push({
                    topic: topic.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return Response.json({
            total_topics: topics.length,
            processed: topicsToProcess.length,
            results,
            summary: {
                success: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status === 'failed').length,
                skipped: results.filter(r => r.status === 'skipped').length
            }
        });

    } catch (error) {
        console.error('Error generating articles from topics:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});