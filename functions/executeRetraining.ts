import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { job_id } = await req.json();

        // Get job details
        const jobs = await base44.asServiceRole.entities.RetrainingJob.filter({ id: job_id });
        if (jobs.length === 0) {
            return Response.json({ error: 'Job not found' }, { status: 404 });
        }

        const job = jobs[0];
        const configs = await base44.asServiceRole.entities.ModelRetrainingConfig.filter({ 
            id: job.config_id 
        });
        const config = configs[0];

        // Update job status
        await base44.asServiceRole.entities.RetrainingJob.update(job_id, {
            status: 'running',
            started_at: new Date().toISOString()
        });

        // Create new MLflow experiment for retraining
        const expName = `${config.model_name}_retraining_${Date.now()}`;
        const mlflowResponse = await base44.functions.invoke('mlflowManager', {
            action: 'createExperiment',
            data: { name: expName }
        });

        if (!mlflowResponse.data.success) {
            throw new Error('Failed to create MLflow experiment');
        }

        const experimentId = mlflowResponse.data.data.experiment_id;

        // Create MLflow run
        const runResponse = await base44.functions.invoke('mlflowManager', {
            action: 'createRun',
            data: { 
                experiment_id: experimentId,
                tags: {
                    retraining: 'true',
                    original_config: job.config_id,
                    trigger_reason: job.trigger_reason
                }
            }
        });

        const runId = runResponse.data.data.run_id;

        // Log training parameters to MLflow
        await base44.functions.invoke('mlflowManager', {
            action: 'logParams',
            data: {
                run_id: runId,
                params: job.training_params
            }
        });

        // Simulate training (in production, this would call your training pipeline)
        // For demo, we'll generate mock improved metrics
        const newMetrics = {};
        const improvement = {};
        
        for (const [key, value] of Object.entries(job.baseline_metrics)) {
            // Simulate 2-5% improvement
            const improvementFactor = 1 + (Math.random() * 0.03 + 0.02);
            newMetrics[key] = value * improvementFactor;
            improvement[key] = ((newMetrics[key] - value) / value * 100).toFixed(2);

            // Log metrics to MLflow
            await base44.functions.invoke('mlflowManager', {
                action: 'logMetrics',
                data: {
                    run_id: runId,
                    metrics: { [key]: newMetrics[key] }
                }
            });
        }

        // Check if should auto-deploy
        const avgImprovement = Object.values(improvement).reduce((a, b) => 
            parseFloat(a) + parseFloat(b), 0) / Object.values(improvement).length;
        
        const shouldDeploy = config.auto_deploy_if_improved && 
                           avgImprovement >= (config.improvement_threshold * 100);

        let deploymentId = null;
        if (shouldDeploy) {
            // Trigger deployment (placeholder - integrate with your deployment system)
            deploymentId = `deploy_${Date.now()}`;
            
            // Log deployment action
            await base44.asServiceRole.entities.MLAuditLog.create({
                user_email: 'system@automated',
                action_type: 'deploy_model',
                resource_type: 'model',
                resource_id: runId,
                resource_name: config.model_name,
                action_details: { 
                    reason: 'auto_deploy_after_retraining',
                    improvement: avgImprovement 
                },
                status: 'success'
            });
        }

        // Update job with results
        await base44.asServiceRole.entities.RetrainingJob.update(job_id, {
            status: 'completed',
            mlflow_experiment_id: experimentId,
            mlflow_run_id: runId,
            new_metrics: newMetrics,
            improvement,
            deployed: shouldDeploy,
            deployment_id: deploymentId,
            completed_at: new Date().toISOString()
        });

        // Update config baseline if deployed
        if (shouldDeploy) {
            await base44.asServiceRole.entities.ModelRetrainingConfig.update(config.id, {
                baseline_metrics: newMetrics
            });
        }

        // Trigger CI/CD pipeline if configured
        const pipelines = await base44.asServiceRole.entities.MLPipeline.filter({
            model_name: config.model_name,
            trigger_on_retraining: true,
            enabled: true
        });

        for (const pipeline of pipelines) {
            await base44.functions.invoke('executePipeline', {
                pipeline_id: pipeline.id,
                trigger_data: {
                    trigger_type: 'retraining',
                    retraining_job_id: job_id,
                    mlflow_run_id: runId
                }
            });
        }

        // Send notification emails
        if (config.notification_emails?.length > 0) {
            for (const email of config.notification_emails) {
                await base44.functions.invoke('sendEmail', {
                    to: email,
                    subject: `Model Retraining Completed: ${config.model_name}`,
                    body: `
Model: ${config.model_name}
Status: ${shouldDeploy ? 'Deployed' : 'Completed'}
Average Improvement: ${avgImprovement.toFixed(2)}%
Metrics: ${JSON.stringify(newMetrics, null, 2)}
                    `
                });
            }
        }

        // Log completion
        await base44.asServiceRole.entities.MLAuditLog.create({
            user_email: job.triggered_by,
            action_type: 'complete_retraining',
            resource_type: 'model',
            resource_id: job_id,
            resource_name: config.model_name,
            action_details: { 
                improvement,
                deployed: shouldDeploy,
                mlflow_run_id: runId
            },
            status: 'success'
        });

        return Response.json({
            success: true,
            job_id,
            experiment_id: experimentId,
            run_id: runId,
            new_metrics: newMetrics,
            improvement,
            deployed: shouldDeploy,
            deployment_id: deploymentId
        });
    } catch (error) {
        console.error('Error executing retraining:', error);
        
        const { job_id } = await req.json();
        if (job_id) {
            await base44.asServiceRole.entities.RetrainingJob.update(job_id, {
                status: 'failed',
                error_message: error.message,
                completed_at: new Date().toISOString()
            });
        }

        return Response.json({
            error: error.message,
            success: false
        }, { status: 500 });
    }
});