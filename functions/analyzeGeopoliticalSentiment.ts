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

        const { content_ids, analyze_trends = true } = await req.json();

        // Fetch articles and facts for sentiment analysis
        const [articles, facts, alerts] = await Promise.all([
            base44.asServiceRole.entities.Article.list('-created_date', 30),
            base44.asServiceRole.entities.StrategicFact.list('-created_date', 20),
            base44.asServiceRole.entities.AlertFeed.filter({ status: 'active' })
        ]);

        const contentToAnalyze = [
            ...articles.map(a => ({ id: a.id, text: `${a.title}. ${a.content}`, type: 'article', date: a.created_date })),
            ...facts.map(f => ({ id: f.fact_id, text: f.detail, type: 'fact', date: f.start_date })),
            ...alerts.map(a => ({ id: a.id, text: a.summary, type: 'alert', date: a.created_date }))
        ].slice(0, 50);

        const prompt = `Analyze the sentiment of the following geopolitical content. For each item, determine:
1. Overall sentiment: positive, neutral, negative
2. Sentiment score: -1.0 (very negative) to +1.0 (very positive)
3. Key themes: trade, diplomacy, conflict, cooperation, economy
4. Emotional tone: optimistic, cautious, alarming, analytical
5. Risk indicator: low, medium, high

Content:
${JSON.stringify(contentToAnalyze.slice(0, 20).map(c => ({ id: c.id, text: c.text.substring(0, 500), type: c.type })))}

${analyze_trends ? `Also analyze sentiment trends over time and identify:
- Sentiment shift patterns
- Topics with increasing negativity
- Emerging positive narratives
- Regional sentiment variations` : ''}

Return JSON with: { analyses: [{id, sentiment, score, themes, tone, risk, explanation}], trends: {...} }`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert in geopolitical sentiment analysis. Analyze tone, implications, and risk indicators with precision."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 2500
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        // Calculate aggregate metrics
        const sentimentScores = analysis.analyses?.map(a => a.score || 0) || [];
        const avgSentiment = sentimentScores.reduce((sum, s) => sum + s, 0) / (sentimentScores.length || 1);
        
        const themeCounts = {};
        analysis.analyses?.forEach(a => {
            a.themes?.forEach(theme => {
                themeCounts[theme] = (themeCounts[theme] || 0) + 1;
            });
        });

        const riskDistribution = {
            low: analysis.analyses?.filter(a => a.risk === 'low').length || 0,
            medium: analysis.analyses?.filter(a => a.risk === 'medium').length || 0,
            high: analysis.analyses?.filter(a => a.risk === 'high').length || 0
        };

        return Response.json({
            success: true,
            sentiment_analysis: analysis,
            aggregate_metrics: {
                average_sentiment: avgSentiment,
                sentiment_classification: avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral',
                total_analyzed: analysis.analyses?.length || 0,
                top_themes: Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
                risk_distribution: riskDistribution
            },
            generated_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to analyze sentiment'
        }, { status: 500 });
    }
});