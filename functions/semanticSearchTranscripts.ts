import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { 
            query, 
            max_results = 5, 
            min_similarity = 0.3,
            external_documents = [],
            include_external = true
        } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query required' }, { status: 400 });
        }

        // Get all indexed transcripts
        const transcripts = await base44.asServiceRole.entities.InterviewTranscript.filter({
            rag_indexed: true
        });

        if (transcripts.length === 0) {
            return Response.json({
                results: [],
                message: 'No indexed transcripts available'
            });
        }

        // Generate query embedding
        const queryEmbedding = await base44.integrations.Core.InvokeLLM({
            prompt: `Analise esta query e extraia:
1. Conceitos-chave procurados
2. Tópicos relacionados
3. Possíveis neologismos Troyjo relevantes
4. Contexto temporal/histórico se houver

Query: "${query}"`,
            response_json_schema: {
                type: "object",
                properties: {
                    key_concepts: {
                        type: "array",
                        items: { type: "string" }
                    },
                    topics: {
                        type: "array",
                        items: { type: "string" }
                    },
                    troyjo_terms: {
                        type: "array",
                        items: { type: "string" }
                    },
                    temporal_context: { type: "string" }
                }
            }
        });

        // Collect all chunks with embeddings
        const allChunks = [];
        transcripts.forEach(transcript => {
            (transcript.chunks || []).forEach(chunk => {
                if (chunk.embedding_metadata) {
                    allChunks.push({
                        ...chunk,
                        transcript_id: transcript.id,
                        transcript_title: transcript.title,
                        interview_date: transcript.interview_date,
                        venue: transcript.venue,
                        source_type: 'transcript'
                    });
                }
            });
        });

        // Add external document chunks if provided
        if (include_external && external_documents.length > 0) {
            for (const doc of external_documents) {
                if (doc.chunks) {
                    doc.chunks.forEach(chunk => {
                        allChunks.push({
                            text: chunk.text,
                            embedding_metadata: chunk.embedding,
                            source_type: 'external',
                            source_title: doc.title || 'External Document',
                            source_url: doc.url
                        });
                    });
                }
            }
        }

        // Calculate semantic similarity
        const rankedChunks = allChunks.map(chunk => {
            const similarity = calculateSemanticSimilarity(
                queryEmbedding,
                chunk.embedding_metadata
            );
            
            // Find exact matching phrases
            const matchingPhrases = findMatchingPhrases(query, chunk.text);
            
            return {
                ...chunk,
                similarity_score: similarity,
                matching_phrases
            };
        })
        .filter(chunk => chunk.similarity_score >= min_similarity)
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, max_results);

        // Cross-reference between sources
        const crossReferences = await identifyCrossReferences(rankedChunks, queryEmbedding, base44);

        return Response.json({
            results: rankedChunks,
            query_analysis: queryEmbedding,
            total_chunks_analyzed: allChunks.length,
            cross_references: crossReferences,
            sources_used: {
                transcripts: rankedChunks.filter(c => c.source_type === 'transcript').length,
                external: rankedChunks.filter(c => c.source_type === 'external').length
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in semantic search:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateSemanticSimilarity(queryEmbed, chunkEmbed) {
    let score = 0;
    const weights = {
        concepts: 0.4,
        topics: 0.3,
        troyjo_terms: 0.3
    };

    // Concept overlap
    const conceptOverlap = calculateOverlap(
        queryEmbed.key_concepts || [],
        chunkEmbed.key_concepts || []
    );
    score += conceptOverlap * weights.concepts;

    // Topic overlap
    const topicOverlap = calculateOverlap(
        queryEmbed.topics || [],
        chunkEmbed.topics || []
    );
    score += topicOverlap * weights.topics;

    // Troyjo terms overlap (bonus)
    const termOverlap = calculateOverlap(
        queryEmbed.troyjo_terms || [],
        chunkEmbed.troyjo_terms || []
    );
    score += termOverlap * weights.troyjo_terms;

    // Temporal context bonus
    if (queryEmbed.temporal_context && chunkEmbed.temporal_context) {
        if (queryEmbed.temporal_context.toLowerCase().includes(
            chunkEmbed.temporal_context.toLowerCase()
        )) {
            score += 0.1;
        }
    }

    return Math.min(score, 1.0);
}

function calculateOverlap(arr1, arr2) {
    if (arr1.length === 0 || arr2.length === 0) return 0;
    
    const set1 = new Set(arr1.map(s => s.toLowerCase()));
    const set2 = new Set(arr2.map(s => s.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
}

function findMatchingPhrases(query, text) {
    const phrases = [];
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    sentences.forEach(sentence => {
        const sentenceLower = sentence.toLowerCase();
        const matchingWords = queryWords.filter(word => 
            sentenceLower.includes(word)
        );
        
        if (matchingWords.length >= 2) {
            const words = sentence.split(/\s+/);
            const matchIndices = [];
            words.forEach((word, idx) => {
                if (matchingWords.some(mw => word.toLowerCase().includes(mw))) {
                    matchIndices.push(idx);
                }
            });
            
            if (matchIndices.length > 0) {
                const start = Math.max(0, Math.min(...matchIndices) - 2);
                const end = Math.min(words.length, Math.max(...matchIndices) + 3);
                phrases.push(words.slice(start, end).join(' '));
            }
        }
    });
    
    return phrases.slice(0, 3);
}

async function identifyCrossReferences(chunks, queryEmbed, base44) {
    if (chunks.length < 2) return [];

    const transcriptChunks = chunks.filter(c => c.source_type === 'transcript');
    const externalChunks = chunks.filter(c => c.source_type === 'external');

    if (transcriptChunks.length === 0 || externalChunks.length === 0) {
        return [];
    }

    try {
        const prompt = `Analise correlações entre fontes:

TRECHOS DE ENTREVISTAS TROYJO:
${transcriptChunks.slice(0, 3).map(c => `"${c.text.substring(0, 200)}..."`).join('\n\n')}

DOCUMENTOS EXTERNOS:
${externalChunks.slice(0, 3).map(c => `"${c.text.substring(0, 200)}..."`).join('\n\n')}

Identifique:
1. Pontos corroborantes (onde Troyjo e documentos concordam)
2. Pontos conflitantes (divergências)
3. Insights complementares (onde se complementam)`;

        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    corroborating_points: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                topic: { type: "string" },
                                agreement: { type: "string" }
                            }
                        }
                    },
                    conflicting_points: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                topic: { type: "string" },
                                troyjo_position: { type: "string" },
                                external_position: { type: "string" }
                            }
                        }
                    },
                    complementary_insights: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return analysis;
    } catch (error) {
        console.error('Error in cross-reference:', error);
        return [];
    }
}