import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data_type, data_id, text, output_format } = await req.json();

        if (!data_type && !text) {
            return Response.json({ error: 'Either data_type/data_id or text is required' }, { status: 400 });
        }

        let sourceText = text;

        // Load data from SoT if data_type is provided
        if (data_type && data_id) {
            if (data_type === 'geopolitical_risk') {
                const risks = await base44.entities.GeopoliticalRisk.filter({ id: data_id });
                if (risks.length > 0) {
                    const risk = risks[0];
                    sourceText = `Title: ${risk.title}\nRegion: ${risk.region}\nType: ${risk.risk_type}\nSeverity: ${risk.severity}\nDescription: ${risk.description}`;
                }
            } else if (data_type === 'article') {
                const articles = await base44.entities.Article.filter({ id: data_id });
                if (articles.length > 0) {
                    sourceText = articles[0].body;
                }
            } else if (data_type === 'timeline_event') {
                const events = await base44.entities.TimelineEvent.filter({ id: data_id });
                if (events.length > 0) {
                    const event = events[0];
                    sourceText = `Event: ${event.name}\nCategory: ${event.category}\nSummary: ${event.summary}\nActors: ${(event.actors || []).join(', ')}`;
                }
            }
        }

        if (!sourceText) {
            return Response.json({ error: 'No source text found' }, { status: 404 });
        }

        const formatInstructions = {
            lead_paragraph: 'Write a compelling lead paragraph (2-3 sentences) that hooks the reader and summarizes the key point.',
            social_media: 'Create a concise, engaging social media post (max 280 characters) with a call-to-action.',
            executive_summary: 'Write a professional executive summary (150-200 words) with bullet points for key takeaways.',
            key_insights: 'Extract 3-5 key insights in bullet point format, each being a concise actionable statement.'
        };

        const prompt = `Given the following content, create a ${output_format || 'executive_summary'} summary:

${sourceText.substring(0, 3000)}

${formatInstructions[output_format] || formatInstructions.executive_summary}

Use Marcos Troyjo's analytical style: data-driven, pragmatic, and geoeconomic perspective.`;

        const summary = await base44.integrations.Core.InvokeLLM({
            prompt
        });

        return Response.json({ summary });
    } catch (error) {
        console.error('Error summarizing data:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});