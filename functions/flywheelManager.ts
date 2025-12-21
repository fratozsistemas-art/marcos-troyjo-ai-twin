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

            case 'getBackups':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/backups`, { headers });
                break;

            case 'restoreBackup':
                if (!siteId || !data?.backupId) {
                    return Response.json({ error: 'siteId and backupId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/backups/${data.backupId}/restore`, {
                    method: 'POST',
                    headers
                });
                break;

            case 'updateEnvVars':
                if (!siteId || !data?.variables) {
                    return Response.json({ error: 'siteId and variables required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/env`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(data.variables)
                });
                break;

            case 'getEnvVars':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/env`, { headers });
                break;

            case 'updateSSL':
                if (!siteId || !data?.sslConfig) {
                    return Response.json({ error: 'siteId and sslConfig required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/ssl`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(data.sslConfig)
                });
                break;

            case 'updatePHPVersion':
                if (!siteId || !data?.version) {
                    return Response.json({ error: 'siteId and version required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/php`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({ version: data.version })
                });
                break;

            case 'getSiteConfig':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/config`, { headers });
                break;

            case 'getDeploymentLogs':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                const logsUrl = data?.deploymentId 
                    ? `${FLYWHEEL_API_URL}/sites/${siteId}/deployments/${data.deploymentId}/logs`
                    : `${FLYWHEEL_API_URL}/sites/${siteId}/deployments/latest/logs`;
                response = await fetch(logsUrl, { headers });
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