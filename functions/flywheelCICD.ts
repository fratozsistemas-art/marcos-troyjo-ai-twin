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
            case 'listWebhooks':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/webhooks`, { headers });
                break;

            case 'createWebhook':
                if (!siteId || !data) {
                    return Response.json({ error: 'siteId and webhook data required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/webhooks`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        url: data.url,
                        events: data.events || ['push', 'pull_request'],
                        secret: data.secret,
                        active: data.active !== false
                    })
                });
                break;

            case 'deleteWebhook':
                if (!siteId || !data?.webhookId) {
                    return Response.json({ error: 'siteId and webhookId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/webhooks/${data.webhookId}`, {
                    method: 'DELETE',
                    headers
                });
                break;

            case 'connectGitRepo':
                if (!siteId || !data) {
                    return Response.json({ error: 'siteId and repository data required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/git`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        provider: data.provider,
                        repository: data.repository,
                        branch: data.branch || 'main',
                        token: data.token,
                        auto_deploy: data.autoDeploy !== false
                    })
                });
                break;

            case 'disconnectGitRepo':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/git`, {
                    method: 'DELETE',
                    headers
                });
                break;

            case 'getGitStatus':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/git`, { headers });
                break;

            case 'listPipelines':
                if (!siteId) {
                    return Response.json({ error: 'siteId required' }, { status: 400 });
                }
                const limit = data?.limit || 10;
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/pipelines?limit=${limit}`, { headers });
                break;

            case 'getPipelineDetails':
                if (!siteId || !data?.pipelineId) {
                    return Response.json({ error: 'siteId and pipelineId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/pipelines/${data.pipelineId}`, { headers });
                break;

            case 'retryPipeline':
                if (!siteId || !data?.pipelineId) {
                    return Response.json({ error: 'siteId and pipelineId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/pipelines/${data.pipelineId}/retry`, {
                    method: 'POST',
                    headers
                });
                break;

            case 'cancelPipeline':
                if (!siteId || !data?.pipelineId) {
                    return Response.json({ error: 'siteId and pipelineId required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/pipelines/${data.pipelineId}/cancel`, {
                    method: 'POST',
                    headers
                });
                break;

            case 'configureBuildSettings':
                if (!siteId || !data) {
                    return Response.json({ error: 'siteId and build settings required' }, { status: 400 });
                }
                response = await fetch(`${FLYWHEEL_API_URL}/sites/${siteId}/build`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        build_command: data.buildCommand,
                        output_directory: data.outputDirectory,
                        install_command: data.installCommand,
                        environment_variables: data.environmentVariables
                    })
                });
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (!response.ok) {
            const error = await response.text();
            return Response.json({ 
                error: 'Flywheel CI/CD API error', 
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
        console.error('Flywheel CI/CD Error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});