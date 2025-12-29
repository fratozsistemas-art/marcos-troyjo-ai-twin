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

        const { context_type, historical_data, timeframe = '30_days' } = await req.json();

        // Gather contextual data
        const [facts, risks, articles, interactions] = await Promise.all([
            base44.asServiceRole.entities.StrategicFact.list('-created_date', 20),
            base44.asServiceRole.entities.GeopoliticalRisk.list('-created_date', 15),
            base44.asServiceRole.entities.Article.list('-created_date', 10),
            base44.asServiceRole.entities.UserInteraction.filter({ 
                user_email: user.email 
            })
        ]);

        // Build context for ML model
        const contextData = {
            recent_facts: facts?.slice(0, 10).map(f => ({
                topic: f.topic_label,
                fact: f.summary,
                confidence: f.confidence,
                date: f.start_date
            })) || [],
            active_risks: risks?.filter(r => r.status === 'active').map(r => ({
                region: r.region,
                type: r.risk_type,
                severity: r.severity,
                trend: r.trend_direction
            })) || [],
            user_interests: interactions?.slice(0, 20).map(i => ({
                type: i.content_type,
                topic: i.content_title,
                engagement: i.engagement_score
            })) || [],
            recent_analysis: articles?.map(a => ({
                title: a.title,
                category: a.category,
                topics: a.topics
            })) || []
        };

        const prompt = `You are an advanced geopolitical and economic forecasting AI. Analyze the following data and generate 3-5 predictive insights for the next ${timeframe}.

Context Data:
${JSON.stringify(contextData, null, 2)}

Generate predictions in these categories:
1. Market Trends: Economic and trade forecasts
2. Geopolitical Risks: Potential conflicts or tensions that could escalate
3. Policy Impact: Likely effects of current or proposed policies
4. Opportunity Areas: Emerging opportunities in trade, diplomacy, or economic cooperation

For each prediction provide:
- Category (market_trends, geopolitical_risk, policy_impact, opportunity)
- Title: Short, compelling headline
- Description: 2-3 sentences explaining the prediction
- Confidence: High (>80%), Medium (50-80%), Low (<50%)
- Timeframe: When this is likely to occur
- Key Indicators: What to watch for
- Potential Impact: Scale of 1-10
- Recommended Actions: What stakeholders should consider

Format as JSON array of prediction objects.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a world-class geopolitical analyst specializing in predictive intelligence. Generate data-driven, actionable forecasts."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 2000
        });

        const predictions = JSON.parse(response.choices[0].message.content);

        // Store predictions
        if (predictions.predictions) {
            for (const prediction of predictions.predictions) {
                await base44.asServiceRole.entities.PredictiveRecommendation.create({
                    user_email: user.email,
                    recommendation_type: prediction.category || 'research_area',
                    title: prediction.title,
                    description: prediction.description,
                    reasoning: `ML Prediction based on ${contextData.recent_facts.length} facts, ${contextData.active_risks.length} risks, and user activity patterns.`,
                    confidence_score: prediction.confidence === 'High' ? 0.85 : prediction.confidence === 'Medium' ? 0.65 : 0.45,
                    relevance_factors: prediction.key_indicators || [],
                    based_on: {
                        facts_analyzed: contextData.recent_facts.length,
                        risks_evaluated: contextData.active_risks.length,
                        user_interests: contextData.user_interests.length
                    },
                    status: 'pending',
                    priority: prediction.potential_impact >= 7 ? 10 : prediction.potential_impact >= 5 ? 7 : 5,
                    metadata: {
                        timeframe: prediction.timeframe,
                        potential_impact: prediction.potential_impact,
                        recommended_actions: prediction.recommended_actions,
                        model_version: 'gpt-4o-mini',
                        generated_at: new Date().toISOString()
                    }
                });
            }
        }

        return Response.json({
            success: true,
            predictions: predictions.predictions || [],
            context_summary: {
                facts_analyzed: contextData.recent_facts.length,
                risks_evaluated: contextData.active_risks.length,
                data_points: contextData.user_interests.length
            },
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating predictions:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to generate predictive insights'
        }, { status: 500 });
    }
});