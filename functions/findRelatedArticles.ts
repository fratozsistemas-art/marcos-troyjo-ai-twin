import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { entry_id, limit = 5, min_similarity = 0.75, auto_update = false } = await req.json();

        if (!entry_id) {
            return Response.json({ 
                error: 'entry_id is required' 
            }, { status: 400 });
        }

        // Get the target entry
        const targetEntries = await base44.entities.KnowledgeEntry.filter({ id: entry_id });
        
        if (targetEntries.length === 0) {
            return Response.json({ 
                error: 'Entry not found' 
            }, { status: 404 });
        }

        const targetEntry = targetEntries[0];

        // Check if target has embedding
        if (!targetEntry.embedding || targetEntry.embedding.length === 0) {
            return Response.json({
                success: false,
                message: 'Target entry has no embedding. Generate embedding first.',
                related: []
            });
        }

        // Get all other published entries with embeddings
        let allEntries = await base44.entities.KnowledgeEntry.filter({
            status: 'publicado'
        });

        // Exclude the target entry itself
        allEntries = allEntries.filter(e => 
            e.id !== entry_id && 
            e.embedding && 
            e.embedding.length > 0
        );

        // Calculate similarity for each entry
        const similarities = allEntries.map(entry => {
            const similarity = cosineSimilarity(targetEntry.embedding, entry.embedding);
            return {
                id: entry.id,
                title: entry.title,
                category: entry.category,
                summary: entry.summary,
                similarity_score: similarity,
                featured: entry.featured
            };
        });

        // Filter by minimum similarity
        const related = similarities
            .filter(s => s.similarity_score >= min_similarity)
            .sort((a, b) => {
                // Sort by similarity primarily
                if (Math.abs(b.similarity_score - a.similarity_score) > 0.05) {
                    return b.similarity_score - a.similarity_score;
                }
                // Then by featured status
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return 0;
            })
            .slice(0, limit);

        // Auto-update the entry's related_entries if requested
        if (auto_update && related.length > 0) {
            const relatedIds = related.map(r => r.id);
            await base44.entities.KnowledgeEntry.update(entry_id, {
                related_entries: relatedIds
            });
        }

        return Response.json({
            success: true,
            related: related,
            total: related.length,
            auto_updated: auto_update
        });

    } catch (error) {
        console.error('Error finding related articles:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});