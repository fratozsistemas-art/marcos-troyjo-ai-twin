import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ 
                authorized: false,
                reason: 'Not authenticated'
            }, { status: 401 });
        }

        const { permission_key } = await req.json();

        // Get user role
        const roles = await base44.asServiceRole.entities.Role.filter({
            user_email: user.email,
            is_active: true
        });

        if (roles.length === 0) {
            return Response.json({
                authorized: false,
                reason: 'No role assigned',
                role: null
            });
        }

        const role = roles[0];
        
        // Parse permission key (e.g., "ssot.manage_sources")
        const [module, permission] = permission_key.split('.');
        
        let hasPermission = false;
        if (role.permissions?.[module]?.[permission] !== undefined) {
            hasPermission = role.permissions[module][permission];
        }

        return Response.json({
            authorized: hasPermission,
            role: role.role_type,
            permissions: role.permissions
        });

    } catch (error) {
        console.error('Error checking permissions:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});