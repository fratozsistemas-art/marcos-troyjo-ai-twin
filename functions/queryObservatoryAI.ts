import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, context } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query is required' }, { status: 400 });
        }

        // Get the Observatory API URL
        const observatoryApiUrl = Deno.env.get('OBSERVATORY_API_URL') || 'https://seu-dominio.pages.dev/api';
        
        // Send query to AI endpoint
        const response = await fetch(`${observatoryApiUrl}/ai-twin/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                context: context || 'general',
                max_results: 10,
                user_id: user.id
            })
        });

        const data = await response.json();

        // Log the query for analytics
        await base44.entities.UserInteraction.create({
            user_email: user.email,
            interaction_type: 'search',
            event_name: 'observatory_ai_query',
            content_type: 'observatory',
            content_id: 'ai_query',
            content_title: query,
            content_metadata: {
                context,
                results_count: data.results?.length || 0
            }
        });

        return Response.json(data);
    } catch (error) {
        console.error('Error querying observatory AI:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});