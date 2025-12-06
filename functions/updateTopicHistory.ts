import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { topics } = await req.json();

        if (!topics || !Array.isArray(topics)) {
            return Response.json({ error: 'Topics array required' }, { status: 400 });
        }

        // Get or create user profile
        const profiles = await base44.asServiceRole.entities.UserProfile.filter({
            user_email: user.email
        });

        let profile;
        if (profiles.length === 0) {
            profile = await base44.asServiceRole.entities.UserProfile.create({
                user_email: user.email,
                interests: {
                    industries: [],
                    regions: [],
                    economic_theories: [],
                    topics: []
                },
                topic_history: [],
                dashboard_preferences: {
                    layout: 'comfortable',
                    visible_sections: ['conversations', 'insights', 'vocabulary', 'agent_control'],
                    theme: 'light',
                    language: 'pt'
                }
            });
        } else {
            profile = profiles[0];
        }

        // Update topic history
        const topicHistory = profile.topic_history || [];
        const now = new Date().toISOString();

        topics.forEach(topic => {
            const existing = topicHistory.find(t => t.topic === topic);
            if (existing) {
                existing.count += 1;
                existing.last_discussed = now;
            } else {
                topicHistory.push({
                    topic,
                    count: 1,
                    last_discussed: now
                });
            }
        });

        // Keep only top 20 topics
        const sortedHistory = topicHistory
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
            topic_history: sortedHistory
        });

        return Response.json({ 
            success: true,
            updated_topics: sortedHistory.length
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});