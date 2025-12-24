import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fact_id, detail, topic_label, fact_type } = await req.json();

        if (!detail) {
            return Response.json({ error: 'detail is required' }, { status: 400 });
        }

        // Generate concise summary using AI
        const prompt = `You are analyzing a strategic geopolitical fact. Generate a concise, informative 1-2 sentence summary of the following detailed description.

Topic: ${topic_label || 'Strategic Fact'}
Type: ${fact_type || 'general'}

Detailed Description:
${detail}

Generate a summary that:
- Is exactly 1-2 sentences
- Captures the core information
- Is clear and actionable
- Uses formal, professional language
- Focuses on key facts and implications

Return only the summary text, no additional formatting or explanation.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: false
        });

        const summary = typeof response === 'string' ? response.trim() : response.content?.trim() || '';

        // If fact_id provided, update the fact
        if (fact_id) {
            const facts = await base44.entities.StrategicFact.filter({ fact_id });
            if (facts.length > 0) {
                await base44.entities.StrategicFact.update(facts[0].id, {
                    summary: summary
                });
            }
        }

        return Response.json({
            success: true,
            summary: summary,
            fact_id: fact_id
        });

    } catch (error) {
        console.error('Error generating fact summary:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});