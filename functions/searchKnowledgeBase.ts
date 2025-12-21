import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, category, limit = 10, min_priority = 1 } = await req.json();

        // Get all published entries
        let entries = await base44.entities.KnowledgeEntry.filter({
            status: 'publicado'
        });

        // Filter by category if specified
        if (category && category !== 'all') {
            entries = entries.filter(e => e.category === category);
        }

        // Filter by minimum priority
        entries = entries.filter(e => (e.search_priority || 1) >= min_priority);

        // Simple text-based search if query provided
        if (query) {
            const queryLower = query.toLowerCase();
            entries = entries.filter(e => {
                const titleMatch = e.title.toLowerCase().includes(queryLower);
                const summaryMatch = e.summary?.toLowerCase().includes(queryLower);
                const bodyMatch = e.body.toLowerCase().includes(queryLower);
                const tagsMatch = e.tags?.some(tag => tag.toLowerCase().includes(queryLower));
                const keywordsMatch = e.keywords?.some(kw => kw.toLowerCase().includes(queryLower));
                
                return titleMatch || summaryMatch || bodyMatch || tagsMatch || keywordsMatch;
            });

            // Score results based on relevance
            entries = entries.map(entry => {
                let score = 0;
                const queryLower = query.toLowerCase();
                
                if (entry.title.toLowerCase().includes(queryLower)) score += 10;
                if (entry.summary?.toLowerCase().includes(queryLower)) score += 5;
                if (entry.tags?.some(tag => tag.toLowerCase().includes(queryLower))) score += 7;
                if (entry.keywords?.some(kw => kw.toLowerCase().includes(queryLower))) score += 8;
                score += (entry.search_priority || 1);
                if (entry.featured) score += 5;
                
                return { ...entry, relevance_score: score };
            });

            // Sort by relevance
            entries.sort((a, b) => b.relevance_score - a.relevance_score);
        } else {
            // No query - sort by priority and featured
            entries.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return (b.search_priority || 1) - (a.search_priority || 1);
            });
        }

        // Limit results
        entries = entries.slice(0, limit);

        return Response.json({
            results: entries,
            total: entries.length
        });

    } catch (error) {
        console.error('Error searching knowledge base:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});