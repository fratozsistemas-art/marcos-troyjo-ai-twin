import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { validateString, validateEnum } from './utils/inputValidator.js';

// This function can be called when content is created/updated to auto-trigger workflows
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Input validation
        const contentId = validateString(body.content_id, { maxLength: 100, paramName: 'content_id' });
        const contentType = validateEnum(
            body.content_type,
            ['article', 'document', 'fact', 'publication'],
            'content_type'
        );
        const triggerType = validateEnum(
            body.trigger_type,
            ['on_create', 'on_update'],
            'trigger_type'
        );

        // Find applicable workflows
        const allWorkflows = await base44.asServiceRole.entities.ContentCurationWorkflow.filter({
            status: 'active',
            trigger_type: triggerType
        });

        const applicableWorkflows = allWorkflows.filter(w => 
            w.content_types.includes(contentType) || w.content_types.includes('all')
        );

        if (applicableWorkflows.length === 0) {
            return Response.json({
                success: true,
                message: 'No applicable workflows found',
                triggered: 0
            });
        }

        // Execute each applicable workflow
        const results = [];
        
        for (const workflow of applicableWorkflows) {
            try {
                const execution = await base44.asServiceRole.functions.invoke('executeContentCurationWorkflow', {
                    workflow_id: workflow.id,
                    content_id: contentId,
                    content_type: contentType
                });

                results.push({
                    workflow_id: workflow.id,
                    workflow_name: workflow.name,
                    status: 'executed',
                    execution_id: execution.data.execution_id
                });
            } catch (error) {
                results.push({
                    workflow_id: workflow.id,
                    workflow_name: workflow.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            triggered: applicableWorkflows.length,
            results,
            content_id: contentId,
            content_type: contentType
        });

    } catch (error) {
        console.error('Auto-trigger workflows error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});