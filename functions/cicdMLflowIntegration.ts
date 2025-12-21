import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            action, 
            experimentName,
            commitSha,
            branch,
            pipelineId,
            siteId,
            buildParams,
            metrics,
            tags
        } = await req.json();

        const trackingUri = Deno.env.get('MLFLOW_TRACKING_URI');
        const token = Deno.env.get('GITLAB_TOKEN');

        if (!token || !trackingUri) {
            return Response.json({ 
                error: 'MLflow configuration missing',
                details: 'Configure MLFLOW_TRACKING_URI and GITLAB_TOKEN'
            }, { status: 500 });
        }

        const headers = {
            'PRIVATE-TOKEN': token,
            'Content-Type': 'application/json'
        };

        switch (action) {
            case 'startRun': {
                // Find or create experiment
                const searchRes = await fetch(`${trackingUri}/experiments/search`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        filter: `name = '${experimentName}'`,
                        max_results: 1
                    })
                });

                let experimentId;
                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    if (searchData.experiments && searchData.experiments.length > 0) {
                        experimentId = searchData.experiments[0].experiment_id;
                    }
                }

                // Create experiment if not found
                if (!experimentId) {
                    const createRes = await fetch(`${trackingUri}/experiments/create`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            name: experimentName,
                            tags: [
                                { key: 'site_id', value: siteId || '' },
                                { key: 'created_by', value: 'cicd_automation' }
                            ]
                        })
                    });

                    if (createRes.ok) {
                        const createData = await createRes.json();
                        experimentId = createData.experiment_id;
                    } else {
                        throw new Error('Failed to create experiment');
                    }
                }

                // Create run
                const runRes = await fetch(`${trackingUri}/runs/create`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        experiment_id: experimentId,
                        start_time: Date.now(),
                        tags: [
                            { key: 'git.commit', value: commitSha || '' },
                            { key: 'git.branch', value: branch || '' },
                            { key: 'pipeline_id', value: pipelineId || '' },
                            { key: 'site_id', value: siteId || '' },
                            ...(tags || []).map(t => ({ key: t.key, value: t.value }))
                        ]
                    })
                });

                if (!runRes.ok) {
                    throw new Error('Failed to create run');
                }

                const runData = await runRes.json();
                const runId = runData.run.info.run_id;

                // Log parameters
                if (buildParams) {
                    for (const [key, value] of Object.entries(buildParams)) {
                        await fetch(`${trackingUri}/runs/log-parameter`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                run_id: runId,
                                key,
                                value: String(value)
                            })
                        });
                    }
                }

                return Response.json({
                    success: true,
                    data: {
                        run_id: runId,
                        experiment_id: experimentId
                    }
                });
            }

            case 'logMetrics': {
                const { runId, metricsData } = await req.json();

                if (!runId || !metricsData) {
                    return Response.json({ error: 'runId and metricsData required' }, { status: 400 });
                }

                // Log all metrics
                for (const [key, value] of Object.entries(metricsData)) {
                    await fetch(`${trackingUri}/runs/log-metric`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            run_id: runId,
                            key,
                            value: Number(value),
                            timestamp: Date.now()
                        })
                    });
                }

                return Response.json({ success: true });
            }

            case 'finishRun': {
                const { runId, status, metrics: finalMetrics } = await req.json();

                if (!runId) {
                    return Response.json({ error: 'runId required' }, { status: 400 });
                }

                // Log final metrics if provided
                if (finalMetrics) {
                    for (const [key, value] of Object.entries(finalMetrics)) {
                        await fetch(`${trackingUri}/runs/log-metric`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                run_id: runId,
                                key,
                                value: Number(value),
                                timestamp: Date.now()
                            })
                        });
                    }
                }

                // Update run status
                await fetch(`${trackingUri}/runs/update`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        run_id: runId,
                        status: status || 'FINISHED',
                        end_time: Date.now()
                    })
                });

                return Response.json({ success: true });
            }

            case 'webhookHandler': {
                // Handle CI/CD webhook to auto-start MLflow tracking
                const payload = await req.json();
                const { repository, commit, pipeline, site_id } = payload;

                const expName = `${repository?.name || 'unknown'}-${branch || 'main'}`;
                
                // Auto-start run
                const startRes = await fetch(new URL('/api/cicdMLflowIntegration', req.url).href, {
                    method: 'POST',
                    headers: req.headers,
                    body: JSON.stringify({
                        action: 'startRun',
                        experimentName: expName,
                        commitSha: commit?.sha || commit?.id,
                        branch: commit?.branch || branch,
                        pipelineId: pipeline?.id,
                        siteId: site_id,
                        buildParams: {
                            commit_message: commit?.message,
                            author: commit?.author?.name,
                            repository: repository?.name
                        },
                        tags: [
                            { key: 'triggered_by', value: 'webhook' }
                        ]
                    })
                });

                const startData = await startRes.json();

                return Response.json({
                    success: true,
                    message: 'MLflow tracking started automatically',
                    data: startData.data
                });
            }

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('CI/CD MLflow Integration Error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});