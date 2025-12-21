import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
});

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

        const { query, category, limit = 10, min_similarity = 0.7 } = await req.json();

        if (!query) {
            return Response.json({ 
                error: 'query is required' 
            }, { status: 400 });
        }

        // Generate embedding for the query
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
            encoding_format: 'float'
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // Get all published entries with embeddings
        let entries = await base44.entities.KnowledgeEntry.filter({
            status: 'publicado'
        });

        // Filter by category if specified
        if (category && category !== 'all') {
            entries = entries.filter(e => e.category === category);
        }

        // Filter entries that have embeddings
        entries = entries.filter(e => e.embedding && e.embedding.length > 0);

        // Calculate similarity for each entry
        const results = entries.map(entry => {
            const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
            return {
                ...entry,
                similarity_score: similarity
            };
        });

        // Filter by minimum similarity
        const filteredResults = results.filter(r => r.similarity_score >= min_similarity);

        // Sort by similarity (descending) and priority
        filteredResults.sort((a, b) => {
            // Primary sort by similarity
            if (Math.abs(b.similarity_score - a.similarity_score) > 0.05) {
                return b.similarity_score - a.similarity_score;
            }
            // Secondary sort by priority for similar scores
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (b.search_priority || 1) - (a.search_priority || 1);
        });

        // Limit results
        const limitedResults = filteredResults.slice(0, limit);

        return Response.json({
            success: true,
            results: limitedResults,
            total: limitedResults.length,
            search_type: 'semantic',
            min_similarity: min_similarity
        });

    } catch (error) {
        console.error('Error in semantic search:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});