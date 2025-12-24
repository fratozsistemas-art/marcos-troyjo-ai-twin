import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content_type, content_id, content_title, content_metadata, duration_seconds } = await req.json();

        if (!content_type || !content_id) {
            return Response.json({ 
                error: 'content_type and content_id are required' 
            }, { status: 400 });
        }

        // Create interaction record
        await base44.asServiceRole.entities.UserInteraction.create({
            user_email: user.email,
            interaction_type: 'view',
            content_type,
            content_id,
            content_title: content_title || 'Untitled',
            content_metadata: content_metadata || {},
            session_id: crypto.randomUUID(),
            duration_seconds
        });

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error tracking view:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});