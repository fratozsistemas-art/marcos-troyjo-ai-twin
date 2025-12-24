import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const eventData = await req.json();
        const {
            interaction_type,
            event_name,
            content_type,
            content_id,
            content_title,
            content_metadata,
            duration_seconds,
            scroll_depth,
            section_visited,
            action_target,
            device_info
        } = eventData;

        if (!interaction_type || !content_type || !content_id) {
            return Response.json({ 
                error: 'interaction_type, content_type, and content_id are required' 
            }, { status: 400 });
        }

        // Calculate engagement score based on interaction
        const engagement_score = calculateEngagementScore({
            interaction_type,
            duration_seconds,
            scroll_depth
        });

        // Create interaction record with rich data
        const interaction = await base44.asServiceRole.entities.UserInteraction.create({
            user_email: user.email,
            interaction_type,
            event_name: event_name || `${interaction_type}_${content_type}`,
            content_type,
            content_id,
            content_title: content_title || 'Untitled',
            content_metadata: content_metadata || {},
            session_id: eventData.session_id || crypto.randomUUID(),
            duration_seconds,
            scroll_depth,
            section_visited,
            action_target,
            device_info: device_info || {},
            engagement_score
        });

        return Response.json({ 
            success: true, 
            interaction_id: interaction.id,
            engagement_score 
        });

    } catch (error) {
        console.error('Error tracking event:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateEngagementScore(data) {
    let score = 0;
    
    // Base score by interaction type
    const typeScores = {
        view: 10,
        click: 20,
        read: 30,
        purchase: 50,
        share: 40,
        download: 35,
        bookmark: 25,
        search: 15,
        scroll: 5
    };
    
    score += typeScores[data.interaction_type] || 10;
    
    // Duration bonus (up to 30 points)
    if (data.duration_seconds) {
        if (data.duration_seconds > 300) score += 30; // 5+ minutes
        else if (data.duration_seconds > 120) score += 20; // 2-5 minutes
        else if (data.duration_seconds > 60) score += 10; // 1-2 minutes
        else if (data.duration_seconds > 30) score += 5; // 30s-1min
    }
    
    // Scroll depth bonus (up to 20 points)
    if (data.scroll_depth) {
        if (data.scroll_depth > 90) score += 20; // Read almost everything
        else if (data.scroll_depth > 70) score += 15; // Read most
        else if (data.scroll_depth > 50) score += 10; // Read half
        else if (data.scroll_depth > 25) score += 5; // Quick scan
    }
    
    return Math.min(score, 100);
}