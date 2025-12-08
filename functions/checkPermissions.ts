import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Default permissions by role
const DEFAULT_PERMISSIONS = {
    admin: {
        articles: { create: true, read: true, update: true, delete: true, publish: true, revise: true },
        editorial_calendar: { create: true, read: true, update: true, delete: true },
        documents: { upload: true, read: true, delete: true },
        conversations: { create: true, read_own: true, read_all: true, delete: true },
        users: { invite: true, manage_roles: true, view_all: true },
        analytics: { view_basic: true, view_detailed: true, export: true }
    },
    executive: {
        articles: { create: true, read: true, update: true, delete: false, publish: false, revise: false },
        editorial_calendar: { create: true, read: true, update: true, delete: false },
        documents: { upload: true, read: true, delete: false },
        conversations: { create: true, read_own: true, read_all: false, delete: false },
        users: { invite: false, manage_roles: false, view_all: false },
        analytics: { view_basic: true, view_detailed: true, export: true }
    },
    analyst: {
        articles: { create: true, read: true, update: false, delete: false, publish: false, revise: false },
        editorial_calendar: { create: false, read: true, update: false, delete: false },
        documents: { upload: true, read: true, delete: false },
        conversations: { create: true, read_own: true, read_all: false, delete: false },
        users: { invite: false, manage_roles: false, view_all: false },
        analytics: { view_basic: true, view_detailed: false, export: false }
    },
    guest: {
        articles: { create: false, read: true, update: false, delete: false, publish: false, revise: false },
        editorial_calendar: { create: false, read: true, update: false, delete: false },
        documents: { upload: false, read: true, delete: false },
        conversations: { create: true, read_own: true, read_all: false, delete: false },
        users: { invite: false, manage_roles: false, view_all: false },
        analytics: { view_basic: true, view_detailed: false, export: false }
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { resource, action } = await req.json();

        // Check if user has custom role
        const roles = await base44.asServiceRole.entities.Role.filter({
            user_email: user.email,
            is_active: true
        });

        let permissions;
        let roleType = 'guest';
        let specialPrivileges = [];

        if (roles.length > 0) {
            const role = roles[0];
            roleType = role.role_type;
            permissions = role.permissions || DEFAULT_PERMISSIONS[roleType];
            specialPrivileges = role.special_privileges || [];
        } else {
            // Fallback to default permissions
            roleType = user.role === 'admin' ? 'admin' : 'guest';
            permissions = DEFAULT_PERMISSIONS[roleType];
        }

        // Check permission
        const resourcePerms = permissions[resource];
        const hasPermission = resourcePerms?.[action] === true;

        return Response.json({
            allowed: hasPermission,
            role_type: roleType,
            special_privileges: specialPrivileges,
            all_permissions: permissions
        });

    } catch (error) {
        console.error('Error checking permissions:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});