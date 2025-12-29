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

        const { data_source = 'corporate_facts', sensitivity = 'medium' } = await req.json();

        // Fetch economic data
        const facts = await base44.asServiceRole.entities.CorporateFact.list('-created_date', 100);

        // Group by indicator and time series
        const timeSeries = {};
        facts.forEach(fact => {
            const key = `${fact.indicator_name}_${fact.country || 'global'}`;
            if (!timeSeries[key]) {
                timeSeries[key] = [];
            }
            timeSeries[key].push({
                date: fact.year,
                value: fact.numeric_value,
                indicator: fact.indicator_name,
                country: fact.country,
                unit: fact.unit
            });
        });

        // Prepare data for anomaly detection
        const seriesData = Object.entries(timeSeries).map(([key, data]) => ({
            key,
            data: data.sort((a, b) => a.date - b.date),
            indicator: data[0]?.indicator,
            country: data[0]?.country
        }));

        const prompt = `Perform statistical anomaly detection on the following economic time series data.

Sensitivity Level: ${sensitivity}

Time Series Data:
${JSON.stringify(seriesData.slice(0, 10), null, 2)}

For each indicator series, detect:
1. Outliers: Values significantly deviating from the mean
2. Trend breaks: Sudden changes in trajectory
3. Pattern anomalies: Unexpected seasonal or cyclical behaviors
4. Contextual anomalies: Values unusual given recent context

For each anomaly found, provide:
- Indicator name and country
- Anomaly type: outlier, trend_break, pattern_anomaly, contextual
- Severity: low, medium, high, critical
- Description: What makes this anomalous
- Potential causes: Economic or geopolitical factors
- Recommended investigation: What to look into
- Confidence: 0-1 score

Use statistical reasoning: z-scores, moving averages, standard deviations.

Return JSON: { anomalies: [{...}], summary: {...} }`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert econometrician specializing in anomaly detection and statistical analysis of economic indicators."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: 2000
        });

        const detectionResults = JSON.parse(response.choices[0].message.content);

        // Store anomalies
        for (const anomaly of (detectionResults.anomalies || [])) {
            await base44.asServiceRole.entities.UIAnomaly.create({
                anomaly_type: anomaly.anomaly_type || 'statistical',
                severity: anomaly.severity || 'medium',
                description: anomaly.description,
                detected_at: new Date().toISOString(),
                indicator_name: anomaly.indicator,
                country: anomaly.country,
                metadata: {
                    potential_causes: anomaly.potential_causes,
                    recommended_investigation: anomaly.recommended_investigation,
                    confidence: anomaly.confidence,
                    detection_method: 'ml_statistical_analysis'
                },
                status: 'active'
            });
        }

        return Response.json({
            success: true,
            anomalies: detectionResults.anomalies || [],
            summary: detectionResults.summary || {},
            statistics: {
                total_series_analyzed: seriesData.length,
                anomalies_detected: detectionResults.anomalies?.length || 0,
                high_severity: detectionResults.anomalies?.filter(a => a.severity === 'high' || a.severity === 'critical').length || 0
            },
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error detecting anomalies:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to detect economic anomalies'
        }, { status: 500 });
    }
});