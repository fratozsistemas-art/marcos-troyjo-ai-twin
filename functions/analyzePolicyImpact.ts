import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai@4.20.1';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { policy_description, target_region, timeframe = '12_months' } = await req.json();

        // Fetch contextual data
        const [facts, risks, corporateFacts] = await Promise.all([
            base44.asServiceRole.entities.StrategicFact.list('-created_date', 30),
            base44.asServiceRole.entities.GeopoliticalRisk.filter({ region: target_region }),
            base44.asServiceRole.entities.CorporateFact.filter({ country: target_region })
        ]);

        const contextData = {
            regional_facts: facts.filter(f => f.tags?.includes(target_region?.toLowerCase())),
            active_risks: risks.filter(r => r.status === 'active'),
            economic_indicators: corporateFacts.slice(0, 20)
        };

        const prompt = `Perform causal inference analysis to predict the impact of this policy:

Policy Description: ${policy_description}
Target Region: ${target_region}
Timeframe: ${timeframe}

Contextual Data:
- Regional Facts: ${JSON.stringify(contextData.regional_facts.slice(0, 5).map(f => f.summary))}
- Active Risks: ${JSON.stringify(contextData.active_risks.slice(0, 5).map(r => ({ type: r.risk_type, severity: r.severity })))}
- Economic Indicators: ${JSON.stringify(contextData.economic_indicators.slice(0, 5).map(i => ({ name: i.indicator_name, value: i.value })))}

Analyze using causal inference framework:
1. Direct Effects: Immediate, first-order consequences
2. Indirect Effects: Secondary and tertiary impacts
3. Confounding Factors: Variables that may influence outcomes
4. Counterfactual Scenario: What would happen without this policy
5. Probability Distribution: Likelihood of different outcomes

For each impact, provide:
- Impact category: economic, diplomatic, social, security
- Direction: positive, negative, mixed
- Magnitude: 1-10 scale
- Probability: 0-1
- Timeframe: short_term (<6mo), medium_term (6-18mo), long_term (>18mo)
- Causal chain: Step-by-step explanation
- Confounders: Variables that might affect the outcome
- Confidence: 0-1 based on data quality and causal clarity

Return JSON: { 
    direct_effects: [{...}], 
    indirect_effects: [{...}],
    counterfactual: {...},
    overall_assessment: {...},
    causal_graph: {...}
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in causal inference and policy impact analysis. Use rigorous analytical frameworks to predict policy outcomes."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.4,
            max_tokens: 3000
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        // Calculate aggregate impact score
        const allEffects = [
            ...(analysis.direct_effects || []),
            ...(analysis.indirect_effects || [])
        ];
        
        const avgMagnitude = allEffects.reduce((sum, e) => sum + (e.magnitude || 0), 0) / (allEffects.length || 1);
        const avgProbability = allEffects.reduce((sum, e) => sum + (e.probability || 0), 0) / (allEffects.length || 1);

        return Response.json({
            success: true,
            policy_impact_analysis: analysis,
            metrics: {
                total_effects_identified: allEffects.length,
                direct_effects: analysis.direct_effects?.length || 0,
                indirect_effects: analysis.indirect_effects?.length || 0,
                average_magnitude: avgMagnitude,
                average_probability: avgProbability,
                net_impact_score: avgMagnitude * avgProbability,
                high_probability_effects: allEffects.filter(e => e.probability >= 0.7).length
            },
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error analyzing policy impact:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to analyze policy impact'
        }, { status: 500 });
    }
});