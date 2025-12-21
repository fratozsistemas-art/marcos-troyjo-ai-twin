import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { question } = await req.json();

        // Step 1: Extract key entities from question
        const entityExtractionPrompt = `Da pergunta: "${question}"
        
Extraia e retorne em JSON:
- keywords: array de palavras-chave importantes
- countries: array de países mencionados (códigos ISO se possível, ex: BRA, CHN)
- years: array de anos mencionados
- indicators: possíveis indicadores econômicos mencionados`;

        const entitySchema = {
            type: "object",
            properties: {
                keywords: { type: "array", items: { type: "string" } },
                countries: { type: "array", items: { type: "string" } },
                years: { type: "array", items: { type: "integer" } },
                indicators: { type: "array", items: { type: "string" } }
            }
        };

        const entities = await base44.integrations.Core.InvokeLLM({
            prompt: entityExtractionPrompt,
            response_json_schema: entitySchema
        });

        // Step 2: Query SSOT database
        const facts = await base44.asServiceRole.entities.CorporateFact.list('-last_updated', 500);

        // Filter relevant facts
        let relevantFacts = facts;
        
        if (entities.countries?.length > 0) {
            relevantFacts = relevantFacts.filter(f => 
                entities.countries.some(c => f.country.includes(c) || c.includes(f.country))
            );
        }

        if (entities.years?.length > 0) {
            relevantFacts = relevantFacts.filter(f => 
                entities.years.includes(f.year)
            );
        }

        if (entities.keywords?.length > 0) {
            relevantFacts = relevantFacts.filter(f =>
                entities.keywords.some(kw => 
                    f.indicator_name.toLowerCase().includes(kw.toLowerCase()) ||
                    f.description?.toLowerCase().includes(kw.toLowerCase()) ||
                    f.tags?.some(tag => tag.toLowerCase().includes(kw.toLowerCase()))
                )
            );
        }

        // Limit to top 20 most relevant
        relevantFacts = relevantFacts.slice(0, 20);

        // Step 3: Generate answer with citations
        const factsContext = relevantFacts.map((f, idx) => 
            `[${idx + 1}] ${f.indicator_name}: ${f.value} ${f.unit || ''} (${f.country}, ${f.year}) - Fonte: ${f.source}`
        ).join('\n');

        const answerPrompt = `Você é um assistente especializado em análise de dados econômicos e corporativos.

Pergunta do usuário: "${question}"

Dados disponíveis no SSOT:
${factsContext}

Responda à pergunta de forma clara e objetiva, citando as fontes usando os números [1], [2], etc. 
Se os dados não forem suficientes para responder, seja honesto e sugira o que seria necessário.
Formate a resposta de forma profissional e inclua insights relevantes.`;

        const answer = await base44.integrations.Core.InvokeLLM({
            prompt: answerPrompt,
            add_context_from_internet: false
        });

        // Prepare citations
        const citations = relevantFacts.map((f, idx) => ({
            id: idx + 1,
            indicator: f.indicator_name,
            value: f.value,
            unit: f.unit,
            country: f.country,
            year: f.year,
            source: f.source,
            source_url: f.source_url,
            verified: f.verified
        }));

        return Response.json({
            success: true,
            question: question,
            answer: answer,
            citations: citations,
            facts_used: relevantFacts.length
        });

    } catch (error) {
        console.error('Error querying chatbot:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});