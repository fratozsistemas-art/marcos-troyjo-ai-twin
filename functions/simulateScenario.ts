import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { scenario_description, affected_regions, risk_types, time_horizon } = await req.json();

        if (!scenario_description) {
            return Response.json({ error: 'Scenario description is required' }, { status: 400 });
        }

        // Fetch relevant risks and context
        const filters = {};
        if (affected_regions?.length > 0) {
            filters.region = { $in: affected_regions };
        }
        if (risk_types?.length > 0) {
            filters.risk_type = { $in: risk_types };
        }

        const existingRisks = await base44.asServiceRole.entities.GeopoliticalRisk.filter(filters);

        // Get recent relevant articles
        const recentArticles = await base44.asServiceRole.entities.Article.filter({
            status: 'publicado',
            publication_date: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }
        });

        // Use LLM to simulate scenario
        const prompt = `
You are a geopolitical analyst conducting scenario simulation and impact assessment.

Scenario to simulate:
${scenario_description}

Affected regions: ${affected_regions?.join(', ') || 'Global'}
Risk types involved: ${risk_types?.join(', ') || 'Multiple'}
Time horizon: ${time_horizon || '12 months'}

Current risk landscape:
${existingRisks.slice(0, 10).map(r => `- ${r.title} (${r.severity}): ${r.summary || r.description?.substring(0, 100)}`).join('\n')}

Recent geopolitical context:
${recentArticles.slice(0, 5).map(a => `- ${a.title}: ${a.summary}`).join('\n')}

Simulate this scenario and provide:
1. Immediate market impacts (equity, currency, commodities)
2. Economic impacts by region/sector
3. Political/diplomatic consequences
4. Supply chain disruptions
5. Probability of occurrence (%)
6. Cascading effects and secondary risks
7. Mitigation strategies
8. Key indicators to monitor

Format as JSON.
`;

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    scenario_name: { type: "string" },
                    probability_of_occurrence: { type: "number" },
                    market_impacts: {
                        type: "object",
                        properties: {
                            equity_markets: { type: "string" },
                            currencies: { type: "string" },
                            commodities: { type: "string" },
                            bonds: { type: "string" }
                        }
                    },
                    economic_impacts: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                region: { type: "string" },
                                sector: { type: "string" },
                                impact_description: { type: "string" },
                                severity: { type: "string" }
                            }
                        }
                    },
                    political_consequences: { type: "array", items: { type: "string" } },
                    supply_chain_impacts: { type: "array", items: { type: "string" } },
                    cascading_effects: { type: "array", items: { type: "string" } },
                    mitigation_strategies: { type: "array", items: { type: "string" } },
                    monitoring_indicators: { type: "array", items: { type: "string" } },
                    confidence_level: { type: "string" },
                    time_to_impact: { type: "string" }
                }
            }
        });

        return Response.json({
            scenario: scenario_description,
            simulation: response,
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error simulating scenario:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});