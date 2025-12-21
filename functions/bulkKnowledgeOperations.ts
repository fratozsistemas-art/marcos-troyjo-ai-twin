import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            operation, 
            entry_ids = [], 
            data = {},
            files = []
        } = await req.json();

        if (!operation) {
            return Response.json({ error: 'operation required' }, { status: 400 });
        }

        const results = {
            success: [],
            failed: []
        };

        if (operation === 'bulk_delete') {
            for (const id of entry_ids) {
                try {
                    await base44.entities.KnowledgeEntry.delete(id);
                    results.success.push({ id, operation: 'deleted' });
                } catch (error) {
                    results.failed.push({ id, error: error.message });
                }
            }
        } else if (operation === 'bulk_update_status') {
            for (const id of entry_ids) {
                try {
                    await base44.entities.KnowledgeEntry.update(id, {
                        status: data.status
                    });
                    results.success.push({ id, operation: 'status_updated' });
                } catch (error) {
                    results.failed.push({ id, error: error.message });
                }
            }
        } else if (operation === 'bulk_add_tags') {
            for (const id of entry_ids) {
                try {
                    const entry = await base44.entities.KnowledgeEntry.filter({ id });
                    if (entry.length > 0) {
                        const existingTags = entry[0].tags || [];
                        const newTags = [...new Set([...existingTags, ...(data.tags || [])])];
                        await base44.entities.KnowledgeEntry.update(id, {
                            tags: newTags
                        });
                        results.success.push({ id, operation: 'tags_added' });
                    }
                } catch (error) {
                    results.failed.push({ id, error: error.message });
                }
            }
        } else if (operation === 'bulk_change_category') {
            for (const id of entry_ids) {
                try {
                    await base44.entities.KnowledgeEntry.update(id, {
                        category: data.category
                    });
                    results.success.push({ id, operation: 'category_changed' });
                } catch (error) {
                    results.failed.push({ id, error: error.message });
                }
            }
        } else if (operation === 'import_files') {
            // Import knowledge from uploaded files
            for (const fileUrl of files) {
                try {
                    // Extract content from file
                    const extractResponse = await base44.integrations.Core.InvokeLLM({
                        prompt: `Extraia o conteúdo deste documento e estruture como uma entrada de conhecimento.

Forneça no formato JSON:
{
  "title": "...",
  "summary": "resumo breve em 2-3 linhas",
  "body": "conteúdo completo em Markdown",
  "category": "discurso|artigo|entrevista|conceito|analise|nota|outro",
  "keywords": ["palavra1", "palavra2", ...],
  "tags": ["tag1", "tag2", ...]
}`,
                        file_urls: [fileUrl],
                        response_json_schema: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                summary: { type: "string" },
                                body: { type: "string" },
                                category: { type: "string" },
                                keywords: { type: "array", items: { type: "string" } },
                                tags: { type: "array", items: { type: "string" } }
                            }
                        }
                    });

                    const entry = await base44.entities.KnowledgeEntry.create({
                        ...extractResponse,
                        status: 'publicado',
                        author: user.full_name || user.email
                    });

                    results.success.push({ 
                        file: fileUrl, 
                        operation: 'imported',
                        entry_id: entry.id 
                    });
                } catch (error) {
                    results.failed.push({ file: fileUrl, error: error.message });
                }
            }
        } else if (operation === 'bulk_generate_embeddings') {
            for (const id of entry_ids) {
                try {
                    const entries = await base44.entities.KnowledgeEntry.filter({ id });
                    if (entries.length === 0) continue;
                    
                    const entry = entries[0];
                    const textToEmbed = `${entry.title}\n${entry.summary}\n${entry.body}`;
                    
                    // Generate embedding (using a hypothetical embedding function)
                    const embeddingResponse = await base44.asServiceRole.functions.invoke('generateKnowledgeEmbeddings', {
                        text: textToEmbed
                    });

                    await base44.entities.KnowledgeEntry.update(id, {
                        embedding: embeddingResponse.data.embedding,
                        embedding_model: 'text-embedding-3-small',
                        last_embedded_date: new Date().toISOString()
                    });

                    results.success.push({ id, operation: 'embedding_generated' });
                } catch (error) {
                    results.failed.push({ id, error: error.message });
                }
            }
        } else {
            return Response.json({ error: 'Invalid operation' }, { status: 400 });
        }

        return Response.json({
            operation,
            total: entry_ids.length + files.length,
            success: results.success.length,
            failed: results.failed.length,
            results
        });

    } catch (error) {
        console.error('Error in bulk operations:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});