import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get comprehensive user interaction data and engagement insights
        const [interactions, profile, engagementInsights] = await Promise.all([
            base44.asServiceRole.entities.UserInteraction.filter({ user_email: user.email }),
            base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email }).then(p => p[0]),
            base44.functions.invoke('getEngagementInsights').then(r => r.data).catch(() => null)
        ]);

        // Analyze interaction patterns with enhanced data
        const patternAnalysis = analyzePatterns(interactions, engagementInsights);

        // Get all available content
        const [books, publications, neologisms, concepts, articles] = await Promise.all([
            base44.asServiceRole.entities.Book.list(),
            base44.asServiceRole.entities.Publication.list(),
            base44.asServiceRole.entities.Vocabulary.list(),
            base44.asServiceRole.entities.ConceptEvolution.list(),
            base44.asServiceRole.entities.Article.filter({ approval_status: 'approved' })
        ]);

        // Build AI prompt for curation
        const curationPrompt = `You are an expert content curator for geopolitical and economic content. Analyze the user's behavior and curate personalized content.

USER PROFILE:
${profile ? `- Stated Interests: ${profile.interests?.join(', ') || 'None'}` : '- No profile data'}
- Total Interactions: ${interactions.length}
- Active Days: ${patternAnalysis.activeDays}
- Avg Session Duration: ${patternAnalysis.avgSessionDuration}min

INTERACTION PATTERNS:
Content Type Preferences:
${Object.entries(patternAnalysis.contentTypeScores).map(([type, score]) => `  - ${type}: ${score}% affinity`).join('\n')}

Time-of-Day Pattern: ${patternAnalysis.timePattern}
Reading Depth: ${patternAnalysis.readingDepth}
Engagement Level: ${patternAnalysis.engagementLevel}
Avg Engagement Score: ${patternAnalysis.avgEngagementScore}%
Scroll Completion Rate: ${patternAnalysis.scrollCompletionRate}%

Recently Viewed Topics: ${patternAnalysis.recentTopics.join(', ')}
Emerging Interests: ${patternAnalysis.emergingInterests.join(', ')}

GRANULAR ENGAGEMENT DATA:
${engagementInsights ? `
- Purchase Clicks: ${engagementInsights.conversion_metrics.purchase_clicks}
- Bookmarks: ${engagementInsights.conversion_metrics.bookmarks}
- Shares: ${engagementInsights.conversion_metrics.shares}
- Avg Reading Time: ${engagementInsights.reading_behavior.avg_reading_time_minutes}min
- Most Visited Sections: ${engagementInsights.section_frequency.slice(0, 3).map(s => s.section).join(', ')}
- Peak Activity: ${engagementInsights.time_based_patterns.peak_day} at ${engagementInsights.time_based_patterns.peak_hour}:00
` : 'No engagement insights available yet'}

AVAILABLE CONTENT POOL:
- Books: ${books.length} (focusing on ${books.slice(0, 3).map(b => b.title).join(', ')})
- Publications: ${publications.length} recent items
- Neologisms: ${neologisms.length} concepts
- Conceptual Frameworks: ${concepts.length} frameworks
- Articles: ${articles.length} approved pieces

CURATION TASK:
Based on behavioral patterns, curate a "Discover" feed with:

1. **Hero Recommendation** (1 item): The single most valuable piece for this user right now
2. **Learning Path** (3-4 items): Progressive sequence aligned with user's trajectory
3. **Serendipity Picks** (2-3 items): Unexpected but highly relevant discoveries
4. **Trending for You** (3-5 items): Popular content matching user preferences
5. **Deep Dive** (1-2 items): Complex content for engaged users

For each recommendation:
- Specify content_type and content_id
- Explain curation_reason (why this now?)
- Assign confidence_score (0-1)
- Suggest consumption_time (minutes)
- Tag with themes

Prioritize:
- Content NOT yet viewed by user
- Progressive complexity based on engagement
- Diversity across content types
- Temporal relevance (current events)
- Connection to user's learning trajectory`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: curationPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    hero_recommendation: {
                        type: "object",
                        properties: {
                            content_type: { type: "string" },
                            content_id: { type: "string" },
                            curation_reason: { type: "string" },
                            confidence_score: { type: "number" },
                            consumption_time: { type: "number" },
                            themes: { type: "array", items: { type: "string" } }
                        }
                    },
                    learning_path: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                content_type: { type: "string" },
                                content_id: { type: "string" },
                                curation_reason: { type: "string" },
                                confidence_score: { type: "number" },
                                consumption_time: { type: "number" },
                                sequence_order: { type: "number" }
                            }
                        }
                    },
                    serendipity_picks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                content_type: { type: "string" },
                                content_id: { type: "string" },
                                curation_reason: { type: "string" },
                                surprise_factor: { type: "string" }
                            }
                        }
                    },
                    trending_for_you: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                content_type: { type: "string" },
                                content_id: { type: "string" },
                                popularity_score: { type: "number" }
                            }
                        }
                    },
                    deep_dive: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                content_type: { type: "string" },
                                content_id: { type: "string" },
                                complexity_level: { type: "string" }
                            }
                        }
                    },
                    curator_note: { type: "string" }
                }
            }
        });

        // Enrich with actual content
        const enriched = await enrichRecommendations(aiResponse, { books, publications, neologisms, concepts, articles });

        return Response.json({
            curated_content: enriched,
            pattern_insights: patternAnalysis,
            curation_timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error curating content:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function analyzePatterns(interactions, engagementInsights) {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    // Recent interactions only
    const recent = interactions.filter(i => new Date(i.created_date).getTime() > thirtyDaysAgo);
    
    // Calculate content type affinity
    const typeCounts = {};
    recent.forEach(i => {
        typeCounts[i.content_type] = (typeCounts[i.content_type] || 0) + 1;
    });
    
    const total = recent.length || 1;
    const contentTypeScores = {};
    Object.entries(typeCounts).forEach(([type, count]) => {
        contentTypeScores[type] = Math.round((count / total) * 100);
    });
    
    // Time pattern
    const hours = recent.map(i => new Date(i.created_date).getHours());
    const avgHour = hours.reduce((a, b) => a + b, 0) / (hours.length || 1);
    const timePattern = avgHour < 12 ? 'morning' : avgHour < 18 ? 'afternoon' : 'evening';
    
    // Engagement metrics from detailed tracking
    const durations = recent.map(i => i.duration_seconds || 0);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / (durations.length || 1);
    
    const engagementScores = recent.map(i => i.engagement_score || 0);
    const avgEngagementScore = Math.round(engagementScores.reduce((a, b) => a + b, 0) / (engagementScores.length || 1));
    
    const scrollDepths = recent.filter(i => i.scroll_depth).map(i => i.scroll_depth);
    const avgScrollDepth = scrollDepths.length > 0 
        ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
        : 0;
    const scrollCompletionRate = Math.round((scrollDepths.filter(d => d > 80).length / (scrollDepths.length || 1)) * 100);
    
    // Active days
    const uniqueDays = new Set(recent.map(i => new Date(i.created_date).toDateString())).size;
    
    // Recent topics from metadata
    const recentTopics = [...new Set(recent.slice(0, 20).map(i => 
        i.content_metadata?.topic || i.content_metadata?.category || i.content_title?.split(' ').slice(0, 2).join(' ')
    ))].filter(Boolean).slice(0, 5);
    
    // Emerging interests based on click events
    const weekOld = now - 7 * 24 * 60 * 60 * 1000;
    const lastWeek = recent.filter(i => new Date(i.created_date).getTime() > weekOld);
    const clickEvents = lastWeek.filter(i => i.interaction_type === 'click' || i.interaction_type === 'purchase');
    const emergingInterests = [...new Set(clickEvents.map(i => i.content_type))].slice(0, 3);
    
    return {
        contentTypeScores,
        timePattern,
        avgSessionDuration: Math.round(avgDuration / 60),
        avgEngagementScore,
        scrollCompletionRate,
        activeDays: uniqueDays,
        recentTopics,
        emergingInterests,
        readingDepth: avgDuration > 300 ? 'deep' : avgDuration > 120 ? 'moderate' : 'light',
        engagementLevel: avgEngagementScore > 70 ? 'high' : avgEngagementScore > 40 ? 'medium' : 'low'
    };
}

async function enrichRecommendations(aiResponse, contentPool) {
    const contentMap = {
        book: contentPool.books,
        publication: contentPool.publications,
        neologism: contentPool.neologisms,
        concept: contentPool.concepts,
        article: contentPool.articles
    };
    
    const enrich = (item) => {
        if (!item) return null;
        const pool = contentMap[item.content_type] || [];
        const content = pool.find(c => c.id === item.content_id);
        return content ? { ...item, content } : null;
    };
    
    return {
        hero: enrich(aiResponse.hero_recommendation),
        learning_path: (aiResponse.learning_path || []).map(enrich).filter(Boolean),
        serendipity: (aiResponse.serendipity_picks || []).map(enrich).filter(Boolean),
        trending: (aiResponse.trending_for_you || []).map(enrich).filter(Boolean),
        deep_dive: (aiResponse.deep_dive || []).map(enrich).filter(Boolean),
        curator_note: aiResponse.curator_note
    };
}