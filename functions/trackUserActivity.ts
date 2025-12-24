import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { activity_type, entity_type, entity_id, details } = await req.json();

        if (!activity_type) {
            return Response.json({ error: 'activity_type is required' }, { status: 400 });
        }

        // Create activity record
        await base44.asServiceRole.entities.UserActivity.create({
            user_email: user.email,
            activity_type,
            entity_type,
            entity_id,
            details: details || {}
        });

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error tracking activity:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});