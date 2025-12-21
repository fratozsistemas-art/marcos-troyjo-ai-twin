import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Get webhook payload
        const payload = await req.json();
        const event = req.headers.get('x-github-event') || 
                     req.headers.get('x-gitlab-event') ||
                     'push';

        // Handle push events
        if (event === 'push' || event === 'Push Hook') {
            const branch = payload.ref?.replace('refs/heads/', '') || payload.ref;
            const commitHash = payload.after || payload.checkout_sha;
            const repoUrl = payload.repository?.url || payload.repository?.git_http_url;

            // Find pipelines configured for this repo and branch
            const pipelines = await base44.asServiceRole.entities.MLPipeline.filter({
                git_repo_url: repoUrl,
                git_branch: branch,
                trigger_on_commit: true,
                enabled: true
            });

            const triggeredRuns = [];

            for (const pipeline of pipelines) {
                // Create pipeline run
                const response = await base44.functions.invoke('executePipeline', {
                    pipeline_id: pipeline.id,
                    trigger_data: {
                        trigger_type: 'commit',
                        commit_hash: commitHash,
                        branch,
                        repository: repoUrl,
                        author: payload.pusher?.name || payload.user_name
                    }
                });

                if (response.data.success) {
                    triggeredRuns.push(response.data);
                }

                // Log audit
                await base44.asServiceRole.entities.MLAuditLog.create({
                    user_email: 'git@webhook',
                    action_type: 'trigger_pipeline',
                    resource_type: 'pipeline',
                    resource_id: pipeline.id,
                    resource_name: pipeline.name,
                    action_details: { commit_hash: commitHash, branch },
                    status: 'success'
                });
            }

            return Response.json({
                success: true,
                triggered: triggeredRuns.length,
                runs: triggeredRuns
            });
        }

        return Response.json({ success: true, message: 'Event ignored' });
    } catch (error) {
        console.error('Error processing git webhook:', error);
        return Response.json({
            error: error.message,
            success: false
        }, { status: 500 });
    }
});