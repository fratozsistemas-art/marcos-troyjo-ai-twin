import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all conversations for the user
        const conversations = await base44.asServiceRole.agents.listConversations({
            agent_name: "troyjo_twin"
        });

        if (!conversations || conversations.length === 0) {
            return Response.json({ 
                message: 'No conversations to analyze yet',
                insights: []
            });
        }

        // Get full conversation details
        const fullConversations = await Promise.all(
            conversations.slice(0, 10).map(conv => 
                base44.asServiceRole.agents.getConversation(conv.id)
            )
        );

        // Extract conversation summaries
        const conversationSummaries = fullConversations.map(conv => {
            const userMessages = conv.messages?.filter(m => m.role === 'user') || [];
            const topics = userMessages.map(m => m.content?.substring(0, 200)).join(' | ');
            return {
                date: new Date(conv.created_date).toLocaleDateString(),
                topics: topics
            };
        });

        // Generate insights using AI
        const analysisPrompt = `Você é um sistema de análise inteligente do Digital Twin de Marcos Prado Troyjo.

Analise o histórico de conversas abaixo e identifique:
1. Padrões recorrentes de interesse do usuário
2. Tendências ou temas emergentes
3. Conexões entre diferentes tópicos discutidos
4. Recomendações de exploração baseadas no padrão de perguntas

Conversas analisadas:
${JSON.stringify(conversationSummaries, null, 2)}

Gere 2-3 insights concisos e relevantes em formato JSON com a estrutura:
[{
  "title": "Título curto e impactante",
  "content": "Descrição do insight em 2-3 frases",
  "category": "pattern|trend|connection|recommendation",
  "topics": ["tópico1", "tópico2"]
}]

IMPORTANTE: 
- Seja específico sobre economia global, comércio, BRICS, competitividade
- Conecte com a expertise de Marcos Troyjo
- Mantenha tom diplomático e analítico
- Forneça valor real ao usuário`;

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    insights: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                content: { type: "string" },
                                category: { type: "string" },
                                topics: { type: "array", items: { type: "string" } }
                            }
                        }
                    }
                }
            }
        });

        const insights = response.insights || [];

        // Store insights
        const conversationIds = conversations.slice(0, 10).map(c => c.id);
        const storedInsights = await Promise.all(
            insights.map(insight =>
                base44.asServiceRole.entities.Insight.create({
                    title: insight.title,
                    content: insight.content,
                    category: insight.category || 'pattern',
                    topics: insight.topics || [],
                    conversation_ids: conversationIds
                })
            )
        );

        return Response.json({
            message: 'Insights generated successfully',
            count: storedInsights.length,
            insights: storedInsights
        });

    } catch (error) {
        console.error('Error generating insights:', error);
        return Response.json({ 
            error: error.message || 'Failed to generate insights' 
        }, { status: 500 });
    }
});