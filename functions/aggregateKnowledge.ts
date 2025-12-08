import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { filters = {} } = await req.json().catch(() => ({}));

        // Aggregate all knowledge sources in parallel
        const [insights, documents, aiHistory, knownPositions, concepts, vocabulary] = await Promise.all([
            base44.asServiceRole.entities.Insight.filter({}),
            base44.asServiceRole.entities.Document.filter({}),
            base44.asServiceRole.entities.AIHistory.filter({}),
            base44.asServiceRole.entities.KnownPosition.filter({}),
            base44.asServiceRole.entities.ConceptEvolution.filter({}),
            base44.asServiceRole.entities.Vocabulary.filter({})
        ]);

        // Categorize and enrich with AI
        const allItems = [
            ...insights.map(i => ({
                id: i.id,
                type: 'insight',
                title: i.title || 'Insight',
                content: i.content,
                topics: i.topics || [],
                confidence: i.confidence_score || 50,
                created_date: i.created_date,
                source: 'Generated Insight',
                metadata: i
            })),
            ...documents.map(d => ({
                id: d.id,
                type: 'document',
                title: d.title,
                content: d.description || '',
                topics: d.tags || [],
                confidence: 80,
                created_date: d.created_date,
                source: d.category || 'Document',
                metadata: d
            })),
            ...aiHistory.map(h => ({
                id: h.id,
                type: 'ai_history',
                title: h.title,
                content: JSON.stringify(h.outputs),
                topics: [],
                confidence: 70,
                created_date: h.created_date,
                source: h.function_type,
                metadata: h
            })),
            ...knownPositions.map(p => ({
                id: p.id,
                type: 'position',
                title: p.topic,
                content: p.position,
                topics: p.keywords || [],
                confidence: p.confidence || 80,
                created_date: p.date || p.created_date,
                source: p.source,
                metadata: p
            })),
            ...concepts.map(c => ({
                id: c.id,
                type: 'concept',
                title: c.concept_name,
                content: c.content,
                topics: c.thematic_tags || [],
                confidence: c.hua_score ? 
                    Math.round((c.hua_score.hierarchy + c.hua_score.utility + c.hua_score.adherence) / 3) : 70,
                created_date: c.created_date,
                source: c.type || 'Concept',
                metadata: c
            })),
            ...vocabulary.map(v => ({
                id: v.id,
                type: 'vocabulary',
                title: v.term,
                content: v.definition,
                topics: v.related_terms || [],
                confidence: 90,
                created_date: v.first_used_date || v.created_date,
                source: v.category,
                metadata: v
            }))
        ];

        // Apply filters
        let filtered = allItems;

        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(search) ||
                item.content.toLowerCase().includes(search) ||
                item.topics.some(t => t.toLowerCase().includes(search))
            );
        }

        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(item => item.type === filters.type);
        }

        if (filters.minConfidence) {
            filtered = filtered.filter(item => item.confidence >= filters.minConfidence);
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(item => 
                new Date(item.created_date) >= new Date(filters.dateFrom)
            );
        }

        if (filters.dateTo) {
            filtered = filtered.filter(item => 
                new Date(item.created_date) <= new Date(filters.dateTo)
            );
        }

        if (filters.topics && filters.topics.length > 0) {
            filtered = filtered.filter(item =>
                filters.topics.some(topic => 
                    item.topics.some(t => t.toLowerCase().includes(topic.toLowerCase()))
                )
            );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

        // Generate statistics
        const stats = {
            total: allItems.length,
            filtered: filtered.length,
            byType: {
                insight: allItems.filter(i => i.type === 'insight').length,
                document: allItems.filter(i => i.type === 'document').length,
                position: allItems.filter(i => i.type === 'position').length,
                concept: allItems.filter(i => i.type === 'concept').length,
                vocabulary: allItems.filter(i => i.type === 'vocabulary').length,
                ai_history: allItems.filter(i => i.type === 'ai_history').length
            },
            avgConfidence: Math.round(
                allItems.reduce((sum, i) => sum + i.confidence, 0) / allItems.length
            ),
            topTopics: extractTopTopics(allItems, 10)
        };

        return Response.json({
            items: filtered,
            stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error aggregating knowledge:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});

function extractTopTopics(items, limit = 10) {
    const topicCount = {};
    
    items.forEach(item => {
        item.topics.forEach(topic => {
            topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
    });

    return Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([topic, count]) => ({ topic, count }));
}