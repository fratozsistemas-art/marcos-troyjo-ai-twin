import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit } from './utils/rateLimiter.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const rateCheck = checkRateLimit(user.email, 'analyzeTrendsAndSuggest');
        if (!rateCheck.allowed) {
            return Response.json({ 
                error: 'Rate limit exceeded',
                retryAfter: rateCheck.retryAfter 
            }, { status: 429 });
        }

        const body = await req.json();
        const timeframe = body.timeframe || 30; // days
        const minRelevance = body.min_relevance || 0.7;

        // Fetch recent articles, interactions, and geopolitical data
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeframe);

        const [recentArticles, recentInteractions, geopoliticalRisks] = await Promise.all([
            base44.asServiceRole.entities.Article.filter({
                created_date: { $gte: cutoffDate.toISOString() }
            }),
            base44.asServiceRole.entities.UserInteraction.filter({
                created_date: { $gte: cutoffDate.toISOString() }
            }),
            base44.asServiceRole.entities.GeopoliticalRisk.filter({
                status: 'active'
            })
        ]);

        // Analyze trends
        const trendPrompt = `You are a strategic content analyst specializing in geopolitics and economics.

Analyze the following data to identify emerging trends and content opportunities:

Recent Articles (last ${timeframe} days):
${recentArticles.slice(0, 20).map(a => `- ${a.title} | Tags: ${(a.tags || []).join(', ')}`).join('\n')}

User Engagement Patterns:
${(() => {
    const topics = {};
    recentInteractions.forEach(i => {
        const topic = i.content_type;
        topics[topic] = (topics[topic] || 0) + 1;
    });
    return Object.entries(topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic, count]) => `- ${topic}: ${count} interactions`)
        .join('\n');
})()}

Active Geopolitical Risks:
${geopoliticalRisks.slice(0, 10).map(r => `- ${r.title} (${r.category})`).join('\n')}

Task:
1. Identify 3-5 emerging trends in global economics/geopolitics
2. For each trend, suggest 2-3 content ideas with:
   - Title
   - Summary (2-3 sentences)
   - Recommended content type (article, policy_brief, analysis)
   - Suggested tags
   - Strategic relevance score (0-1)
   - Target audience
3. Identify content gaps (topics with high engagement but limited content)
4. Suggest updates to existing content based on trend shifts

Focus on: Power-Shoring, New ESG (Economy+Security+Geopolitics), Trust-based globalization, BRICS dynamics, Trampulence`;

        const trendAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt: trendPrompt,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    emerging_trends: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                trend_name: { type: "string" },
                                description: { type: "string" },
                                momentum: { type: "string" },
                                content_ideas: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            title: { type: "string" },
                                            summary: { type: "string" },
                                            content_type: { type: "string" },
                                            suggested_tags: { 
                                                type: "array",
                                                items: { type: "string" }
                                            },
                                            relevance_score: { type: "number" },
                                            target_audience: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    content_gaps: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                topic: { type: "string" },
                                reason: { type: "string" },
                                priority: { type: "string" }
                            }
                        }
                    },
                    update_recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                article_id: { type: "string" },
                                article_title: { type: "string" },
                                suggested_updates: { type: "array", items: { type: "string" } },
                                reason: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        // Filter by relevance
        const filteredTrends = trendAnalysis.emerging_trends?.map(trend => ({
            ...trend,
            content_ideas: trend.content_ideas?.filter(idea => 
                idea.relevance_score >= minRelevance
            )
        })).filter(trend => trend.content_ideas?.length > 0);

        return Response.json({
            success: true,
            emerging_trends: filteredTrends,
            content_gaps: trendAnalysis.content_gaps,
            update_recommendations: trendAnalysis.update_recommendations,
            metadata: {
                analyzed_at: new Date().toISOString(),
                timeframe_days: timeframe,
                articles_analyzed: recentArticles.length,
                interactions_analyzed: recentInteractions.length,
                risks_analyzed: geopoliticalRisks.length
            }
        });

    } catch (error) {
        console.error('Error analyzing trends:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});