import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin/service role access
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use xAI to fetch and summarize geopolitical risks
        const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
        if (!XAI_API_KEY) {
            return Response.json({ error: 'XAI_API_KEY not configured' }, { status: 500 });
        }

        // Get current risks from database
        const existingRisks = await base44.asServiceRole.entities.GeopoliticalRisk.filter({
            active: true
        });

        // Use LLM to fetch latest geopolitical risks with internet context
        const riskAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a geopolitical risk analyst. Based on current global events (December 2025), identify and analyze the TOP 10 most significant geopolitical risks globally.

For each risk, provide:
1. Region/country affected
2. Risk type (political/economic/security/social/environmental/trade/diplomatic)
3. Severity level (low/medium/high/critical)
4. Title (concise, max 10 words)
5. Description (detailed, 2-3 paragraphs)
6. Summary (executive summary, 1 paragraph)
7. Impact areas (list of affected sectors)
8. Time horizon (immediate/short_term/medium_term/long_term)
9. Probability (0-100)
10. Trend (increasing/stable/decreasing)
11. Related topics (keywords)

Focus on risks relevant to:
- International trade and commerce
- BRICS and emerging markets
- Economic diplomacy
- Supply chain disruptions
- Energy and commodities
- Technology and innovation
- Climate and sustainability

Prioritize risks that would be most relevant to business leaders, policymakers, and investors.`,
            add_context_from_internet: true,
            response_json_schema: {
                type: "object",
                properties: {
                    risks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                region: { type: "string" },
                                country: { type: "string" },
                                risk_type: { type: "string" },
                                severity: { type: "string" },
                                title: { type: "string" },
                                description: { type: "string" },
                                summary: { type: "string" },
                                impact_areas: { type: "array", items: { type: "string" } },
                                time_horizon: { type: "string" },
                                probability: { type: "number" },
                                trend: { type: "string" },
                                related_topics: { type: "array", items: { type: "string" } }
                            }
                        }
                    },
                    analysis_date: { type: "string" }
                }
            }
        });

        const risks = riskAnalysis.risks || [];
        const createdRisks = [];

        // Store each risk in the database
        for (const risk of risks) {
            const riskData = {
                region: risk.region,
                country: risk.country || null,
                risk_type: risk.risk_type,
                severity: risk.severity,
                title: risk.title,
                description: risk.description,
                summary: risk.summary,
                impact_areas: risk.impact_areas || [],
                time_horizon: risk.time_horizon,
                probability: risk.probability,
                trend: risk.trend,
                source: "AI Analysis with Internet Context (xAI)",
                source_url: null,
                related_topics: risk.related_topics || [],
                last_updated: new Date().toISOString(),
                active: true
            };

            const created = await base44.asServiceRole.entities.GeopoliticalRisk.create(riskData);
            createdRisks.push(created);
        }

        // Deactivate old risks (older than 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        for (const oldRisk of existingRisks) {
            const riskDate = new Date(oldRisk.created_date);
            if (riskDate < sevenDaysAgo) {
                await base44.asServiceRole.entities.GeopoliticalRisk.update(oldRisk.id, {
                    active: false
                });
            }
        }

        return Response.json({
            success: true,
            risks_created: createdRisks.length,
            risks_deactivated: existingRisks.filter(r => new Date(r.created_date) < sevenDaysAgo).length,
            risks: createdRisks
        });

    } catch (error) {
        console.error('Error fetching geopolitical risks:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack
        }, { status: 500 });
    }
});