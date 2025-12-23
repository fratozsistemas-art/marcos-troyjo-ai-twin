import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { document_id } = await req.json();

        if (!document_id) {
            return Response.json({ error: 'document_id is required' }, { status: 400 });
        }

        // Get document
        const documents = await base44.entities.Document.filter({ id: document_id });
        if (!documents || documents.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }

        const document = documents[0];

        // Prepare prompt for analysis
        const analysisPrompt = `Você é um assistente especializado em análise de conteúdo sobre economia global, diplomacia e comércio internacional, focado em Marcos Troyjo.

Analise o seguinte documento:

Título: ${document.title}
Descrição: ${document.description || 'Não fornecida'}
Tipo: ${document.category}
URL: ${document.file_url}

Por favor, forneça uma análise estruturada com:

1. RESUMO: Um resumo executivo de 2-3 frases do conteúdo principal
2. ENTIDADES: Liste as principais entidades mencionadas:
   - Pessoas (nomes de figuras políticas, economistas, etc.)
   - Locais (países, regiões, cidades)
   - Organizações (BRICS, NDB, instituições internacionais, etc.)
3. TEMAS: Liste os 5-8 temas/tags principais abordados
4. CONTEXTO: Contexto histórico ou situacional (1-2 frases)

Responda em formato JSON válido.`;

        // Call LLM with structured output
        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    summary: {
                        type: "string",
                        description: "Resumo executivo do documento"
                    },
                    entities: {
                        type: "object",
                        properties: {
                            people: {
                                type: "array",
                                items: { type: "string" },
                                description: "Lista de pessoas mencionadas"
                            },
                            locations: {
                                type: "array",
                                items: { type: "string" },
                                description: "Lista de locais mencionados"
                            },
                            organizations: {
                                type: "array",
                                items: { type: "string" },
                                description: "Lista de organizações mencionadas"
                            }
                        }
                    },
                    themes: {
                        type: "array",
                        items: { type: "string" },
                        description: "Temas e tags principais"
                    },
                    context: {
                        type: "string",
                        description: "Contexto histórico ou situacional"
                    }
                },
                required: ["summary", "entities", "themes"]
            }
        });

        // Update document with analysis results
        const updatedTags = [...new Set([
            ...(document.tags || []),
            ...(analysis.themes || [])
        ])];

        const allEntities = [
            ...(analysis.entities?.people || []),
            ...(analysis.entities?.locations || []),
            ...(analysis.entities?.organizations || [])
        ];

        const updatedKeywords = [...new Set([
            ...(document.keywords || []),
            ...allEntities
        ])];

        await base44.entities.Document.update(document_id, {
            description: analysis.summary || document.description,
            tags: updatedTags.slice(0, 20), // Limit to 20 tags
            keywords: updatedKeywords.slice(0, 30) // Limit to 30 keywords
        });

        return Response.json({
            success: true,
            analysis: {
                summary: analysis.summary,
                entities: analysis.entities,
                themes: analysis.themes,
                context: analysis.context,
                tags_added: updatedTags.length - (document.tags?.length || 0),
                keywords_added: updatedKeywords.length - (document.keywords?.length || 0)
            }
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return Response.json({ 
            error: error.message || 'Error analyzing document',
            details: error.toString()
        }, { status: 500 });
    }
});