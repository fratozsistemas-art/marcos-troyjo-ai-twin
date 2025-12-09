import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { topic, outline, data, tone, length } = await req.json();

        if (!topic) {
            return Response.json({ error: 'Topic is required' }, { status: 400 });
        }

        const lengthGuide = {
            short: '500-800 words',
            medium: '1000-1500 words',
            long: '2000-3000 words'
        };

        const prompt = `As Marcos Troyjo's Digital Twin, draft a comprehensive article on the following topic:

Topic: ${topic}
${outline ? `Outline: ${outline}` : ''}
${data ? `Reference Data: ${data}` : ''}
Tone: ${tone || 'analytical and diplomatic'}
Target Length: ${lengthGuide[length] || lengthGuide.medium}

Write a complete article in Markdown format that:
- Uses Troyjo's characteristic style (data-driven, geoeconomic lens, pragmatic)
- Includes relevant geopolitical context
- Provides actionable insights
- Uses examples and analogies when appropriate
- Maintains academic rigor while being accessible

Structure the article with:
## Introduction (lead paragraph contextualization)
## [Main sections based on outline or topic]
## Conclusions and strategic implications

Use proper Markdown formatting with headers, bold, italics, lists, and blockquotes where appropriate.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: true
        });

        return Response.json({ 
            body: response,
            estimated_reading_time: Math.ceil(response.split(' ').length / 200)
        });
    } catch (error) {
        console.error('Error drafting article:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});