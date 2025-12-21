import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ 
                authorized: false,
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        const body = await req.json();
        const { resource, action } = body;

        // Check if user is admin - admins have all permissions
        if (user.role === 'admin') {
            return Response.json({ 
                authorized: true,
                role: 'admin'
            });
        }

        // Get user's ML permissions
        const permissions = await base44.asServiceRole.entities.MLPermission.filter({
            user_emails: { $contains: user.email },
            is_active: true
        });

        if (permissions.length === 0) {
            return Response.json({ 
                authorized: false,
                error: 'No ML permissions found'
            });
        }

        // Check if user has the required permission
        const userPermission = permissions[0];
        const hasPermission = userPermission.permissions?.[resource]?.[action] === true;

        return Response.json({ 
            authorized: hasPermission,
            role: userPermission.role_name,
            permissions: userPermission.permissions
        });
    } catch (error) {
        console.error('Error checking ML permission:', error);
        return Response.json({ 
            authorized: false,
            error: error.message 
        }, { status: 500 });
    }
});