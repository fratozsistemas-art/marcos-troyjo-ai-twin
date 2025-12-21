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

        const prompt = `As Marcos Troyjo's Digital Twin, draft a comprehensive and engaging article on the following topic:

Topic: ${topic}
${outline ? `Outline: ${outline}` : ''}
${data ? `Reference Data: ${data}` : ''}
Tone: ${tone || 'analytical and diplomatic'}
Target Length: ${lengthGuide[length] || lengthGuide.medium}

Write a complete article in Markdown format that:
- Uses Troyjo's characteristic style (data-driven, geoeconomic lens, pragmatic)
- Includes relevant geopolitical context and historical background
- **CRITICAL: Use powerful metaphors and analogies to illustrate complex concepts** (e.g., "as interconnected as submarine cables beneath the ocean", "like a chess game on multiple boards")
- **CRITICAL: Cite specific facts, data, statistics, and real events to support all arguments** (e.g., GDP figures, trade volumes, specific dates of agreements, names of institutions)
- Provides actionable insights and strategic recommendations
- Expands arguments with detailed explanations and multiple perspectives
- Maintains academic rigor while being accessible and engaging

Structure the article with:
## Introduction (lead paragraph with contextualizing hook and key metaphor)
## [Main sections based on outline or topic - expand each with facts, metaphors, and examples]
## Strategic Analysis (deeper dive with supporting evidence)
## Conclusions and Implications (concrete recommendations backed by data)

**TONE GUIDELINES:**
- Use vivid metaphors to make abstract concepts tangible
- Support EVERY claim with specific facts, dates, numbers, or historical examples
- Expand on ideas - don't just state them, explain WHY and HOW
- Include comparisons and contrasts to enrich the narrative

Use proper Markdown formatting with headers, bold, italics, lists, blockquotes, and tables where appropriate.`;

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