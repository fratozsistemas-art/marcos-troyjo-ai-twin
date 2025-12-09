import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { risk_ids, report_format, include_predictions } = await req.json();

        if (!risk_ids || risk_ids.length === 0) {
            return Response.json({ error: 'At least one risk ID is required' }, { status: 400 });
        }

        // Fetch risks
        const risks = await base44.asServiceRole.entities.GeopoliticalRisk.filter({
            id: { $in: risk_ids }
        });

        // Get predictions if requested
        let predictions = [];
        if (include_predictions) {
            predictions = await Promise.all(
                risk_ids.map(async (riskId) => {
                    try {
                        const predictionResponse = await base44.functions.invoke('predictRiskTrends', {
                            risk_id: riskId
                        });
                        return predictionResponse.data;
                    } catch (error) {
                        console.error(`Error getting prediction for risk ${riskId}:`, error);
                        return null;
                    }
                })
            );
            predictions = predictions.filter(Boolean);
        }

        // Get related articles
        const allTags = [...new Set(risks.flatMap(r => r.related_topics || []))];
        const relatedArticles = await base44.asServiceRole.entities.Article.filter({
            tags: { $in: allTags },
            status: 'publicado'
        });

        // Generate report using LLM
        const prompt = `
Generate a comprehensive geopolitical risk report in ${report_format || 'executive_summary'} format.

Risks analyzed:
${risks.map(r => `
**${r.title}**
- Region: ${r.region}
- Type: ${r.risk_type}
- Severity: ${r.severity}
- Trend: ${r.trend}
- Probability: ${r.probability}%
- Description: ${r.description}
- Impact areas: ${r.impact_areas?.join(', ') || 'N/A'}
`).join('\n')}

${include_predictions ? `
Trend predictions:
${predictions.map(p => `
**${p.risk_title}**
- Short-term outlook: ${p.prediction.short_term?.outlook}
- Medium-term outlook: ${p.prediction.medium_term?.outlook}
- Long-term outlook: ${p.prediction.long_term?.outlook}
- Confidence: ${p.prediction.confidence_level}
`).join('\n')}
` : ''}

Related analysis:
${relatedArticles.slice(0, 5).map(a => `- ${a.title}`).join('\n')}

Create a report with:
1. Executive summary
2. Risk overview and severity assessment
3. Regional breakdown
4. Impact analysis (markets, economy, politics)
5. ${include_predictions ? 'Future outlook and predictions' : 'Current trends'}
6. Recommendations
7. Key monitoring points

Format: ${report_format === 'detailed' ? 'Detailed multi-section report' : 'Executive summary (2-3 pages)'}
`;

        const reportContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt
        });

        // Create report metadata
        const report = {
            title: `Geopolitical Risk Report - ${new Date().toLocaleDateString()}`,
            generated_at: new Date().toISOString(),
            generated_by: user.email,
            risks_analyzed: risks.map(r => ({ id: r.id, title: r.title })),
            format: report_format || 'executive_summary',
            content: reportContent,
            includes_predictions: include_predictions || false,
            summary_statistics: {
                total_risks: risks.length,
                critical_risks: risks.filter(r => r.severity === 'critical').length,
                high_risks: risks.filter(r => r.severity === 'high').length,
                increasing_trends: risks.filter(r => r.trend === 'increasing').length,
                regions_covered: [...new Set(risks.map(r => r.region))],
                risk_types: [...new Set(risks.map(r => r.risk_type))]
            }
        };

        return Response.json(report);

    } catch (error) {
        console.error('Error generating risk report:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});