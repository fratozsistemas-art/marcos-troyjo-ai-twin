import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url } = await req.json();

        // Extract facts from document using LLM
        const extractionPrompt = `Analise o documento e extraia todos os fatos econômicos, comerciais e corporativos relevantes. 
        
Para cada fato identificado, retorne no formato JSON especificado. Foque em:
- Indicadores econômicos (PIB, inflação, comércio, etc)
- Dados comerciais e de investimento
- Fatos institucionais e geopolíticos
- Métricas de desenvolvimento

Sempre inclua: indicador, valor, país, ano, categoria e fonte quando disponível.`;

        const jsonSchema = {
            type: "object",
            properties: {
                facts: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            indicator_name: { type: "string" },
                            value: { type: "string" },
                            numeric_value: { type: "number" },
                            unit: { type: "string" },
                            year: { type: "integer" },
                            country: { type: "string" },
                            category: { 
                                type: "string",
                                enum: ["economic_indicator", "trade_data", "institutional_fact", "geopolitical_data", "development_metric", "corporate_info"]
                            },
                            source: { type: "string" },
                            description: { type: "string" },
                            confidence: { type: "number" }
                        },
                        required: ["indicator_name", "value", "category"]
                    }
                },
                document_summary: { type: "string" }
            }
        };

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: extractionPrompt,
            file_urls: [file_url],
            response_json_schema: jsonSchema
        });

        // Auto-save extracted facts
        const savedFacts = [];
        const errors = [];

        for (const fact of response.facts || []) {
            try {
                const created = await base44.asServiceRole.entities.CorporateFact.create({
                    ...fact,
                    source: fact.source || 'document_upload',
                    verified: false,
                    tags: ['ai-extracted', 'document-upload'],
                    confidence_score: fact.confidence || 75,
                    last_updated: new Date().toISOString()
                });

                // Log creation in history
                await base44.asServiceRole.entities.CorporateFactHistory.create({
                    fact_id: created.id,
                    action_type: 'create',
                    changed_by: user.email,
                    change_reason: 'Extracted from uploaded document'
                });

                savedFacts.push(created);
            } catch (error) {
                errors.push({ fact: fact.indicator_name, error: error.message });
            }
        }

        return Response.json({
            success: true,
            facts_extracted: response.facts?.length || 0,
            facts_saved: savedFacts.length,
            document_summary: response.document_summary,
            saved_facts: savedFacts,
            errors: errors
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});