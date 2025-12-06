import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { period = 'weekly' } = await req.json();

        // Get user profile with topic history
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        
        if (profiles.length === 0) {
            return Response.json({ error: 'No profile found' }, { status: 404 });
        }

        const profile = profiles[0];
        const topicHistory = profile.topic_history || [];

        // Calculate date range
        const now = new Date();
        const daysAgo = period === 'weekly' ? 7 : 30;
        const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

        // Filter topics within period
        const recentTopics = topicHistory.filter(t => {
            const lastDiscussed = new Date(t.last_discussed);
            return lastDiscussed >= startDate;
        });

        // Sort by count to get top topics
        const topTopics = recentTopics
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Get conversations for these topics
        const conversations = await base44.agents.listConversations({
            agent_name: "troyjo_twin"
        });

        const conversationsWithTopics = conversations.filter(conv => 
            conv.created_date && new Date(conv.created_date) >= startDate
        );

        // Generate AI summary for each top topic
        const topicSummaries = await Promise.all(
            topTopics.map(async (topic) => {
                // Find relevant conversation excerpts
                const relevantMessages = [];
                
                for (const conv of conversationsWithTopics) {
                    if (conv.messages) {
                        const topicMessages = conv.messages.filter(m => 
                            m.role === 'user' && 
                            m.content.toLowerCase().includes(topic.topic.toLowerCase())
                        );
                        relevantMessages.push(...topicMessages.slice(0, 2));
                    }
                }

                // Generate AI summary using excerpts
                const excerpts = relevantMessages.map(m => m.content).join('\n\n');
                
                let summary = '';
                if (excerpts) {
                    const summaryResponse = await base44.integrations.Core.InvokeLLM({
                        prompt: `Analise as seguintes discussões sobre "${topic.topic}" e gere um resumo executivo dos principais pontos discutidos, tendências identificadas e insights relevantes. Seja conciso (máximo 150 palavras):\n\n${excerpts}`,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                summary: { type: "string" },
                                key_points: { type: "array", items: { type: "string" } },
                                trend: { type: "string" }
                            }
                        }
                    });
                    
                    summary = summaryResponse;
                } else {
                    summary = {
                        summary: `Tópico discutido ${topic.count} vezes no período.`,
                        key_points: [],
                        trend: 'stable'
                    };
                }

                return {
                    topic: topic.topic,
                    count: topic.count,
                    last_discussed: topic.last_discussed,
                    summary: summary.summary,
                    key_points: summary.key_points || [],
                    trend: summary.trend || 'stable',
                    excerpts: relevantMessages.slice(0, 3).map(m => ({
                        content: m.content.slice(0, 200) + (m.content.length > 200 ? '...' : ''),
                        timestamp: m.created_date || new Date().toISOString()
                    }))
                };
            })
        );

        // Generate overall report summary
        const reportSummary = await base44.integrations.Core.InvokeLLM({
            prompt: `Com base nos seguintes tópicos mais discutidos em ${period === 'weekly' ? 'esta semana' : 'este mês'}, gere um resumo executivo sobre os principais interesses e tendências do usuário:\n\n${topicSummaries.map(t => `- ${t.topic}: ${t.count} discussões`).join('\n')}`,
            response_json_schema: {
                type: "object",
                properties: {
                    overview: { type: "string" },
                    recommendations: { type: "array", items: { type: "string" } }
                }
            }
        });

        const report = {
            period,
            date_range: {
                start: startDate.toISOString(),
                end: now.toISOString()
            },
            overview: reportSummary.overview,
            recommendations: reportSummary.recommendations || [],
            total_topics: recentTopics.length,
            total_conversations: conversationsWithTopics.length,
            top_topics: topicSummaries,
            generated_at: now.toISOString()
        };

        return Response.json(report);
    } catch (error) {
        console.error('Error generating topic report:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});