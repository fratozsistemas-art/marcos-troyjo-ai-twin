import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { document_url, document_text, file_url } = await req.json();

        let content = document_text;

        // Fetch URL if provided
        if (document_url && !content) {
            try {
                const response = await fetch(document_url);
                content = await response.text();
            } catch (error) {
                return Response.json({ 
                    error: 'Failed to fetch URL',
                    details: error.message 
                }, { status: 400 });
            }
        }

        // Fetch file if provided
        if (file_url && !content) {
            try {
                const response = await fetch(file_url);
                content = await response.text();
            } catch (error) {
                return Response.json({ 
                    error: 'Failed to fetch file',
                    details: error.message 
                }, { status: 400 });
            }
        }

        if (!content) {
            return Response.json({ 
                error: 'No content provided' 
            }, { status: 400 });
        }

        // Extract keywords, topics, and structure
        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: `Analise o seguinte documento e extraia informações estruturadas:

DOCUMENTO:
${content.substring(0, 8000)}

TAREFA:
1. Extraia palavras-chave principais (10-15)
2. Identifique tópicos geopolíticos/econômicos
3. Neologismos ou termos técnicos únicos
4. Resumo executivo (2-3 linhas)
5. Conceitos-chave mencionados
6. Contexto temporal/geográfico
7. Dados quantitativos relevantes
8. Fontes citadas se houver`,
            response_json_schema: {
                type: "object",
                properties: {
                    keywords: {
                        type: "array",
                        items: { type: "string" }
                    },
                    topics: {
                        type: "array",
                        items: { type: "string" }
                    },
                    technical_terms: {
                        type: "array",
                        items: { type: "string" }
                    },
                    executive_summary: { type: "string" },
                    key_concepts: {
                        type: "array",
                        items: { type: "string" }
                    },
                    temporal_context: { type: "string" },
                    geographic_context: { type: "string" },
                    quantitative_data: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                metric: { type: "string" },
                                value: { type: "string" },
                                context: { type: "string" }
                            }
                        }
                    },
                    sources_cited: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        // Create semantic chunks
        const chunks = createSemanticChunks(content);

        // Generate embeddings for chunks
        const chunkEmbeddings = await Promise.all(
            chunks.map(async (chunk) => {
                const embedding = await base44.integrations.Core.InvokeLLM({
                    prompt: `Extraia conceitos-chave deste trecho:

"${chunk.substring(0, 500)}"`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            concepts: {
                                type: "array",
                                items: { type: "string" }
                            },
                            main_topic: { type: "string" }
                        }
                    }
                });

                return {
                    text: chunk,
                    embedding: embedding,
                    length: chunk.length
                };
            })
        );

        return Response.json({
            success: true,
            analysis,
            chunks: chunkEmbeddings,
            document_length: content.length,
            chunk_count: chunks.length
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function createSemanticChunks(text, maxChunkSize = 2000) {
    const paragraphs = text.split(/\n\n+/);
    const chunks = [];
    let currentChunk = '';

    for (const para of paragraphs) {
        if ((currentChunk + para).length > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = para;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + para;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}