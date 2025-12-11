import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { article_id, article_content, article_title } = await req.json();

        // Get all knowledge base articles
        const allArticles = await base44.asServiceRole.entities.Article.filter({
            tags: { $in: ['knowledge-base'] }
        }, '-created_date', 100);

        // Exclude current article
        const otherArticles = allArticles.filter(a => a.id !== article_id);

        // Use LLM to analyze and find related articles
        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: `Analise o seguinte artigo e identifique quais outros artigos são relacionados:

ARTIGO ATUAL:
Título: ${article_title}
Conteúdo: ${article_content.substring(0, 2000)}

OUTROS ARTIGOS:
${otherArticles.slice(0, 20).map((a, idx) => `
${idx + 1}. ID: ${a.id}
   Título: ${a.title}
   Resumo: ${a.summary}
   Tags: ${a.tags?.join(', ')}
`).join('\n')}

Retorne os IDs dos artigos que têm forte relação temática ou conceitual.
Critérios:
- Temas similares
- Conceitos complementares
- Análises de períodos relacionados
- Frameworks que se conectam

Retorne no máximo 5 artigos mais relacionados.`,
            response_json_schema: {
                type: "object",
                properties: {
                    related_article_ids: {
                        type: "array",
                        items: { type: "string" }
                    },
                    reasoning: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                article_id: { type: "string" },
                                reason: { type: "string" }
                            }
                        }
                    }
                }
            }
        });

        // Update the article with related links
        if (article_id && analysis.related_article_ids?.length > 0) {
            await base44.asServiceRole.entities.Article.update(article_id, {
                related_articles: analysis.related_article_ids
            });

            // Bi-directional linking: update related articles to link back
            for (const relatedId of analysis.related_article_ids) {
                const related = await base44.asServiceRole.entities.Article.filter({ id: relatedId });
                if (related[0]) {
                    const existingLinks = related[0].related_articles || [];
                    if (!existingLinks.includes(article_id)) {
                        await base44.asServiceRole.entities.Article.update(relatedId, {
                            related_articles: [...existingLinks, article_id]
                        });
                    }
                }
            }
        }

        return Response.json({
            success: true,
            related_article_ids: analysis.related_article_ids || [],
            reasoning: analysis.reasoning || []
        });

    } catch (error) {
        console.error('Error auto-linking:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});