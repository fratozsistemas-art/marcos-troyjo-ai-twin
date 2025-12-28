import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { endpoint, method = 'GET', body } = await req.json();

        // Get the Observatory API URL from environment or default
        const observatoryApiUrl = Deno.env.get('OBSERVATORY_API_URL') || 'https://seu-dominio.pages.dev/api';
        const fullUrl = `${observatoryApiUrl}${endpoint}`;

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(fullUrl, options);
        const data = await response.json();

        return Response.json(data);
    } catch (error) {
        console.error('Error querying observatory API:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});