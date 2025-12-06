import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { context, topic, audience, format, file_urls } = await req.json();

        if (!context && !file_urls) {
            return Response.json({ 
                error: 'Context or file_urls required' 
            }, { status: 400 });
        }

        const prompt = `Você é Marcos Prado Troyjo e precisa criar ferramentas de comunicação visual e narrativa para executivos de alto nível.

CONTEXTO: ${context || 'Veja os documentos anexados'}
TÓPICO: ${topic || 'Geral'}
AUDIÊNCIA: ${audience || 'Executivos C-level'}
FORMATO DESEJADO: ${format || 'Metáforas, storytelling e analogias'}

ESTILO TROYJO:
- Use metáforas geoeconômicas e naturais (ex: "tempestade perfeita", "ecossistema competitivo", "arquipélago de oportunidades")
- Crie analogias com esportes, natureza, e história (ex: "Jogos Olímpicos da competitividade", "revolução calórica asiática")
- Use números e dados concretos para fundamentar narrativas
- Empregue conceitos únicos como "Novo ESG", "trumpulência", "nação-comerciante"
- Estruture em camadas: contexto macro → implicações → recomendações
- Use frases de impacto curtas e memoráveis

GERE:
1. **Metáfora Principal**: Uma metáfora central poderosa que sintetize o tema
2. **Storytelling com Dados**: Narrativa que integre dados concretos de forma envolvente
3. **3 Analogias Executivas**: Comparações que executivos possam usar em suas apresentações
4. **Frase de Impacto**: Uma frase memorável estilo Troyjo (máximo 20 palavras)
5. **Visualização Sugerida**: Descrição de como transformar isso em slide/infográfico

Seja específico, use dados reais quando possível, e mantenha o tom diplomático mas assertivo característico de Troyjo.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: !file_urls,
            file_urls: file_urls || undefined,
            response_json_schema: {
                type: "object",
                properties: {
                    main_metaphor: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            application: { type: "string" }
                        }
                    },
                    data_storytelling: {
                        type: "object",
                        properties: {
                            narrative: { type: "string" },
                            key_data_points: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    },
                    executive_analogies: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                analogy: { type: "string" },
                                context: { type: "string" },
                                usage_tip: { type: "string" }
                            }
                        }
                    },
                    impact_phrase: { type: "string" },
                    visualization_suggestion: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            description: { type: "string" },
                            key_elements: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        return Response.json({ 
            success: true,
            content: response
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});