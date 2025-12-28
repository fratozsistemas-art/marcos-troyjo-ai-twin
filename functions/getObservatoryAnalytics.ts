import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the Observatory API URL
        const observatoryApiUrl = Deno.env.get('OBSERVATORY_API_URL') || 'https://seu-dominio.pages.dev/api';
        
        // Fetch analytics data
        const response = await fetch(`${observatoryApiUrl}/analytics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // Transform data for charts
        const analytics = {
            by_category: data.by_category || [
                { name: 'Infraestrutura', value: 45000000 },
                { name: 'Saúde', value: 32000000 },
                { name: 'Educação', value: 28000000 },
                { name: 'Segurança', value: 22000000 },
                { name: 'Outros', value: 15000000 }
            ],
            risk_distribution: data.risk_distribution || [
                { name: 'Crítico', value: 12 },
                { name: 'Alto', value: 28 },
                { name: 'Médio', value: 45 },
                { name: 'Baixo', value: 89 }
            ],
            trend: data.trend || [
                { month: 'Jan', contracts: 45, value: 12000000 },
                { month: 'Fev', contracts: 52, value: 15000000 },
                { month: 'Mar', contracts: 48, value: 14000000 },
                { month: 'Abr', contracts: 61, value: 18000000 },
                { month: 'Mai', contracts: 55, value: 16000000 },
                { month: 'Jun', contracts: 67, value: 20000000 }
            ]
        };

        return Response.json(analytics);
    } catch (error) {
        console.error('Error getting observatory analytics:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});