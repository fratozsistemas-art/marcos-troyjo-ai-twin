import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has permission to manage users
        const permissionCheck = await base44.functions.invoke('checkFactPermission', {
            permission: 'manage_users'
        });

        if (!permissionCheck.data.has_permission) {
            return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { user_email, role_id, assignment_reason, expires_at } = await req.json();

        if (!user_email || !role_id) {
            return Response.json({ error: 'user_email and role_id are required' }, { status: 400 });
        }

        // Get role details
        const role = await base44.asServiceRole.entities.FactRole.filter({ id: role_id });
        if (role.length === 0) {
            return Response.json({ error: 'Role not found' }, { status: 404 });
        }

        // Remove existing assignments for this user and role
        const existing = await base44.asServiceRole.entities.UserRoleAssignment.filter({
            user_email,
            role_id
        });

        for (const assignment of existing) {
            await base44.asServiceRole.entities.UserRoleAssignment.delete(assignment.id);
        }

        // Create new assignment
        const assignment = await base44.asServiceRole.entities.UserRoleAssignment.create({
            user_email,
            role_id,
            role_name: role[0].role_name,
            assigned_by: user.email,
            assignment_reason,
            expires_at
        });

        return Response.json({
            success: true,
            assignment
        });

    } catch (error) {
        console.error('Error assigning role:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});