import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { risk_id } = await req.json();

        // Fetch the risk
        const risks = await base44.asServiceRole.entities.GeopoliticalRisk.filter({ id: risk_id });
        if (risks.length === 0) {
            return Response.json({ error: 'Risk not found' }, { status: 404 });
        }

        const risk = risks[0];

        // Fetch related articles and timeline events
        const [relatedArticles, timelineEvents] = await Promise.all([
            base44.asServiceRole.entities.Article.filter({
                tags: { $in: risk.related_topics || [] }
            }),
            base44.asServiceRole.entities.TimelineEvent.filter({
                category: risk.risk_type
            })
        ]);

        // Use LLM to predict trends
        const prompt = `
You are a geopolitical analyst specializing in risk assessment and trend prediction.

Given the following geopolitical risk:
- Region: ${risk.region}
- Country: ${risk.country || 'N/A'}
- Risk Type: ${risk.risk_type}
- Severity: ${risk.severity}
- Title: ${risk.title}
- Description: ${risk.description}
- Current Trend: ${risk.trend}
- Probability: ${risk.probability}%
- Impact Areas: ${risk.impact_areas?.join(', ') || 'N/A'}

Recent related events and context:
${timelineEvents.slice(0, 5).map(e => `- ${e.name} (${e.start_date}): ${e.summary}`).join('\n')}

Related analysis:
${relatedArticles.slice(0, 3).map(a => `- ${a.title}: ${a.summary}`).join('\n')}

Predict the future trend of this risk over the next 6-12 months. Provide:
1. Short-term outlook (1-3 months)
2. Medium-term outlook (3-6 months)
3. Long-term outlook (6-12 months)
4. Key factors that could accelerate or mitigate the risk
5. Probability estimate for each outlook period
6. Recommended monitoring indicators

Format as JSON with this structure:
{
  "short_term": {"outlook": "string", "probability": number, "key_factors": ["string"]},
  "medium_term": {"outlook": "string", "probability": number, "key_factors": ["string"]},
  "long_term": {"outlook": "string", "probability": number, "key_factors": ["string"]},
  "accelerating_factors": ["string"],
  "mitigating_factors": ["string"],
  "monitoring_indicators": ["string"],
  "confidence_level": "high|medium|low"
}
`;

        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    short_term: {
                        type: "object",
                        properties: {
                            outlook: { type: "string" },
                            probability: { type: "number" },
                            key_factors: { type: "array", items: { type: "string" } }
                        }
                    },
                    medium_term: {
                        type: "object",
                        properties: {
                            outlook: { type: "string" },
                            probability: { type: "number" },
                            key_factors: { type: "array", items: { type: "string" } }
                        }
                    },
                    long_term: {
                        type: "object",
                        properties: {
                            outlook: { type: "string" },
                            probability: { type: "number" },
                            key_factors: { type: "array", items: { type: "string" } }
                        }
                    },
                    accelerating_factors: { type: "array", items: { type: "string" } },
                    mitigating_factors: { type: "array", items: { type: "string" } },
                    monitoring_indicators: { type: "array", items: { type: "string" } },
                    confidence_level: { type: "string" }
                }
            }
        });

        return Response.json({
            risk_id: risk.id,
            risk_title: risk.title,
            prediction: response
        });

    } catch (error) {
        console.error('Error predicting risk trends:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});