import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { risk_id } = await req.json();

        if (!risk_id) {
            return Response.json({ error: 'Risk ID is required' }, { status: 400 });
        }

        // Load the risk
        const risks = await base44.entities.GeopoliticalRisk.filter({ id: risk_id });
        if (risks.length === 0) {
            return Response.json({ error: 'Risk not found' }, { status: 404 });
        }

        const risk = risks[0];

        // Generate comprehensive analysis article
        const prompt = `As Marcos Troyjo's Digital Twin, write a comprehensive geopolitical risk analysis article justifying the following assessment:

**Risk**: ${risk.title}
**Region**: ${risk.region} ${risk.country ? `(${risk.country})` : ''}
**Type**: ${risk.risk_type}
**Severity**: ${risk.severity}
**Probability**: ${risk.probability}%
**Trend**: ${risk.trend}
**Time Horizon**: ${risk.time_horizon}

**Current Description**: ${risk.description}

Write a deep analysis article (1500-2000 words) that:

1. **Context & Background**: Provide historical context and recent developments that led to this risk
2. **Risk Justification**: Explain in detail why this risk has the assigned severity level (${risk.severity}) and probability (${risk.probability}%)
3. **Trend Analysis**: Justify why the trend is ${risk.trend} with data and evidence
4. **Impact Analysis**: Assess potential impacts on trade, investments, security, and regional stability
5. **Strategic Implications**: What this means for Brazil and other key actors
6. **Monitoring Indicators**: What metrics to watch to track this risk
7. **Scenario Planning**: Best-case, base-case, worst-case scenarios

Use Marcos Troyjo's characteristic style:
- Data-driven and evidence-based
- Geoeconomic perspective
- Pragmatic and non-ideological
- Clear strategic recommendations
- References to relevant frameworks and precedents

Format in Markdown with proper structure, headers, and emphasis.`;

        const body = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true
        });

        // Generate SEO metadata
        const seoPrompt = `Generate SEO metadata for this geopolitical risk analysis article about: ${risk.title}

Return JSON with: seo_title (max 60 chars), seo_description (max 160 chars), seo_keywords (array of 5-7 keywords)`;

        const seoData = await base44.integrations.Core.InvokeLLM({
            prompt: seoPrompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    seo_title: { type: 'string' },
                    seo_description: { type: 'string' },
                    seo_keywords: { type: 'array', items: { type: 'string' } }
                },
                required: ['seo_title', 'seo_description', 'seo_keywords']
            }
        });

        // Create the article
        const article = await base44.entities.Article.create({
            title: `Análise de Risco: ${risk.title}`,
            subtitle: `Avaliação geopolítica de ${risk.region}`,
            type: 'relatorio',
            summary: risk.summary || risk.description.substring(0, 200),
            body,
            seo_title: seoData.seo_title,
            seo_description: seoData.seo_description,
            seo_keywords: seoData.seo_keywords,
            tags: [risk.risk_type, risk.region, 'Risk Analysis', risk.severity],
            status: 'publicado',
            quality_tier: 'ai_generated',
            approval_status: 'pendente',
            author_email: user.email,
            reading_time: Math.ceil(body.split(' ').length / 200),
            related_risk_ids: [risk_id]
        });

        // Update the risk with article link
        await base44.entities.GeopoliticalRisk.update(risk_id, {
            linked_articles: [...(risk.linked_articles || []), article.id]
        });

        return Response.json({ 
            article_id: article.id,
            article_title: article.title,
            body: body.substring(0, 500) + '...'
        });
    } catch (error) {
        console.error('Error analyzing geopolitical risk:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});