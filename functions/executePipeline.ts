import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pipeline_id, trigger_data = {} } = await req.json();

        // Get pipeline config
        const pipelines = await base44.asServiceRole.entities.MLPipeline.filter({ id: pipeline_id });
        if (pipelines.length === 0) {
            return Response.json({ error: 'Pipeline not found' }, { status: 404 });
        }
        const pipeline = pipelines[0];

        if (!pipeline.enabled) {
            return Response.json({ error: 'Pipeline is disabled' }, { status: 400 });
        }

        // Get last run number
        const lastRuns = await base44.asServiceRole.entities.PipelineRun.filter(
            { pipeline_id },
            '-run_number',
            1
        );
        const runNumber = lastRuns.length > 0 ? lastRuns[0].run_number + 1 : 1;

        // Create pipeline run
        const run = await base44.asServiceRole.entities.PipelineRun.create({
            pipeline_id,
            run_number: runNumber,
            trigger_type: trigger_data.trigger_type || 'manual',
            trigger_data,
            status: 'running',
            stages: pipeline.stages.map(s => ({
                name: s.name,
                status: 'pending',
                logs: '',
                artifacts: []
            })),
            started_at: new Date().toISOString(),
            git_commit_hash: trigger_data.commit_hash,
            triggered_by: user.email
        });

        // Log audit
        await base44.asServiceRole.entities.MLAuditLog.create({
            user_email: user.email,
            action_type: 'trigger_pipeline',
            resource_type: 'pipeline',
            resource_id: pipeline_id,
            resource_name: pipeline.name,
            action_details: { run_id: run.id, run_number: runNumber },
            status: 'success'
        });

        // Execute stages sequentially (in production, use queue/worker system)
        let overallStatus = 'success';
        const updatedStages = [];

        for (let i = 0; i < pipeline.stages.length; i++) {
            const stage = pipeline.stages[i];
            const stageState = { ...run.stages[i] };

            // Check dependencies
            if (stage.depends_on && stage.depends_on.length > 0) {
                const depsFailed = stage.depends_on.some(depName => {
                    const depStage = updatedStages.find(s => s.name === depName);
                    return depStage && depStage.status !== 'success';
                });
                if (depsFailed) {
                    stageState.status = 'skipped';
                    updatedStages.push(stageState);
                    continue;
                }
            }

            stageState.status = 'running';
            stageState.started_at = new Date().toISOString();

            // Simulate stage execution (in production, run actual scripts)
            try {
                // Mock execution based on stage type
                await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

                if (stage.type === 'train' && pipeline.mlflow_experiment_id) {
                    // Create MLflow run
                    const mlflowResp = await base44.functions.invoke('mlflowManager', {
                        action: 'createRun',
                        data: {
                            experiment_id: pipeline.mlflow_experiment_id,
                            tags: { pipeline_run: run.id, stage: stage.name }
                        }
                    });
                    if (mlflowResp.data.success) {
                        stageState.artifacts.push(`mlflow_run:${mlflowResp.data.data.run_id}`);
                    }
                }

                stageState.status = 'success';
                stageState.logs = `Stage ${stage.name} completed successfully\nExecuted: ${stage.script || 'N/A'}`;
            } catch (error) {
                stageState.status = 'failed';
                stageState.error_message = error.message;
                stageState.logs = `Stage ${stage.name} failed: ${error.message}`;
                overallStatus = 'failed';
            }

            stageState.completed_at = new Date().toISOString();
            stageState.duration_seconds = Math.floor(
                (new Date(stageState.completed_at) - new Date(stageState.started_at)) / 1000
            );

            updatedStages.push(stageState);

            // Update run with current stage status
            await base44.asServiceRole.entities.PipelineRun.update(run.id, {
                stages: updatedStages,
                status: overallStatus === 'failed' ? 'failed' : 'running'
            });

            // Stop if stage failed and no retry
            if (stageState.status === 'failed' && !stage.retry_on_failure) {
                break;
            }
        }

        // Finalize run
        const completedAt = new Date().toISOString();
        await base44.asServiceRole.entities.PipelineRun.update(run.id, {
            status: overallStatus,
            stages: updatedStages,
            completed_at: completedAt,
            duration_seconds: Math.floor((new Date(completedAt) - new Date(run.started_at)) / 1000)
        });

        // Update pipeline last run status
        await base44.asServiceRole.entities.MLPipeline.update(pipeline_id, {
            last_run_id: run.id,
            last_run_status: overallStatus
        });

        // Send notifications
        if (pipeline.notification_emails?.length > 0) {
            const statusEmoji = overallStatus === 'success' ? '✅' : '❌';
            for (const email of pipeline.notification_emails) {
                await base44.integrations.Core.SendEmail({
                    to: email,
                    subject: `${statusEmoji} Pipeline ${pipeline.name} - ${overallStatus}`,
                    body: `Pipeline Run #${runNumber}\nStatus: ${overallStatus}\nDuration: ${Math.floor((new Date(completedAt) - new Date(run.started_at)) / 1000)}s`
                });
            }
        }

        return Response.json({
            success: true,
            run_id: run.id,
            run_number: runNumber,
            status: overallStatus,
            stages: updatedStages
        });
    } catch (error) {
        console.error('Error executing pipeline:', error);
        return Response.json({
            error: error.message,
            success: false
        }, { status: 500 });
    }
});