import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { category, date_from, date_to, format = 'detailed' } = await req.json();

        // Build filter
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (date_from) {
            filter.start_date = { $gte: date_from };
        }
        if (date_to) {
            filter.start_date = { $lte: date_to };
        }

        // Fetch timeline events
        const events = await base44.asServiceRole.entities.TimelineEvent.filter(
            filter,
            '-start_date',
            1000
        );

        // Fetch linked articles
        const allArticleIds = [...new Set(events.flatMap(e => e.linked_articles || []))];
        const articles = allArticleIds.length > 0 
            ? await base44.asServiceRole.entities.Article.filter({
                id: { $in: allArticleIds }
            })
            : [];

        // Build article lookup
        const articleLookup = {};
        articles.forEach(article => {
            articleLookup[article.id] = {
                id: article.id,
                title: article.title,
                url: `/article/${article.id}`,
                summary: article.summary
            };
        });

        // Format output based on requested format
        let output;

        if (format === 'caio_pipeline') {
            // CAIO/TSI pipeline format - structured for AI processing
            output = {
                metadata: {
                    exported_at: new Date().toISOString(),
                    exported_by: user.email,
                    total_events: events.length,
                    date_range: {
                        from: date_from || events[events.length - 1]?.start_date,
                        to: date_to || events[0]?.start_date
                    },
                    categories: [...new Set(events.map(e => e.category))]
                },
                events: events.map(event => ({
                    // Core identifiers
                    event_id: event.event_id,
                    category: event.category,
                    
                    // Event details
                    name: event.name,
                    summary: event.summary,
                    
                    // Temporal
                    start_date: event.start_date,
                    end_date: event.end_date,
                    status_as_of: event.status_as_of,
                    
                    // Context
                    actors: event.actors || [],
                    jurisdiction: event.jurisdiction,
                    status: event.status,
                    
                    // Sources
                    sources: event.sources || [],
                    
                    // Linked content
                    linked_articles: (event.linked_articles || []).map(id => articleLookup[id]).filter(Boolean),
                    
                    // Metadata
                    created_date: event.created_date,
                    updated_date: event.updated_date
                })),
                
                // Cross-references
                actor_index: buildActorIndex(events),
                jurisdiction_index: buildJurisdictionIndex(events),
                topic_index: buildTopicIndex(events, articles)
            };
        } else if (format === 'compact') {
            // Compact format for quick reference
            output = events.map(event => ({
                id: event.event_id,
                name: event.name,
                date: event.start_date,
                category: event.category,
                status: event.status,
                jurisdiction: event.jurisdiction,
                summary: event.summary
            }));
        } else {
            // Detailed format (default)
            output = {
                timeline: events.map(event => ({
                    ...event,
                    linked_articles_details: (event.linked_articles || [])
                        .map(id => articleLookup[id])
                        .filter(Boolean)
                })),
                metadata: {
                    exported_at: new Date().toISOString(),
                    total_events: events.length,
                    format: 'detailed'
                }
            };
        }

        return Response.json(output, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="timeline-export-${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (error) {
        console.error('Error exporting timeline:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

// Helper functions
function buildActorIndex(events) {
    const index = {};
    events.forEach(event => {
        (event.actors || []).forEach(actor => {
            if (!index[actor]) {
                index[actor] = [];
            }
            index[actor].push({
                event_id: event.event_id,
                event_name: event.name,
                date: event.start_date,
                category: event.category
            });
        });
    });
    return index;
}

function buildJurisdictionIndex(events) {
    const index = {};
    events.forEach(event => {
        const jurisdiction = event.jurisdiction;
        if (!index[jurisdiction]) {
            index[jurisdiction] = [];
        }
        index[jurisdiction].push({
            event_id: event.event_id,
            event_name: event.name,
            date: event.start_date,
            category: event.category
        });
    });
    return index;
}

function buildTopicIndex(events, articles) {
    const topics = new Set();
    
    // Extract topics from events
    events.forEach(event => {
        topics.add(event.category);
    });
    
    // Extract topics from linked articles
    articles.forEach(article => {
        (article.tags || []).forEach(tag => topics.add(tag));
    });
    
    return Array.from(topics).sort();
}