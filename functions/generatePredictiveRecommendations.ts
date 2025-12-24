import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar dados do usuário
        const [interactions, conversations, profile] = await Promise.all([
            base44.asServiceRole.entities.UserInteraction.filter(
                { user_email: user.email },
                '-created_date',
                50
            ),
            base44.agents.listConversations({ agent_name: 'troyjo_twin' }),
            base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email })
        ]);

        const userProfile = profile[0] || {};

        // Analisar padrões de interação
        const contentTypes = {};
        const topics = new Set();
        
        interactions.forEach(int => {
            contentTypes[int.content_type] = (contentTypes[int.content_type] || 0) + 1;
            if (int.content_metadata?.topics) {
                int.content_metadata.topics.forEach(t => topics.add(t));
            }
        });

        // Extrair tópicos das conversas recentes
        const conversationTopics = new Set();
        conversations.slice(0, 10).forEach(conv => {
            if (conv.metadata?.topics) {
                conv.metadata.topics.forEach(t => conversationTopics.add(t));
            }
        });

        // Gerar recomendações usando LLM
        const prompt = `
Você é um sistema de recomendações preditivas para o Troyjo Digital Twin.

Dados do usuário:
- Interesses declarados: ${userProfile.interests?.join(', ') || 'não especificado'}
- Nível de expertise: ${userProfile.expertise_level || 'intermediate'}
- Tipos de conteúdo mais acessados: ${Object.entries(contentTypes).map(([k,v]) => `${k}(${v})`).join(', ')}
- Tópicos frequentes: ${[...topics].slice(0, 10).join(', ')}
- Tópicos em conversas recentes: ${[...conversationTopics].slice(0, 5).join(', ')}

Baseado nestes dados, gere 5 recomendações personalizadas. Para cada recomendação:
1. Escolha o tipo (consultation_topic, article, study_module, research_area)
2. Forneça título atrativo e relevante
3. Descrição curta mas engajadora
4. Razão clara do porquê esta recomendação é relevante
5. Score de confiança (0.5 a 1.0)
6. 2-3 fatores de relevância

Foque em:
- Continuidade dos interesses do usuário
- Expansão natural do conhecimento
- Tópicos complementares não explorados
- Tendências geopolíticas atuais relevantes ao perfil

Responda APENAS com JSON no formato especificado.`;

        const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    recommendations: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'string' },
                                title: { type: 'string' },
                                description: { type: 'string' },
                                reasoning: { type: 'string' },
                                confidence: { type: 'number' },
                                relevance_factors: {
                                    type: 'array',
                                    items: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        });

        const recommendations = llmResponse.recommendations || [];

        // Salvar recomendações no banco
        const savedRecommendations = [];
        for (const rec of recommendations) {
            const saved = await base44.asServiceRole.entities.PredictiveRecommendation.create({
                user_email: user.email,
                recommendation_type: rec.type,
                title: rec.title,
                description: rec.description,
                reasoning: rec.reasoning,
                confidence_score: rec.confidence,
                relevance_factors: rec.relevance_factors || [],
                based_on: {
                    interactions: interactions.slice(0, 5).map(i => i.id),
                    conversations: conversations.slice(0, 3).map(c => c.id),
                    profile_data: { interests: userProfile.interests, expertise: userProfile.expertise_level }
                },
                priority: Math.round(rec.confidence * 10),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            });
            savedRecommendations.push(saved);
        }

        return Response.json({
            success: true,
            recommendations: savedRecommendations,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});