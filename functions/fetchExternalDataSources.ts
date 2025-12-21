import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { method } = await req.json();

        // Fetch user interests for personalization
        const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
        const interests = profiles[0]?.interests || {};
        const regions = interests.regions || [];
        const topics = interests.topics || [];

        let result = {};

        if (method === 'news') {
            // Fetch geopolitical news
            const newsPrompt = `Busque as 5 notícias mais relevantes sobre geopolítica das últimas 24 horas, focando em: ${regions.join(', ')}. Tópicos de interesse: ${topics.join(', ')}. 
            
            Para cada notícia, forneça:
            - title: título da notícia
            - summary: resumo em 2-3 linhas
            - source: fonte
            - url: link
            - relevance_score: relevância geopolítica (1-10)
            - regions: regiões afetadas
            - sentiment: positivo/neutro/negativo`;

            const newsData = await base44.integrations.Core.InvokeLLM({
                prompt: newsPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        news: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    summary: { type: 'string' },
                                    source: { type: 'string' },
                                    url: { type: 'string' },
                                    relevance_score: { type: 'number' },
                                    regions: { type: 'array', items: { type: 'string' } },
                                    sentiment: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            });

            result = newsData;
        } else if (method === 'economic') {
            // Fetch economic indicators
            const economicPrompt = `Busque os principais indicadores econômicos atualizados para: ${regions.join(', ')}. 
            
            Para cada região, forneça:
            - region: nome da região/país
            - gdp_growth: crescimento do PIB (%)
            - inflation: inflação (%)
            - unemployment: desemprego (%)
            - trade_balance: balança comercial (em bilhões USD)
            - currency_rate: taxa de câmbio vs USD
            - last_updated: data da última atualização
            - trend: tendência (up/down/stable)
            - analysis: análise breve em 2-3 linhas`;

            const economicData = await base44.integrations.Core.InvokeLLM({
                prompt: economicPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        indicators: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    region: { type: 'string' },
                                    gdp_growth: { type: 'number' },
                                    inflation: { type: 'number' },
                                    unemployment: { type: 'number' },
                                    trade_balance: { type: 'number' },
                                    currency_rate: { type: 'number' },
                                    last_updated: { type: 'string' },
                                    trend: { type: 'string' },
                                    analysis: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            });

            result = economicData;
        } else if (method === 'sentiment') {
            // Fetch social media sentiment
            const sentimentPrompt = `Analise o sentimento nas redes sociais sobre eventos geopolíticos recentes relacionados a: ${regions.join(', ')} e ${topics.join(', ')}.
            
            Para cada tópico/evento, forneça:
            - topic: tópico ou evento
            - sentiment_score: score de sentimento (-1.0 a 1.0)
            - positive_percentage: % de menções positivas
            - negative_percentage: % de menções negativas
            - neutral_percentage: % de menções neutras
            - volume: volume de menções (alto/médio/baixo)
            - trending_hashtags: hashtags em alta relacionadas
            - key_themes: temas principais das discussões
            - regional_breakdown: sentimento por região`;

            const sentimentData = await base44.integrations.Core.InvokeLLM({
                prompt: sentimentPrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        sentiment_analysis: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    topic: { type: 'string' },
                                    sentiment_score: { type: 'number' },
                                    positive_percentage: { type: 'number' },
                                    negative_percentage: { type: 'number' },
                                    neutral_percentage: { type: 'number' },
                                    volume: { type: 'string' },
                                    trending_hashtags: { type: 'array', items: { type: 'string' } },
                                    key_themes: { type: 'array', items: { type: 'string' } },
                                    regional_breakdown: { type: 'object' }
                                }
                            }
                        }
                    }
                }
            });

            result = sentimentData;
        } else if (method === 'all') {
            // Fetch all data sources in parallel
            const [newsData, economicData, sentimentData] = await Promise.all([
                base44.integrations.Core.InvokeLLM({
                    prompt: `Busque as 3 notícias geopolíticas mais relevantes das últimas 24 horas sobre: ${regions.join(', ')}`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            news: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                        summary: { type: 'string' },
                                        source: { type: 'string' },
                                        url: { type: 'string' },
                                        relevance_score: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                }),
                base44.integrations.Core.InvokeLLM({
                    prompt: `Busque indicadores econômicos atuais para: ${regions.slice(0, 3).join(', ')}`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            indicators: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        region: { type: 'string' },
                                        gdp_growth: { type: 'number' },
                                        inflation: { type: 'number' },
                                        trend: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }),
                base44.integrations.Core.InvokeLLM({
                    prompt: `Analise o sentimento nas redes sociais sobre eventos geopolíticos recentes: ${topics.slice(0, 3).join(', ')}`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: 'object',
                        properties: {
                            sentiment_analysis: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        topic: { type: 'string' },
                                        sentiment_score: { type: 'number' },
                                        volume: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                })
            ]);

            result = {
                news: newsData.news || [],
                indicators: economicData.indicators || [],
                sentiment: sentimentData.sentiment_analysis || []
            };
        }

        return Response.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching external data:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});