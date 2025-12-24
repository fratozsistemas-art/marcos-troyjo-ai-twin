import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all user interactions
        const interactions = await base44.asServiceRole.entities.UserInteraction.filter({
            user_email: user.email
        });

        // Calculate comprehensive insights
        const insights = {
            overview: calculateOverview(interactions),
            content_preferences: analyzeContentPreferences(interactions),
            engagement_patterns: analyzeEngagementPatterns(interactions),
            section_frequency: analyzeSectionFrequency(interactions),
            reading_behavior: analyzeReadingBehavior(interactions),
            conversion_metrics: analyzeConversions(interactions),
            time_based_patterns: analyzeTimePatterns(interactions)
        };

        return Response.json(insights);

    } catch (error) {
        console.error('Error getting insights:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateOverview(interactions) {
    const total = interactions.length;
    const avgEngagement = interactions.reduce((sum, i) => sum + (i.engagement_score || 0), 0) / total;
    const totalTime = interactions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0);
    
    const uniqueSessions = new Set(interactions.map(i => i.session_id)).size;
    const uniqueContent = new Set(interactions.map(i => i.content_id)).size;
    
    return {
        total_interactions: total,
        avg_engagement_score: Math.round(avgEngagement),
        total_time_spent_minutes: Math.round(totalTime / 60),
        unique_sessions: uniqueSessions,
        unique_content_viewed: uniqueContent,
        interactions_per_session: Math.round(total / uniqueSessions)
    };
}

function analyzeContentPreferences(interactions) {
    const typeCount = {};
    const typeEngagement = {};
    
    interactions.forEach(i => {
        typeCount[i.content_type] = (typeCount[i.content_type] || 0) + 1;
        typeEngagement[i.content_type] = (typeEngagement[i.content_type] || []);
        typeEngagement[i.content_type].push(i.engagement_score || 0);
    });
    
    return Object.entries(typeCount).map(([type, count]) => ({
        content_type: type,
        view_count: count,
        avg_engagement: Math.round(
            typeEngagement[type].reduce((a, b) => a + b, 0) / typeEngagement[type].length
        ),
        percentage: Math.round((count / interactions.length) * 100)
    })).sort((a, b) => b.view_count - a.view_count);
}

function analyzeEngagementPatterns(interactions) {
    const patterns = {
        high_engagement: 0,
        medium_engagement: 0,
        low_engagement: 0,
        avg_scroll_depth: 0,
        completion_rate: 0
    };
    
    let scrollCount = 0;
    let completedReads = 0;
    
    interactions.forEach(i => {
        const score = i.engagement_score || 0;
        if (score > 70) patterns.high_engagement++;
        else if (score > 40) patterns.medium_engagement++;
        else patterns.low_engagement++;
        
        if (i.scroll_depth) {
            patterns.avg_scroll_depth += i.scroll_depth;
            scrollCount++;
            if (i.scroll_depth > 80) completedReads++;
        }
    });
    
    if (scrollCount > 0) {
        patterns.avg_scroll_depth = Math.round(patterns.avg_scroll_depth / scrollCount);
        patterns.completion_rate = Math.round((completedReads / scrollCount) * 100);
    }
    
    return patterns;
}

function analyzeSectionFrequency(interactions) {
    const sectionCount = {};
    
    interactions.forEach(i => {
        if (i.section_visited) {
            sectionCount[i.section_visited] = (sectionCount[i.section_visited] || 0) + 1;
        }
    });
    
    return Object.entries(sectionCount)
        .map(([section, count]) => ({ section, visit_count: count }))
        .sort((a, b) => b.visit_count - a.visit_count)
        .slice(0, 10);
}

function analyzeReadingBehavior(interactions) {
    const readInteractions = interactions.filter(i => 
        i.interaction_type === 'read' || i.duration_seconds > 30
    );
    
    if (readInteractions.length === 0) {
        return { avg_reading_time: 0, reading_sessions: 0 };
    }
    
    const totalReadTime = readInteractions.reduce((sum, i) => sum + (i.duration_seconds || 0), 0);
    
    return {
        avg_reading_time_minutes: Math.round(totalReadTime / readInteractions.length / 60),
        reading_sessions: readInteractions.length,
        longest_session_minutes: Math.round(
            Math.max(...readInteractions.map(i => i.duration_seconds || 0)) / 60
        ),
        shortest_session_minutes: Math.round(
            Math.min(...readInteractions.map(i => i.duration_seconds || 0)) / 60
        )
    };
}

function analyzeConversions(interactions) {
    const purchaseClicks = interactions.filter(i => i.event_name === 'purchase_click').length;
    const shares = interactions.filter(i => i.interaction_type === 'share').length;
    const bookmarks = interactions.filter(i => i.interaction_type === 'bookmark').length;
    const downloads = interactions.filter(i => i.interaction_type === 'download').length;
    
    return {
        purchase_clicks: purchaseClicks,
        shares: shares,
        bookmarks: bookmarks,
        downloads: downloads,
        conversion_rate: Math.round((purchaseClicks / interactions.length) * 100)
    };
}

function analyzeTimePatterns(interactions) {
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    
    interactions.forEach(i => {
        const date = new Date(i.created_date);
        hourCounts[date.getHours()]++;
        dayCounts[date.getDay()]++;
    });
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
        dayCounts.indexOf(Math.max(...dayCounts))
    ];
    
    return {
        peak_hour: peakHour,
        peak_day: peakDay,
        hourly_distribution: hourCounts,
        daily_distribution: dayCounts
    };
}