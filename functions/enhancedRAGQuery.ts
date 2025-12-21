import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, sources = ['transcripts', 'corporate_facts', 'world_bank', 'news'] } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query is required' }, { status: 400 });
        }

        const results = {
            query,
            sources_queried: sources,
            data: {}
        };

        // 1. Query Transcripts (existing RAG)
        if (sources.includes('transcripts')) {
            try {
                const transcripts = await base44.entities.InterviewTranscript.filter({});
                const relevantChunks = [];

                for (const transcript of transcripts) {
                    if (transcript.chunks && transcript.chunks.length > 0) {
                        const matches = transcript.chunks.filter(chunk => {
                            const queryLower = query.toLowerCase();
                            const textLower = chunk.text.toLowerCase();
                            return textLower.includes(queryLower) ||
                                   chunk.topic?.toLowerCase().includes(queryLower);
                        });

                        if (matches.length > 0) {
                            relevantChunks.push({
                                transcript_id: transcript.id,
                                transcript_title: transcript.title,
                                date: transcript.interview_date,
                                chunks: matches.slice(0, 3)
                            });
                        }
                    }
                }

                results.data.transcripts = {
                    count: relevantChunks.length,
                    results: relevantChunks
                };
            } catch (error) {
                results.data.transcripts = { error: error.message };
            }
        }

        // 2. Query CorporateFact SSOT
        if (sources.includes('corporate_facts')) {
            try {
                const facts = await base44.asServiceRole.entities.CorporateFact.filter({});
                
                const relevantFacts = facts.filter(fact => {
                    const queryLower = query.toLowerCase();
                    return fact.indicator_name?.toLowerCase().includes(queryLower) ||
                           fact.description?.toLowerCase().includes(queryLower) ||
                           fact.country?.toLowerCase().includes(queryLower) ||
                           fact.tags?.some(tag => tag.toLowerCase().includes(queryLower));
                }).slice(0, 10);

                results.data.corporate_facts = {
                    count: relevantFacts.length,
                    results: relevantFacts.map(f => ({
                        category: f.category,
                        indicator: f.indicator_name,
                        value: f.value,
                        numeric_value: f.numeric_value,
                        unit: f.unit,
                        year: f.year,
                        country: f.country,
                        source: f.source,
                        description: f.description,
                        verified: f.verified
                    }))
                };
            } catch (error) {
                results.data.corporate_facts = { error: error.message };
            }
        }

        // 3. Query World Bank API directly
        if (sources.includes('world_bank')) {
            try {
                const searchTerms = query.split(' ').slice(0, 3).join('+');
                const wbResponse = await fetch(
                    `https://api.worldbank.org/v2/indicator?format=json&per_page=10&q=${searchTerms}`
                );
                
                if (wbResponse.ok) {
                    const wbData = await wbResponse.json();
                    
                    if (wbData && wbData[1]) {
                        results.data.world_bank = {
                            count: wbData[1].length,
                            results: wbData[1].map(indicator => ({
                                id: indicator.id,
                                name: indicator.name,
                                source: indicator.source?.value,
                                description: indicator.sourceNote,
                                topics: indicator.topics?.map(t => t.value)
                            }))
                        };
                    }
                }
            } catch (error) {
                results.data.world_bank = { error: error.message };
            }
        }

        // 4. Query Financial News (using LLM with internet context)
        if (sources.includes('news')) {
            try {
                const newsResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: `Search for recent news and data about: ${query}. Focus on: economic indicators, trade data, geopolitical developments, and financial market information. Return structured data.`,
                    add_context_from_internet: true,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            articles: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string" },
                                        summary: { type: "string" },
                                        source: { type: "string" },
                                        date: { type: "string" },
                                        key_facts: {
                                            type: "array",
                                            items: { type: "string" }
                                        }
                                    }
                                }
                            },
                            key_findings: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    }
                });

                results.data.news = {
                    count: newsResponse.articles?.length || 0,
                    results: newsResponse.articles || [],
                    key_findings: newsResponse.key_findings || []
                };
            } catch (error) {
                results.data.news = { error: error.message };
            }
        }

        // 5. Synthesize all results using LLM
        const synthesisPrompt = `Você é um analista geopolítico. Sintetize as seguintes informações em resposta à query: "${query}"

DADOS DISPONÍVEIS:
${sources.includes('transcripts') && results.data.transcripts?.results ? 
  `Entrevistas de Marcos Troyjo: ${JSON.stringify(results.data.transcripts.results.slice(0, 2))}` : ''}

${sources.includes('corporate_facts') && results.data.corporate_facts?.results ? 
  `Dados Corporativos (SSOT): ${JSON.stringify(results.data.corporate_facts.results.slice(0, 5))}` : ''}

${sources.includes('world_bank') && results.data.world_bank?.results ? 
  `World Bank: ${JSON.stringify(results.data.world_bank.results.slice(0, 3))}` : ''}

${sources.includes('news') && results.data.news?.key_findings ? 
  `Notícias Recentes: ${JSON.stringify(results.data.news.key_findings)}` : ''}

Forneça uma resposta completa, contextualizada e baseada nos dados acima. Se houver dados numéricos, cite-os. Se houver insights de Troyjo, inclua-os.`;

        const synthesis = await base44.integrations.Core.InvokeLLM({
            prompt: synthesisPrompt
        });

        results.synthesis = synthesis;
        results.timestamp = new Date().toISOString();

        return Response.json(results);

    } catch (error) {
        console.error('Error in enhanced RAG:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});