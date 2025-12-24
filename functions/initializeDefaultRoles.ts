import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const defaultRoles = [
            {
                role_name: 'viewer',
                display_name: 'Viewer',
                description: 'Can view facts and history',
                permissions: {
                    read_facts: true,
                    view_history: true,
                    access_analytics: true
                }
            },
            {
                role_name: 'editor',
                display_name: 'Editor',
                description: 'Can create and update facts',
                permissions: {
                    read_facts: true,
                    create_facts: true,
                    update_facts: true,
                    view_history: true,
                    link_facts: true,
                    access_analytics: true
                }
            },
            {
                role_name: 'validator',
                display_name: 'Validator',
                description: 'Can validate and approve/reject facts',
                permissions: {
                    read_facts: true,
                    create_facts: true,
                    update_facts: true,
                    validate_facts: true,
                    approve_facts: true,
                    reject_facts: true,
                    view_history: true,
                    link_facts: true,
                    access_analytics: true
                }
            },
            {
                role_name: 'administrator',
                display_name: 'Administrator',
                description: 'Full system access',
                permissions: {
                    read_facts: true,
                    create_facts: true,
                    update_facts: true,
                    delete_facts: true,
                    validate_facts: true,
                    approve_facts: true,
                    reject_facts: true,
                    view_history: true,
                    revert_versions: true,
                    link_facts: true,
                    manage_users: true,
                    manage_roles: true,
                    access_analytics: true
                }
            }
        ];

        const created = [];
        for (const roleData of defaultRoles) {
            // Check if role already exists
            const existing = await base44.asServiceRole.entities.FactRole.filter({
                role_name: roleData.role_name
            });

            if (existing.length === 0) {
                const role = await base44.asServiceRole.entities.FactRole.create(roleData);
                created.push(role);
            }
        }

        return Response.json({
            success: true,
            created_count: created.length,
            created_roles: created
        });

    } catch (error) {
        console.error('Error initializing roles:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});