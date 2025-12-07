import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { checkRateLimit } from './utils/rateLimiter.js';
import { logAccess } from './utils/accessControl.js';
import { watermarkContent } from './utils/watermark.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const rateCheck = checkRateLimit(user.email, 'prepareInterview');
        if (!rateCheck.allowed) {
            return Response.json({ 
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: rateCheck.retryAfter 
            }, { status: 429 });
        }

        const { interviewer_profile, topic, context, file_urls } = await req.json();

        if (!topic) {
            return Response.json({ 
                error: 'Topic is required' 
            }, { status: 400 });
        }

        const prompt = `Você é Marcos Prado Troyjo se preparando para uma entrevista importante.

PERFIL DO ENTREVISTADOR: ${interviewer_profile || 'Não especificado'}
TEMA PRINCIPAL: ${topic}
CONTEXTO ADICIONAL: ${context || 'Entrevista geral'}

ARQUIVOS DE REFERÊNCIA: ${file_urls ? 'Anexados' : 'Nenhum'}

OBJETIVOS DA PREPARAÇÃO:
1. Antecipar perguntas prováveis baseadas no perfil do entrevistador/veículo
2. Preparar respostas no estilo Troyjo (dados + metáforas + pragmatismo)
3. Identificar pontos-chave a enfatizar
4. Prever possíveis armadilhas ou perguntas controversas
5. Sugerir "talking points" memoráveis

ESTILO DE RESPOSTA TROYJO:
- Sempre fundamentado em dados e evidências
- Uso de metáforas geoeconômicas
- Referências históricas e comparações internacionais
- Abordagem pragmática sem viés ideológico
- Foco em competitividade e inserção global do Brasil
- Reconhecimento de nuances e complexidades

GERE:
1. **Perfil do Entrevistador/Veículo**: Análise do viés e estilo típico
2. **10 Perguntas Prováveis**: Com nível de dificuldade e intenção
3. **Respostas Sugeridas**: Para cada pergunta, no estilo Troyjo
4. **Mensagens-Chave**: 5 talking points que devem ser inseridos
5. **Red Lines**: Tópicos/abordagens a evitar
6. **Oportunidades de Destaque**: Momentos para frases de impacto
7. **Follow-up Preparation**: Perguntas de follow-up esperadas

Seja estratégico e antecipe diferentes ângulos de questionamento.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: !file_urls,
            file_urls: file_urls || undefined,
            response_json_schema: {
                type: "object",
                properties: {
                    interviewer_profile: {
                        type: "object",
                        properties: {
                            analysis: { type: "string" },
                            typical_bias: { type: "string" },
                            approach_style: { type: "string" }
                        }
                    },
                    probable_questions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                question: { type: "string" },
                                difficulty: { type: "string" },
                                intent: { type: "string" },
                                suggested_answer: { type: "string" },
                                key_points: {
                                    type: "array",
                                    items: { type: "string" }
                                }
                            }
                        }
                    },
                    key_messages: {
                        type: "array",
                        items: { type: "string" }
                    },
                    red_lines: {
                        type: "array",
                        items: { type: "string" }
                    },
                    impact_opportunities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                moment: { type: "string" },
                                suggested_phrase: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        // Log access
        await logAccess(req, 'create', 'interview_prep', topic, {
            has_documents: !!file_urls
        });

        // Watermark sensitive sections
        if (response.probable_questions) {
            for (const q of response.probable_questions) {
                const watermarked = await watermarkContent(req, q.suggested_answer, 'interview_answer');
                q.suggested_answer = watermarked.content;
            }
        }

        return Response.json(response);

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});