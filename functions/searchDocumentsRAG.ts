import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Cosine similarity helper
function cosineSimilarity(vecA, vecB) {
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

        const { query, top_k = 5, document_ids = null } = await req.json();
        
        if (!query) {
            return Response.json({ error: 'query required' }, { status: 400 });
        }

        // Generate embedding for query
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: query
            })
        });

        if (!embeddingResponse.ok) {
            return Response.json({ error: 'Failed to generate query embedding' }, { status: 500 });
        }

        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

        // Fetch all chunks for user (filter by document_ids if provided)
        let chunks;
        if (document_ids && document_ids.length > 0) {
            // Filter by specific documents
            const allChunks = await base44.asServiceRole.entities.DocumentChunk.filter({
                user_email: user.email
            });
            chunks = allChunks.filter(c => document_ids.includes(c.document_id));
        } else {
            chunks = await base44.asServiceRole.entities.DocumentChunk.filter({
                user_email: user.email
            });
        }

        if (chunks.length === 0) {
            return Response.json({
                results: [],
                message: 'No indexed documents found'
            });
        }

        // Calculate similarities
        const results = chunks.map(chunk => ({
            ...chunk,
            similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        // Sort by similarity and take top_k
        results.sort((a, b) => b.similarity - a.similarity);
        const topResults = results.slice(0, top_k);

        // Format results with citations
        const formattedResults = topResults.map((result, index) => ({
            rank: index + 1,
            document_id: result.document_id,
            document_name: result.document_name,
            content: result.content,
            similarity_score: result.similarity,
            metadata: result.metadata,
            citation: `[${result.document_name}, chunk ${result.chunk_index + 1}]`
        }));

        return Response.json({
            query,
            results: formattedResults,
            total_chunks_searched: chunks.length
        });

    } catch (error) {
        console.error('Error searching documents:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});