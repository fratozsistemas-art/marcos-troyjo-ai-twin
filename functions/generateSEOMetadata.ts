import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, body, summary, type } = await req.json();

        if (!title || !body) {
            return Response.json({ error: 'Title and body are required' }, { status: 400 });
        }

        const prompt = `Given this article about geopolitics and economics:

Title: ${title}
Type: ${type || 'article'}
Summary: ${summary || 'N/A'}
Body: ${body.substring(0, 2000)}...

Generate SEO metadata:
1. An optimized SEO title (max 60 characters, compelling and keyword-rich)
2. A meta description (max 160 characters, actionable and engaging)
3. 5-7 relevant keywords for search optimization
4. Schema.org Article structured data in JSON-LD format

Return JSON with: seo_title, seo_description, seo_keywords (array), structured_data (object)`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    seo_title: { type: 'string' },
                    seo_description: { type: 'string' },
                    seo_keywords: { type: 'array', items: { type: 'string' } },
                    structured_data: { type: 'object' }
                },
                required: ['seo_title', 'seo_description', 'seo_keywords', 'structured_data']
            }
        });

        return Response.json(response);
    } catch (error) {
        console.error('Error generating SEO metadata:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});