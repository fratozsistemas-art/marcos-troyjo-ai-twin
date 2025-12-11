import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get all transcripts and recent documents
        const transcripts = await base44.asServiceRole.entities.InterviewTranscript.list('-interview_date', 50);
        const articles = await base44.asServiceRole.entities.Article.list('-publication_date', 30);
        
        // Aggregate content for analysis
        const contentPool = [
            ...transcripts.map(t => ({
                type: 'transcript',
                title: t.title,
                content: t.full_transcript,
                date: t.interview_date,
                topics: t.main_topics || [],
                keywords: t.keywords || []
            })),
            ...articles.map(a => ({
                type: 'article',
                title: a.title,
                content: a.body,
                date: a.publication_date,
                topics: a.tags || [],
                keywords: a.seo_keywords || []
            }))
        ];

        // Identify emerging themes
        const themeAnalysis = await base44.integrations.Core.InvokeLLM({
            prompt: `Analise os seguintes documentos e identifique temas emergentes:

DOCUMENTOS: ${JSON.stringify(contentPool.slice(0, 15).map(c => ({
    title: c.title,
    topics: c.topics,
    keywords: c.keywords,
    excerpt: c.content.substring(0, 300)
})), null, 2)}

Identifique:
1. Temas recorrentes (5-7 principais)
2. Conceitos emergentes (novos ou crescentes)
3. Lacunas de conhecimento (áreas pouco cobertas)
4. Padrões temporais (evolução de tópicos)`,
            response_json_schema: {
                type: "object",
                properties: {
                    recurring_themes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                theme: { type: "string" },
                                frequency: { type: "number" },
                                relevance_score: { type: "number" },
                                related_docs: { type: "array", items: { type: "string" } }
                            }
                        }
                    },
                    emerging_concepts: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                concept: { type: "string" },
                                description: { type: "string" },
                                growth_trajectory: { type: "string" }
                            }
                        }
                    },
                    knowledge_gaps: {
                        type: "array",
                        items: { type: "string" }
                    },
                    temporal_patterns: { type: "string" }
                }
            }
        });

        // Generate knowledge articles for top themes
        const generatedArticles = [];
        
        for (const theme of themeAnalysis.recurring_themes.slice(0, 3)) {
            const relatedContent = contentPool.filter(c => 
                c.topics.some(t => t.toLowerCase().includes(theme.theme.toLowerCase())) ||
                c.keywords.some(k => k.toLowerCase().includes(theme.theme.toLowerCase()))
            );

            const article = await base44.integrations.Core.InvokeLLM({
                prompt: `Crie um artigo de conhecimento sobre: "${theme.theme}"

CONTEXTO DOS DOCUMENTOS:
${relatedContent.slice(0, 5).map(c => `
TÍTULO: ${c.title}
TIPO: ${c.type}
CONTEÚDO: ${c.content.substring(0, 800)}
`).join('\n\n---\n\n')}

TAREFA:
Crie um artigo estruturado com:
- Título executivo
- Resumo (2-3 linhas)
- Introdução
- Análise detalhada (3-4 seções)
- Insights-chave (bullet points)
- Implicações práticas
- FAQs (3-5 perguntas frequentes)
- Fontes e referências

Use o estilo Troyjo: sofisticado, analítico, com neologismos quando apropriado.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        summary: { type: "string" },
                        content: { type: "string" },
                        key_insights: { type: "array", items: { type: "string" } },
                        faqs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    answer: { type: "string" }
                                }
                            }
                        },
                        sources: { type: "array", items: { type: "string" } },
                        related_concepts: { type: "array", items: { type: "string" } }
                    }
                }
            });

            generatedArticles.push({
                theme: theme.theme,
                relevance_score: theme.relevance_score,
                ...article
            });
        }

        // Store articles in a knowledge base
        const knowledgeEntries = await Promise.all(
            generatedArticles.map(article => 
                base44.asServiceRole.entities.Article.create({
                    title: article.title,
                    subtitle: article.summary,
                    type: 'knowledge_base',
                    summary: article.summary,
                    body: article.content,
                    tags: ['ai-generated', 'knowledge-base', article.theme],
                    status: 'publicado',
                    quality_tier: 'ai_generated',
                    approval_status: 'pendente',
                    featured: false
                })
            )
        );

        return Response.json({
            success: true,
            theme_analysis: themeAnalysis,
            generated_articles: knowledgeEntries.length,
            articles: knowledgeEntries.map(a => ({
                id: a.id,
                title: a.title,
                summary: a.summary
            }))
        });

    } catch (error) {
        console.error('Error generating knowledge articles:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});