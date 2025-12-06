import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user profile and history
        const [profile, history, documents] = await Promise.all([
            base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }),
            base44.asServiceRole.entities.AIHistory.list('-created_date', 20),
            base44.asServiceRole.entities.Document.list('-usage_count', 10)
        ]);

        const userProfile = profile[0] || { interests: {} };
        
        // Build context about user behavior
        const historyContext = history.map(h => ({
            type: h.function_type,
            title: h.title,
            topics: h.inputs?.topic || h.inputs?.context?.substring(0, 100)
        }));

        const prompt = `Você é Marcos Prado Troyjo analisando padrões de uso.

PERFIL DO USUÁRIO:
${JSON.stringify(userProfile.interests, null, 2)}

HISTÓRICO RECENTE:
${JSON.stringify(historyContext, null, 2)}

DOCUMENTOS DISPONÍVEIS (top 5):
${documents.slice(0, 5).map(d => `- ${d.title} (usado ${d.usage_count || 0}x)`).join('\n')}

Com base nesses dados, gere sugestões proativas:

1. TÓPICOS RELEVANTES: 3 tópicos de economia global que podem interessar
2. DOCUMENTOS SUGERIDOS: IDs de documentos que podem ser úteis agora
3. FUNÇÕES RECOMENDADAS: Que funções de IA (metaphors, interview, article, assessment) podem ajudar
4. INSIGHTS: Observações sobre padrões de uso

Retorne JSON estruturado.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    suggested_topics: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" },
                                relevance_reason: { type: "string" }
                            }
                        }
                    },
                    suggested_documents: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                document_id: { type: "string" },
                                reason: { type: "string" }
                            }
                        }
                    },
                    recommended_functions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                function_type: { type: "string" },
                                use_case: { type: "string" }
                            }
                        }
                    },
                    usage_insights: { type: "string" }
                }
            }
        });

        // Enrich with actual document data
        const enrichedDocuments = await Promise.all(
            (response.suggested_documents || []).map(async (suggestion) => {
                try {
                    const doc = documents.find(d => d.id === suggestion.document_id);
                    return doc ? { ...doc, reason: suggestion.reason } : null;
                } catch {
                    return null;
                }
            })
        );

        return Response.json({
            ...response,
            suggested_documents: enrichedDocuments.filter(Boolean)
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});