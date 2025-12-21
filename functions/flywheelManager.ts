import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const FLYWHEEL_API_URL = 'https://api.getflywheel.com/v1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, siteId, data } = await req.json();
        const apiKey = Deno.env.get('FLYWHEEL_API_KEY');

        if (!apiKey) {
            return Response.json({ error: 'Flywheel API key not configured' }, { status: 500 });
        }

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        let response;

        switch (action) {
            case 'listSites':
                response = await fetch(`${FLYWHEEL_API_URL}/sites`, { headers });
                break;

            case 'getSite':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}`, { headers });
                break;

            case 'createSite':
                if (!data) {
                    return Response.json({ error: 'site data required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(data)
                });
                break;

            case 'updateSite':
                if (!siteId || !data) {
                    return Response.json({ error: 'siteId and data required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(data)
                });
                break;

            case 'deleteSite':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}`, {
                    method: 'DELETE',
                    headers
                });
                break;

            case 'deploymentStatus':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/deployments`, { headers });
                break;

            case 'triggerDeploy':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/deploy`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(data || {})
                });
                break;

            case 'getSiteLogs':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/logs`, { headers });
                break;

            case 'backupSite':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/backups`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(data || {})
                });
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (!response.ok) {
            const error = await response.text();
            return Response.json({ 
                error: 'Flywheel API error', 
                details: error,
                status: response.status 
            }, { status: response.status });
        }

        const result = await response.json();
        return Response.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Flywheel Manager Error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});