import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai@4.20.1';
import { jsPDF } from 'npm:jspdf@2.5.2';

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

        const { 
            report_config,
            format = 'json',
            include_ai_summary = true 
        } = await req.json();

        // Fetch data based on report configuration
        const reportData = {
            facts: [],
            risks: [],
            articles: [],
            interactions: [],
            documents: [],
            predictions: []
        };

        if (report_config.include_facts) {
            reportData.facts = await base44.asServiceRole.entities.StrategicFact.list('-created_date', 50);
        }
        
        if (report_config.include_risks) {
            reportData.risks = await base44.asServiceRole.entities.GeopoliticalRisk.filter({
                status: 'active'
            });
        }
        
        if (report_config.include_articles) {
            reportData.articles = await base44.asServiceRole.entities.Article.list('-created_date', 20);
        }
        
        if (report_config.include_interactions) {
            reportData.interactions = await base44.asServiceRole.entities.UserInteraction.filter({
                user_email: user.email
            });
        }

        if (report_config.include_documents) {
            reportData.documents = await base44.asServiceRole.entities.Document.filter({
                created_by: user.email
            });
        }

        if (report_config.include_predictions) {
            reportData.predictions = await base44.asServiceRole.entities.PredictiveRecommendation.filter({
                user_email: user.email,
                status: 'pending'
            });
        }

        // Apply filters
        if (report_config.date_range) {
            const { start_date, end_date } = report_config.date_range;
            const filterByDate = (items) => items.filter(item => {
                const itemDate = new Date(item.created_date);
                return itemDate >= new Date(start_date) && itemDate <= new Date(end_date);
            });
            
            reportData.facts = filterByDate(reportData.facts || []);
            reportData.risks = filterByDate(reportData.risks || []);
            reportData.articles = filterByDate(reportData.articles || []);
            reportData.interactions = filterByDate(reportData.interactions || []);
        }

        if (report_config.regions?.length > 0) {
            reportData.risks = reportData.risks.filter(r => 
                report_config.regions.includes(r.region)
            );
        }

        // Generate AI summary if requested
        let aiSummary = null;
        if (include_ai_summary) {
            const summaryPrompt = `Analyze this data and create an executive summary report.

Report Configuration:
- Title: ${report_config.title || 'Analytical Report'}
- Period: ${report_config.date_range ? `${report_config.date_range.start_date} to ${report_config.date_range.end_date}` : 'All time'}
- Focus Areas: ${report_config.regions?.join(', ') || 'All regions'}

Data Summary:
- Strategic Facts: ${reportData.facts?.length || 0}
- Geopolitical Risks: ${reportData.risks?.length || 0}
- Articles: ${reportData.articles?.length || 0}
- User Interactions: ${reportData.interactions?.length || 0}
- Documents: ${reportData.documents?.length || 0}
- Predictions: ${reportData.predictions?.length || 0}

Top Facts: ${JSON.stringify(reportData.facts?.slice(0, 5).map(f => f.summary))}
Active Risks: ${JSON.stringify(reportData.risks?.slice(0, 5).map(r => ({ region: r.region, type: r.risk_type, severity: r.severity })))}

Generate a comprehensive executive summary with:
1. Key Highlights (3-5 bullet points)
2. Major Trends Identified
3. Critical Risks and Opportunities
4. Strategic Recommendations (3-5 actionable items)
5. Data Insights

Format as JSON with these sections.`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert geopolitical analyst creating executive reports."
                    },
                    {
                        role: "user",
                        content: summaryPrompt
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7,
                max_tokens: 1500
            });

            aiSummary = JSON.parse(response.choices[0].message.content);
        }

        // Calculate statistics
        const statistics = {
            total_facts: reportData.facts?.length || 0,
            total_risks: reportData.risks?.length || 0,
            total_articles: reportData.articles?.length || 0,
            total_interactions: reportData.interactions?.length || 0,
            total_documents: reportData.documents?.length || 0,
            total_predictions: reportData.predictions?.length || 0,
            high_severity_risks: reportData.risks?.filter(r => r.severity === 'high' || r.severity === 'critical').length || 0,
            high_confidence_predictions: reportData.predictions?.filter(p => p.confidence_score >= 0.8).length || 0,
            most_active_regions: calculateTopRegions(reportData.risks || []),
            engagement_rate: calculateEngagementRate(reportData.interactions || [])
        };

        const report = {
            id: crypto.randomUUID(),
            title: report_config.title || 'Analytical Report',
            generated_at: new Date().toISOString(),
            generated_by: user.email,
            config: report_config,
            ai_summary: aiSummary,
            statistics: statistics,
            data: reportData,
            metadata: {
                format: format,
                version: '1.0',
                model: 'gpt-4o-mini'
            }
        };

        // Format based on requested format
        if (format === 'csv') {
            const csv = generateCSV(report);
            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="report_${Date.now()}.csv"`
                }
            });
        }

        if (format === 'pdf') {
            const pdf = generatePDF(report);
            return new Response(pdf, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="report_${Date.now()}.pdf"`
                }
            });
        }

        return Response.json({
            success: true,
            report: report
        });

    } catch (error) {
        console.error('Error generating report:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to generate analytical report'
        }, { status: 500 });
    }
});

function calculateTopRegions(risks) {
    const regionCount = {};
    risks.forEach(risk => {
        regionCount[risk.region] = (regionCount[risk.region] || 0) + 1;
    });
    return Object.entries(regionCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([region, count]) => ({ region, count }));
}

function calculateEngagementRate(interactions) {
    if (!interactions.length) return 0;
    const totalEngagement = interactions.reduce((sum, i) => sum + (i.engagement_score || 0), 0);
    return Math.round(totalEngagement / interactions.length);
}

function generateCSV(report) {
    const rows = [
        ['Analytical Report', report.title],
        ['Generated At', report.generated_at],
        ['Generated By', report.generated_by],
        [''],
        ['Statistics'],
        ['Total Facts', report.statistics.total_facts],
        ['Total Risks', report.statistics.total_risks],
        ['Total Articles', report.statistics.total_articles],
        ['Total Interactions', report.statistics.total_interactions],
        ['High Severity Risks', report.statistics.high_severity_risks],
        [''],
        ['Executive Summary', report.ai_summary?.key_highlights?.join(' | ') || 'N/A']
    ];

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function generatePDF(report) {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(report.title, 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date(report.generated_at).toLocaleString()}`, 20, 30);
    doc.text(`By: ${report.generated_by}`, 20, 35);
    
    doc.setFontSize(14);
    doc.text('Statistics', 20, 50);
    
    let y = 60;
    doc.setFontSize(10);
    doc.text(`Total Facts: ${report.statistics.total_facts}`, 20, y);
    doc.text(`Total Risks: ${report.statistics.total_risks}`, 20, y + 7);
    doc.text(`Total Articles: ${report.statistics.total_articles}`, 20, y + 14);
    
    if (report.ai_summary) {
        y = 90;
        doc.setFontSize(14);
        doc.text('Executive Summary', 20, y);
        
        y += 10;
        doc.setFontSize(10);
        if (report.ai_summary.key_highlights) {
            report.ai_summary.key_highlights.forEach((highlight, i) => {
                doc.text(`• ${highlight}`, 20, y + (i * 7));
            });
        }
    }
    
    return doc.output('arraybuffer');
}