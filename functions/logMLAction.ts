import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { action_type, resource_type, resource_id, resource_name, action_details, status, error_message } = body;

        // Get IP and user agent from request headers
        const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const user_agent = req.headers.get('user-agent') || 'unknown';

        // Create audit log entry
        await base44.asServiceRole.entities.MLAuditLog.create({
            user_email: user.email,
            action_type,
            resource_type,
            resource_id,
            resource_name,
            action_details: action_details || {},
            ip_address,
            user_agent,
            status: status || 'success',
            error_message,
            session_id: req.headers.get('x-session-id') || null
        });

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error logging ML action:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});