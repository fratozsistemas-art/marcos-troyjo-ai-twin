import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { query, max_results = 5, min_relevance = 0.6, filter = {} } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query required' }, { status: 400 });
        }

        // Get all indexed transcripts
        const transcripts = await base44.asServiceRole.entities.InterviewTranscript.filter({
            rag_indexed: true,
            ...filter
        });

        if (!transcripts || transcripts.length === 0) {
            return Response.json({
                results: [],
                message: 'No indexed transcripts found'
            });
        }

        // Collect all chunks with metadata
        const allChunks = [];
        for (const transcript of transcripts) {
            if (!transcript.chunks || transcript.chunks.length === 0) continue;
            
            for (const chunk of transcript.chunks) {
                allChunks.push({
                    ...chunk,
                    transcript_id: transcript.id,
                    transcript_title: transcript.title,
                    interview_date: transcript.interview_date,
                    interviewer: transcript.interviewer,
                    venue: transcript.venue,
                    video_url: transcript.video_url,
                    main_topics: transcript.main_topics || []
                });
            }
        }

        // Use LLM to find most relevant chunks
        const relevantChunks = await semanticSearch(query, allChunks, max_results, base44);

        // Filter by relevance threshold
        const filteredResults = relevantChunks.filter(r => r.relevance_score >= min_relevance);

        // Enhance results with context
        const enhancedResults = filteredResults.map(result => {
            const transcript = transcripts.find(t => t.id === result.transcript_id);
            return {
                ...result,
                context: {
                    before: result.context_before,
                    after: result.context_after,
                    full_context: buildFullContext(result, transcript)
                },
                metadata: {
                    neologisms_in_chunk: findNeologisms(result.text),
                    technical_density: calculateTechnicalDensity(result.text),
                    key_concepts: extractKeyConcepts(result.text)
                }
            };
        });

        return Response.json({
            results: enhancedResults,
            total_found: enhancedResults.length,
            query: query,
            transcripts_searched: transcripts.length
        });

    } catch (error) {
        console.error('Error retrieving transcript context:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function semanticSearch(query, chunks, maxResults, base44) {
    try {
        // Use LLM to rank chunks by relevance
        const chunksPreview = chunks.slice(0, 50).map((c, i) => ({
            index: i,
            text: c.text.substring(0, 500),
            topic: c.topic
        }));

        const prompt = `Query: "${query}"

Analise os seguintes trechos de entrevistas de Marcos Troyjo e classifique por relevância para a query.
Considere:
- Relevância semântica direta
- Conceitos e frameworks Troyjo relacionados
- Contexto geopolítico/econômico
- Neologismos e termos técnicos

Trechos:
${JSON.stringify(chunksPreview, null, 2)}

Retorne os ${maxResults} trechos mais relevantes com score 0-1.`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    ranked_chunks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                index: { type: "number" },
                                relevance_score: { type: "number" },
                                reason: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        // Map back to full chunks
        return result.ranked_chunks.map(ranked => ({
            ...chunks[ranked.index],
            relevance_score: ranked.relevance_score,
            relevance_reason: ranked.reason
        }));

    } catch (error) {
        console.error('Error in semantic search:', error);
        // Fallback to keyword matching
        return keywordFallback(query, chunks, maxResults);
    }
}

function keywordFallback(query, chunks, maxResults) {
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const scored = chunks.map(chunk => {
        const text = chunk.text.toLowerCase();
        const matches = queryWords.filter(word => text.includes(word)).length;
        return {
            ...chunk,
            relevance_score: matches / queryWords.length,
            relevance_reason: 'Keyword matching'
        };
    });

    return scored
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, maxResults);
}

function buildFullContext(chunk, transcript) {
    if (!transcript) return chunk.text;
    
    return {
        interview_context: {
            title: transcript.title,
            date: transcript.interview_date,
            venue: transcript.venue,
            main_topics: transcript.main_topics
        },
        chunk_context: {
            topic: chunk.topic,
            before: chunk.context_before,
            main: chunk.text,
            after: chunk.context_after
        }
    };
}

function findNeologisms(text) {
    const neologisms = [
        'trumpulência', 'Novo ESG', 'desglobalização', 'poli-oportunidades',
        'revolução calórica asiática', 'BRICS 2.0', 'desdolarização pragmática',
        'geopolítica como nova globalização', 'policrise', 'geoeconomia sistêmica',
        'Brasil cosmopolita realista'
    ];
    
    const lowerText = text.toLowerCase();
    return neologisms.filter(neo => lowerText.includes(neo.toLowerCase()));
}

function extractKeyConcepts(text) {
    const concepts = [
        'competitividade', 'diplomacia', 'comércio internacional', 'BRICS',
        'geopolítica', 'economia global', 'China', 'Estados Unidos', 'Brasil',
        'inserção internacional', 'acordos comerciais', 'sustentabilidade'
    ];
    
    const lowerText = text.toLowerCase();
    return concepts.filter(concept => lowerText.includes(concept.toLowerCase()));
}

function calculateTechnicalDensity(text) {
    const technicalTerms = [
        'geoeconômico', 'multilateral', 'competitividade', 'produtividade',
        'diplomacia', 'tarifário', 'política comercial', 'inserção internacional'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const technicalCount = words.filter(word => 
        technicalTerms.some(term => word.includes(term))
    ).length;
    
    return Math.min((technicalCount / words.length) * 100, 100);
}