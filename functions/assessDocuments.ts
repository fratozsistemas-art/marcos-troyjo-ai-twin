import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_urls, assessment_focus, context } = await req.json();

        if (!file_urls || !Array.isArray(file_urls) || file_urls.length === 0) {
            return Response.json({ 
                error: 'At least one file_url is required' 
            }, { status: 400 });
        }

        const focus = assessment_focus || 'Análise geral com a lente Troyjo';
        const additionalContext = context || '';

        const prompt = `Você é Marcos Prado Troyjo analisando documentos com sua perspectiva única de economista, diplomata e ex-presidente do Banco dos BRICS.

DOCUMENTOS: Anexados (${file_urls.length} arquivo(s))
FOCO DA ANÁLISE: ${focus}
CONTEXTO ADICIONAL: ${additionalContext}

LENTES ANALÍTICAS TROYJO:
1. **Geoeconomia**: Como isso se insere nas dinâmicas de poder econômico global?
2. **Competitividade Sistêmica**: Impacto na capacidade competitiva das nações/empresas?
3. **Brasil-Centrismo Realista**: Oportunidades e riscos para o Brasil?
4. **Diplomacia Econômica**: Implicações para negociações multilaterais?
5. **Novo ESG**: Economia + Segurança + Geopolítica - como se conectam?
6. **Pragmatismo**: Propostas viáveis vs. retórica?

FRAMEWORK DE ANÁLISE:
- Identifique dados-chave e tendências
- Avalie premissas e vieses
- Compare com benchmarks internacionais
- Projete cenários e implicações
- Formule recomendações pragmáticas

GERE uma análise completa e estruturada, usando o vocabulário e heurísticas características de Troyjo.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            file_urls: file_urls,
            response_json_schema: {
                type: "object",
                properties: {
                    executive_summary: { type: "string" },
                    key_findings: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                finding: { type: "string" },
                                implication: { type: "string" },
                                data_support: { type: "string" }
                            }
                        }
                    },
                    geoeconomic_analysis: {
                        type: "object",
                        properties: {
                            global_context: { type: "string" },
                            power_dynamics: { type: "string" },
                            trend_assessment: { type: "string" }
                        }
                    },
                    competitiveness_impact: {
                        type: "object",
                        properties: {
                            opportunities: {
                                type: "array",
                                items: { type: "string" }
                            },
                            challenges: {
                                type: "array",
                                items: { type: "string" }
                            },
                            competitive_positioning: { type: "string" }
                        }
                    },
                    brazil_lens: {
                        type: "object",
                        properties: {
                            relevance_for_brazil: { type: "string" },
                            strategic_opportunities: {
                                type: "array",
                                items: { type: "string" }
                            },
                            risks_to_monitor: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    },
                    new_esg_assessment: {
                        type: "object",
                        properties: {
                            economy_dimension: { type: "string" },
                            security_dimension: { type: "string" },
                            geopolitics_dimension: { type: "string" },
                            interconnections: { type: "string" }
                        }
                    },
                    pragmatic_recommendations: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                recommendation: { type: "string" },
                                rationale: { type: "string" },
                                feasibility: { type: "string" },
                                timeline: { type: "string" }
                            }
                        }
                    },
                    troyjo_metaphors: {
                        type: "array",
                        items: { type: "string" }
                    },
                    red_flags: {
                        type: "array",
                        items: { type: "string" }
                    },
                    further_research_needed: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({ 
            success: true,
            assessment: response,
            documents_analyzed: file_urls.length
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});