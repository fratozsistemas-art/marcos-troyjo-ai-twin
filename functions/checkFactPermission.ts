import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { permission } = await req.json();

        if (!permission) {
            return Response.json({ error: 'permission is required' }, { status: 400 });
        }

        // Check if user is admin (built-in role)
        if (user.role === 'admin') {
            return Response.json({ 
                has_permission: true, 
                role: 'admin',
                reason: 'Built-in administrator'
            });
        }

        // Get user's role assignments
        const assignments = await base44.asServiceRole.entities.UserRoleAssignment.filter({
            user_email: user.email
        });

        if (assignments.length === 0) {
            // Default to viewer role if no assignment
            return Response.json({ 
                has_permission: permission === 'read_facts' || permission === 'view_history',
                role: 'default',
                reason: 'Default viewer permissions'
            });
        }

        // Check each assigned role
        for (const assignment of assignments) {
            // Skip expired assignments
            if (assignment.expires_at && new Date(assignment.expires_at) < new Date()) {
                continue;
            }

            // Get the role details
            const roles = await base44.asServiceRole.entities.FactRole.filter({
                id: assignment.role_id,
                active: true
            });

            if (roles.length > 0) {
                const role = roles[0];
                if (role.permissions && role.permissions[permission] === true) {
                    return Response.json({ 
                        has_permission: true,
                        role: role.role_name,
                        role_display_name: role.display_name
                    });
                }
            }
        }

        return Response.json({ 
            has_permission: false,
            role: 'none',
            reason: 'Permission not granted by any assigned role'
        });

    } catch (error) {
        console.error('Error checking permission:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});