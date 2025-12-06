import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("XAI_API_KEY"),
    baseURL: "https://api.x.ai/v1"
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { concept_name, concept_content } = await req.json();

        if (!concept_name || !concept_content) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const systemPrompt = `Você é um validador especializado no Protocolo HUA (Hierarquia, Utilidade, Aderência) para o Digital Twin de Marcos Prado Troyjo.

PROTOCOLO HUA - RESUMO:
- H (Hierarquia): Conceito está no nível correto de abstração? (0-100)
- U (Utilidade): Conceito tem uso prático demonstrável? (0-100)
- A (Aderência): Conceito alinhado com filosofia e valores de Troyjo? (0-100)

FILOSOFIA FUNDACIONAL DE TROYJO:
- Visão geoeconômica global
- Competitividade sistêmica
- Diplomacia econômica pragmática
- Estado de Direito e instituições fortes
- "Comércio com todos sem viés ideológico"
- Três coroas brasileiras: alimentos, energia, sustentabilidade
- Novo ESG: Economia + Segurança + Geopolítica

DECISÕES HUA:
- H≥80, U≥80, A≥80 → APROVAR
- H≥80, U≥80, A<80 → AJUSTAR (linguagem)
- A<30 → REJEITAR (violação de valores)
- Outros casos → AJUSTAR ou REJEITAR conforme análise

Analise o conceito e retorne JSON com scores e decisão.`;

        const response = await openai.chat.completions.create({
            model: "grok-beta",
            messages: [
                { role: "system", content: systemPrompt },
                { 
                    role: "user", 
                    content: `Valide este conceito pelo Protocolo HUA:

NOME: ${concept_name}

CONTEÚDO: ${concept_content}

Retorne análise completa em JSON.`
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "hua_validation",
                    schema: {
                        type: "object",
                        properties: {
                            h_score: { type: "number", description: "Score de Hierarquia (0-100)" },
                            u_score: { type: "number", description: "Score de Utilidade (0-100)" },
                            a_score: { type: "number", description: "Score de Aderência (0-100)" },
                            decision: { 
                                type: "string", 
                                enum: ["APROVAR", "AJUSTAR", "REJEITAR"],
                                description: "Decisão final HUA"
                            },
                            analysis: { 
                                type: "string", 
                                description: "Análise detalhada da validação"
                            },
                            hierarchy_justification: { type: "string" },
                            utility_justification: { type: "string" },
                            adherence_justification: { type: "string" },
                            recommended_adjustments: { 
                                type: "array", 
                                items: { type: "string" }
                            }
                        },
                        required: ["h_score", "u_score", "a_score", "decision", "analysis"]
                    }
                }
            }
        });

        const validation = JSON.parse(response.choices[0].message.content);

        return Response.json(validation);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});