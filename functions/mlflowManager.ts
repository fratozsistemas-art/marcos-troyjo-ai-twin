import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, data } = await req.json();
        const trackingUri = Deno.env.get('MLFLOW_TRACKING_URI');
        const token = Deno.env.get('GITLAB_TOKEN');

        if (!trackingUri || !token) {
            return Response.json({ 
                error: 'MLflow configuration missing',
                details: 'Configure MLFLOW_TRACKING_URI and GITLAB_TOKEN'
            }, { status: 500 });
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        let response;
        let url;

        switch (action) {
            case 'listExperiments':
                url = `${trackingUri}/experiments/search`;
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        max_results: data?.limit || 50,
                        view_type: 'ACTIVE_ONLY'
                    })
                });
                break;

            case 'createExperiment':
                if (!data?.name) {
                    return Response.json({ error: 'Experiment name required' }, { status: 400 });
                }
                url = `${trackingUri}/experiments/create`;
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        name: data.name,
                        tags: data.tags || []
                    })
                });
                break;

            case 'getExperiment':
                if (!data?.experimentId) {
                    return Response.json({ error: 'Experiment ID required' }, { status: 400 });
                }
                url = `${trackingUri}/experiments/get?experiment_id=${data.experimentId}`;
                response = await fetch(url, { headers });
                break;

            case 'listRuns':
                if (!data?.experimentId) {
                    return Response.json({ error: 'Experiment ID required' }, { status: 400 });
                }
                url = `${trackingUri}/runs/search`;
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        experiment_ids: [data.experimentId],
                        max_results: data?.limit || 50,
                        order_by: ['start_time DESC']
                    })
                });
                break;

            case 'getRun':
                if (!data?.runId) {
                    return Response.json({ error: 'Run ID required' }, { status: 400 });
                }
                url = `${trackingUri}/runs/get?run_id=${data.runId}`;
                response = await fetch(url, { headers });
                break;

            case 'createRun':
                if (!data?.experimentId) {
                    return Response.json({ error: 'Experiment ID required' }, { status: 400 });
                }
                url = `${trackingUri}/runs/create`;
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        experiment_id: data.experimentId,
                        start_time: Date.now(),
                        tags: data.tags || []
                    })
                });
                break;

            case 'logMetric':
                if (!data?.runId || !data?.key || data?.value === undefined) {
                    return Response.json({ error: 'Run ID, metric key, and value required' }, { status: 400 });
                }
                url = `${trackingUri}/runs/log-metric`;
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        run_id: data.runId,
                        key: data.key,
                        value: data.value,
                        timestamp: data.timestamp || Date.now(),
                        step: data.step || 0
                    })
                });
                break;

            case 'logParameter':
                if (!data?.runId || !data?.key || !data?.value) {
                    return Response.json({ error: 'Run ID, parameter key, and value required' }, { status: 400 });
                }
                url = `${trackingUri}/runs/log-parameter`;
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        run_id: data.runId,
                        key: data.key,
                        value: data.value
                    })
                });
                break;

            case 'getMetricHistory':
                if (!data?.runId || !data?.metricKey) {
                    return Response.json({ error: 'Run ID and metric key required' }, { status: 400 });
                }
                url = `${trackingUri}/metrics/get-history?run_id=${data.runId}&metric_key=${data.metricKey}`;
                response = await fetch(url, { headers });
                break;

            default:
                return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (!response.ok) {
            const error = await response.text();
            return Response.json({ 
                error: 'MLflow API error', 
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
        console.error('MLflow Manager Error:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});