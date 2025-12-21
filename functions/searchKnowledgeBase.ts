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

        const { 
            query, 
            category, 
            limit = 10, 
            min_priority = 1,
            use_semantic = true,
            min_similarity = 0.65
        } = await req.json();

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

        // If no query, return by priority
        if (!query) {
            entries.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return (b.search_priority || 1) - (a.search_priority || 1);
            });
            return Response.json({
                results: entries.slice(0, limit),
                total: entries.length,
                search_type: 'priority'
            });
        }

        // Try semantic search first if enabled
        if (use_semantic) {
            try {
                // Generate embedding for the query
                const embeddingResponse = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: query,
                    encoding_format: 'float'
                });

                const queryEmbedding = embeddingResponse.data[0].embedding;

                // Filter entries that have embeddings
                const entriesWithEmbeddings = entries.filter(e => 
                    e.embedding && e.embedding.length > 0
                );

                if (entriesWithEmbeddings.length > 0) {
                    // Calculate similarity for each entry
                    const results = entriesWithEmbeddings.map(entry => {
                        const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
                        return {
                            ...entry,
                            relevance_score: similarity * 100,
                            similarity_score: similarity
                        };
                    });

                    // Filter by minimum similarity
                    const semanticResults = results.filter(r => r.similarity_score >= min_similarity);

                    if (semanticResults.length > 0) {
                        // Sort by similarity and priority
                        semanticResults.sort((a, b) => {
                            if (Math.abs(b.similarity_score - a.similarity_score) > 0.05) {
                                return b.similarity_score - a.similarity_score;
                            }
                            if (a.featured && !b.featured) return -1;
                            if (!a.featured && b.featured) return 1;
                            return (b.search_priority || 1) - (a.search_priority || 1);
                        });

                        return Response.json({
                            results: semanticResults.slice(0, limit),
                            total: semanticResults.length,
                            search_type: 'semantic'
                        });
                    }
                }
            } catch (semanticError) {
                console.error('Semantic search failed, falling back to keyword:', semanticError);
            }
        }

        // Fallback to keyword search
        const queryLower = query.toLowerCase();
        const keywordResults = entries.filter(e => {
            const titleMatch = e.title.toLowerCase().includes(queryLower);
            const summaryMatch = e.summary?.toLowerCase().includes(queryLower);
            const bodyMatch = e.body.toLowerCase().includes(queryLower);
            const tagsMatch = e.tags?.some(tag => tag.toLowerCase().includes(queryLower));
            const keywordsMatch = e.keywords?.some(kw => kw.toLowerCase().includes(queryLower));
            
            return titleMatch || summaryMatch || bodyMatch || tagsMatch || keywordsMatch;
        });

        // Score keyword results
        const scoredResults = keywordResults.map(entry => {
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
        scoredResults.sort((a, b) => b.relevance_score - a.relevance_score);

        return Response.json({
            results: scoredResults.slice(0, limit),
            total: scoredResults.length,
            search_type: 'keyword'
        });

    } catch (error) {
        console.error('Error searching knowledge base:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});