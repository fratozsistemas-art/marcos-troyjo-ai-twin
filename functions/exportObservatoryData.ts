import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tab, filters } = await req.json();

        // Get the Observatory API URL
        const observatoryApiUrl = Deno.env.get('OBSERVATORY_API_URL') || 'https://seu-dominio.pages.dev/api';
        
        // Request export from observatory
        const response = await fetch(`${observatoryApiUrl}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tab,
                filters,
                format: 'csv',
                user_id: user.id
            })
        });

        const data = await response.json();

        // Log the export action
        await base44.entities.UserInteraction.create({
            user_email: user.email,
            interaction_type: 'download',
            event_name: 'observatory_data_export',
            content_type: 'observatory',
            content_id: tab,
            content_title: `Export: ${tab}`,
            content_metadata: {
                filters,
                export_url: data.export_url
            }
        });

        return Response.json({
            success: true,
            export_url: data.export_url,
            message: 'Export initiated successfully'
        });
    } catch (error) {
        console.error('Error exporting observatory data:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});