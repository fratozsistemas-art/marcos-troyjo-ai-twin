import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, siteId, pipelineId, mlflowRunId, thresholds } = await req.json();

        switch (action) {
            case 'checkPipelineStatus': {
                const apiKey = Deno.env.get('FLYWHEEL_API_KEY');
                const headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };

                const res = await fetch(`https://api.getflywheel.com/v1/sites/${siteId}/pipelines/${pipelineId}`, { headers });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch pipeline');
                }

                const pipeline = await res.json();
                const alerts = [];

                if (pipeline.status === 'failed') {
                    alerts.push({
                        type: 'error',
                        severity: 'high',
                        message: `Pipeline #${pipeline.number} failed`,
                        details: pipeline.error_message,
                        timestamp: new Date().toISOString()
                    });

                    // Send email notification
                    await base44.integrations.Core.SendEmail({
                        to: user.email,
                        subject: `⚠️ Pipeline Failed - ${siteId}`,
                        body: `Pipeline #${pipeline.number} has failed.\n\nError: ${pipeline.error_message}\n\nView details in the dashboard.`
                    });
                }

                if (pipeline.duration > (thresholds?.maxDuration || 600)) {
                    alerts.push({
                        type: 'warning',
                        severity: 'medium',
                        message: `Pipeline took ${pipeline.duration}s (threshold: ${thresholds.maxDuration}s)`,
                        timestamp: new Date().toISOString()
                    });
                }

                return Response.json({
                    success: true,
                    data: { pipeline, alerts }
                });
            }

            case 'checkMetricChanges': {
                const trackingUri = Deno.env.get('MLFLOW_TRACKING_URI');
                const token = Deno.env.get('GITLAB_TOKEN');
                const headers = {
                    'PRIVATE-TOKEN': token,
                    'Content-Type': 'application/json'
                };

                const runRes = await fetch(`${trackingUri}/runs/get?run_id=${mlflowRunId}`, { headers });
                
                if (!runRes.ok) {
                    throw new Error('Failed to fetch MLflow run');
                }

                const runData = await runRes.json();
                const run = runData.run;
                const alerts = [];

                // Check for significant metric changes
                if (run.data.metrics && thresholds?.metrics) {
                    for (const [metricKey, threshold] of Object.entries(thresholds.metrics)) {
                        const value = run.data.metrics[metricKey];
                        
                        if (value !== undefined) {
                            if (threshold.min !== undefined && value < threshold.min) {
                                alerts.push({
                                    type: 'warning',
                                    severity: 'high',
                                    message: `Metric ${metricKey} below threshold`,
                                    details: `Value: ${value}, Min: ${threshold.min}`,
                                    timestamp: new Date().toISOString()
                                });
                            }
                            
                            if (threshold.max !== undefined && value > threshold.max) {
                                alerts.push({
                                    type: 'warning',
                                    severity: 'high',
                                    message: `Metric ${metricKey} above threshold`,
                                    details: `Value: ${value}, Max: ${threshold.max}`,
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
                    }
                }

                // Send alert if significant changes detected
                if (alerts.length > 0) {
                    await base44.integrations.Core.SendEmail({
                        to: user.email,
                        subject: `📊 MLflow Metric Alert - ${run.info.run_id}`,
                        body: `Metric thresholds exceeded:\n\n${alerts.map(a => `- ${a.message}: ${a.details}`).join('\n')}\n\nCheck the dashboard for details.`
                    });
                }

                return Response.json({
                    success: true,
                    data: { run, alerts }
                });
            }

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Pipeline Monitoring Error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});