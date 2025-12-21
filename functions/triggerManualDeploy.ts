import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { siteId, source, pipelineId, mlflowRunId, commitSha, branch } = await req.json();
        const apiKey = Deno.env.get('FLYWHEEL_API_KEY');

        if (!apiKey) {
            return Response.json({ error: 'Flywheel API key not configured' }, { status: 500 });
        }

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        // Start MLflow tracking if provided
        let mlflowRun;
        if (mlflowRunId) {
            const mlflowRes = await base44.functions.invoke('cicdMLflowIntegration', {
                action: 'startRun',
                experimentName: `${siteId}-manual-deploy`,
                commitSha: commitSha || 'manual',
                branch: branch || 'manual',
                pipelineId: 'manual',
                siteId,
                buildParams: {
                    trigger_type: 'manual',
                    triggered_by: user.email,
                    source: source || 'ui'
                },
                tags: [
                    { key: 'manual_deploy', value: 'true' },
                    { key: 'user', value: user.email }
                ]
            });

            if (mlflowRes.data.success) {
                mlflowRun = mlflowRes.data.data;
            }
        }

        // Trigger deployment
        const deployRes = await fetch(`https://api.getflywheel.com/v1/sites/${siteId}/deploy`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                source: source || 'manual',
                commit: commitSha,
                branch: branch
            })
        });

        if (!deployRes.ok) {
            const error = await deployRes.text();
            
            // Log failure to MLflow
            if (mlflowRun) {
                await base44.functions.invoke('cicdMLflowIntegration', {
                    action: 'finishRun',
                    runId: mlflowRun.run_id,
                    status: 'FAILED',
                    metrics: { deploy_success: 0 }
                });
            }

            return Response.json({ 
                error: 'Deployment failed', 
                details: error 
            }, { status: deployRes.status });
        }

        const deployment = await deployRes.json();

        // Log success to MLflow
        if (mlflowRun) {
            await base44.functions.invoke('cicdMLflowIntegration', {
                action: 'finishRun',
                runId: mlflowRun.run_id,
                status: 'FINISHED',
                metrics: { 
                    deploy_success: 1,
                    deploy_duration: deployment.duration || 0
                }
            });
        }

        return Response.json({
            success: true,
            data: {
                deployment,
                mlflow_run: mlflowRun
            }
        });

    } catch (error) {
        console.error('Manual Deploy Error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});