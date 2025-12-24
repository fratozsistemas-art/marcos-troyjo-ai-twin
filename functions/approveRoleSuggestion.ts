import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const permissionCheck = await base44.functions.invoke('checkFactPermission', {
            permission: 'manage_users'
        });

        if (!permissionCheck.data.has_permission) {
            return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { suggestion_id, action, review_notes } = await req.json();

        if (!suggestion_id || !action || !['approve', 'reject'].includes(action)) {
            return Response.json({ 
                error: 'suggestion_id and action (approve/reject) are required' 
            }, { status: 400 });
        }

        // Get suggestion
        const suggestions = await base44.asServiceRole.entities.RoleSuggestion.filter({
            id: suggestion_id
        });

        if (suggestions.length === 0) {
            return Response.json({ error: 'Suggestion not found' }, { status: 404 });
        }

        const suggestion = suggestions[0];

        if (suggestion.status !== 'pending') {
            return Response.json({ 
                error: `Suggestion is already ${suggestion.status}` 
            }, { status: 400 });
        }

        // Update suggestion status
        await base44.asServiceRole.entities.RoleSuggestion.update(suggestion.id, {
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewed_by: user.email,
            reviewed_at: new Date().toISOString(),
            review_notes
        });

        // If approved, assign the role
        if (action === 'approve') {
            await base44.functions.invoke('assignUserRole', {
                user_email: suggestion.user_email,
                role_id: suggestion.suggested_role_id,
                assignment_reason: `AI-suggested role assignment (approved by ${user.email})`
            });
        }

        return Response.json({
            success: true,
            action,
            suggestion_id
        });

    } catch (error) {
        console.error('Error processing suggestion:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});