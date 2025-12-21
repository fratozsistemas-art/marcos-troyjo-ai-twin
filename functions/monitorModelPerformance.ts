import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all active retraining configs
        const configs = await base44.asServiceRole.entities.ModelRetrainingConfig.filter({
            enabled: true
        });

        const triggeredJobs = [];

        for (const config of configs) {
            let shouldRetrain = false;
            let reason = '';

            // Check metric thresholds
            if (config.trigger_type === 'metric_threshold' && config.metric_thresholds) {
                const { metric_name, operator, threshold_value } = config.metric_thresholds;
                const currentValue = config.baseline_metrics?.[metric_name];

                if (currentValue !== undefined) {
                    if (operator === 'less_than' && currentValue < threshold_value) {
                        shouldRetrain = true;
                        reason = `Metric ${metric_name} (${currentValue}) below threshold ${threshold_value}`;
                    } else if (operator === 'greater_than' && currentValue > threshold_value) {
                        shouldRetrain = true;
                        reason = `Metric ${metric_name} (${currentValue}) above threshold ${threshold_value}`;
                    }
                }
            }

            // Check data drift (simplified - you'd integrate with your drift detection service)
            if (config.trigger_type === 'data_drift') {
                // Placeholder for drift detection logic
                // In production, call your drift detection service
                const driftScore = 0; // Mock value
                if (driftScore > config.drift_threshold) {
                    shouldRetrain = true;
                    reason = `Data drift detected: ${driftScore} > ${config.drift_threshold}`;
                }
            }

            if (shouldRetrain) {
                // Create retraining job
                const job = await base44.asServiceRole.entities.RetrainingJob.create({
                    config_id: config.id,
                    model_name: config.model_name,
                    trigger_reason: reason,
                    status: 'pending',
                    baseline_metrics: config.baseline_metrics,
                    training_params: config.training_params,
                    triggered_by: 'system'
                });

                // Log audit action
                await base44.asServiceRole.entities.MLAuditLog.create({
                    user_email: 'system@automated',
                    action_type: 'trigger_retraining',
                    resource_type: 'model',
                    resource_id: config.id,
                    resource_name: config.model_name,
                    action_details: { reason, job_id: job.id },
                    status: 'success'
                });

                triggeredJobs.push(job);

                // Update last check date
                await base44.asServiceRole.entities.ModelRetrainingConfig.update(config.id, {
                    last_check_date: new Date().toISOString()
                });
            }
        }

        return Response.json({
            success: true,
            checked: configs.length,
            triggered: triggeredJobs.length,
            jobs: triggeredJobs
        });
    } catch (error) {
        console.error('Error monitoring model performance:', error);
        return Response.json({
            error: error.message,
            success: false
        }, { status: 500 });
    }
});