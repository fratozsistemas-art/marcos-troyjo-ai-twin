import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transcript_id, transcript_text, auto_extract = true } = await req.json();

        // Get transcript or create chunks from text
        let transcript;
        if (transcript_id) {
            const transcripts = await base44.asServiceRole.entities.InterviewTranscript.filter({ id: transcript_id });
            transcript = transcripts[0];
            if (!transcript) {
                return Response.json({ error: 'Transcript not found' }, { status: 404 });
            }
        }

        const textToProcess = transcript?.full_transcript || transcript_text;
        if (!textToProcess) {
            return Response.json({ error: 'No transcript text provided' }, { status: 400 });
        }

        // Chunk the transcript semantically (by paragraphs/topics)
        const chunks = smartChunk(textToProcess);

        // Extract metadata if auto_extract is enabled
        let extractedData = {};
        if (auto_extract) {
            extractedData = await extractMetadata(textToProcess, base44);
        }

        // Update transcript with chunks and metadata
        if (transcript_id) {
            await base44.asServiceRole.entities.InterviewTranscript.update(transcript_id, {
                chunks: chunks.map((chunk, idx) => ({
                    chunk_id: `chunk_${idx}`,
                    text: chunk.text,
                    topic: chunk.topic || 'General',
                    context_before: chunk.context_before || '',
                    context_after: chunk.context_after || ''
                })),
                keywords: extractedData.keywords || transcript.keywords,
                neologisms_used: extractedData.neologisms || transcript.neologisms_used,
                main_topics: extractedData.topics || transcript.main_topics,
                highlights: extractedData.highlights || transcript.highlights,
                positions_expressed: extractedData.positions || transcript.positions_expressed,
                rag_indexed: true,
                metadata: {
                    ...transcript.metadata,
                    word_count: textToProcess.split(/\s+/).length,
                    technical_density: calculateTechnicalDensity(textToProcess),
                    ...extractedData.metadata
                }
            });
        }

        return Response.json({
            success: true,
            chunks_created: chunks.length,
            extracted_data: extractedData,
            message: 'Transcript processed and indexed successfully'
        });

    } catch (error) {
        console.error('Error processing transcript:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function smartChunk(text) {
    const chunks = [];
    const paragraphs = text.split(/\n\n+/);
    
    let currentChunk = '';
    let chunkSize = 0;
    const maxChunkSize = 1000; // words
    const minChunkSize = 200;

    for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i].trim();
        if (!para) continue;

        const paraWords = para.split(/\s+/).length;
        
        if (chunkSize + paraWords > maxChunkSize && chunkSize >= minChunkSize) {
            chunks.push({
                text: currentChunk.trim(),
                context_before: i > 0 ? paragraphs[i - 1]?.substring(0, 200) : '',
                context_after: paragraphs[i]?.substring(0, 200) || '',
                topic: extractTopic(currentChunk)
            });
            currentChunk = para;
            chunkSize = paraWords;
        } else {
            currentChunk += '\n\n' + para;
            chunkSize += paraWords;
        }
    }

    if (currentChunk.trim()) {
        chunks.push({
            text: currentChunk.trim(),
            context_before: paragraphs[paragraphs.length - 2]?.substring(0, 200) || '',
            context_after: '',
            topic: extractTopic(currentChunk)
        });
    }

    return chunks;
}

function extractTopic(text) {
    const topicKeywords = {
        'BRICS': ['brics', 'banco de desenvolvimento', 'emergentes', 'ndb'],
        'Comércio': ['comércio', 'exportação', 'importação', 'tarifas', 'acordo comercial'],
        'Geopolítica': ['geopolítica', 'diplomacia', 'relações internacionais', 'multipolaridade'],
        'Brasil': ['brasil', 'brasileiro', 'economia brasileira'],
        'China': ['china', 'chinês', 'beijing'],
        'EUA': ['estados unidos', 'eua', 'washington', 'trump'],
        'Competitividade': ['competitividade', 'produtividade', 'inovação']
    };

    const lowerText = text.toLowerCase();
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            return topic;
        }
    }
    return 'Geral';
}

async function extractMetadata(text, base44) {
    try {
        const prompt = `Analise esta transcrição de entrevista de Marcos Troyjo e extraia:
1. Palavras-chave principais (10-15)
2. Neologismos Troyjo mencionados (trumpulência, Novo ESG, desglobalização, etc)
3. Tópicos principais (5-7)
4. Highlights mais importantes com timestamps aproximados
5. Posições expressas sobre temas específicos

Transcrição:
${text.substring(0, 8000)}

Retorne em formato estruturado.`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    keywords: { type: "array", items: { type: "string" } },
                    neologisms: { type: "array", items: { type: "string" } },
                    topics: { type: "array", items: { type: "string" } },
                    highlights: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                quote: { type: "string" },
                                topic: { type: "string" },
                                importance: { type: "string" },
                                quote_type: { type: "string" }
                            }
                        }
                    },
                    positions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                topic: { type: "string" },
                                position: { type: "string" },
                                confidence_level: { type: "string" },
                                quote: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        return result;
    } catch (error) {
        console.error('Error extracting metadata:', error);
        return {};
    }
}

function calculateTechnicalDensity(text) {
    const technicalTerms = [
        'geoeconômico', 'multilateral', 'competitividade', 'produtividade',
        'diplomacia', 'tarifário', 'política comercial', 'inserção internacional',
        'vantagem comparativa', 'fluxo de capital', 'investimento direto'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const technicalCount = words.filter(word => 
        technicalTerms.some(term => word.includes(term))
    ).length;
    
    return Math.min((technicalCount / words.length) * 100, 100);
}