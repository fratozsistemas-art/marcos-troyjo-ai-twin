import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_id } = await req.json();
        
        if (!conversation_id) {
            return Response.json({ error: 'conversation_id is required' }, { status: 400 });
        }

        // Get conversation
        const conversation = await base44.agents.getConversation(conversation_id);
        
        if (!conversation) {
            return Response.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Check if analysis is needed (every 72 hours)
        const lastAnalysis = conversation.metadata?.last_theme_analysis;
        const now = new Date();
        
        if (lastAnalysis) {
            const hoursSinceLastAnalysis = (now - new Date(lastAnalysis)) / (1000 * 60 * 60);
            if (hoursSinceLastAnalysis < 72) {
                return Response.json({
                    needs_analysis: false,
                    hours_remaining: Math.ceil(72 - hoursSinceLastAnalysis),
                    current_name: conversation.metadata?.name
                });
            }
        }

        // Extract message content
        const messages = conversation.messages || [];
        const userMessages = messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join('\n\n');

        if (!userMessages) {
            return Response.json({ 
                error: 'No user messages found',
                needs_analysis: false 
            }, { status: 400 });
        }

        // Analyze theme with LLM
        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: `Analise as mensagens de usuário desta conversa e identifique o tema predominante.

Mensagens:
${userMessages}

IMPORTANTE:
- Crie um nome conciso e descritivo (máximo 5 palavras)
- O nome deve refletir o tema principal discutido
- Use linguagem profissional
- Se houver múltiplos temas, escolha o mais recorrente ou importante
- Exemplos: "Competitividade do Brasil", "BRICS e Mercados Emergentes", "Transição Energética Global"

Retorne em formato JSON:`,
            response_json_schema: {
                type: "object",
                properties: {
                    suggested_name: { 
                        type: "string",
                        description: "Nome sugerido para a conversa"
                    },
                    primary_theme: { 
                        type: "string",
                        description: "Tema principal identificado"
                    },
                    secondary_themes: {
                        type: "array",
                        items: { type: "string" },
                        description: "Temas secundários"
                    },
                    confidence: {
                        type: "number",
                        description: "Nível de confiança na análise (0-100)"
                    },
                    reasoning: {
                        type: "string",
                        description: "Justificativa para o nome sugerido"
                    }
                },
                required: ["suggested_name", "primary_theme", "confidence"]
            }
        });

        // Update conversation metadata with pending rename
        await base44.agents.updateConversation(conversation_id, {
            metadata: {
                ...conversation.metadata,
                last_theme_analysis: now.toISOString(),
                pending_rename: {
                    suggested_name: analysis.suggested_name,
                    primary_theme: analysis.primary_theme,
                    secondary_themes: analysis.secondary_themes || [],
                    confidence: analysis.confidence,
                    reasoning: analysis.reasoning,
                    analyzed_at: now.toISOString(),
                    status: 'pending'
                }
            }
        });

        return Response.json({
            needs_analysis: true,
            current_name: conversation.metadata?.name,
            suggested_name: analysis.suggested_name,
            primary_theme: analysis.primary_theme,
            secondary_themes: analysis.secondary_themes || [],
            confidence: analysis.confidence,
            reasoning: analysis.reasoning,
            analyzed_at: now.toISOString()
        });

    } catch (error) {
        console.error('Error analyzing conversation theme:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});