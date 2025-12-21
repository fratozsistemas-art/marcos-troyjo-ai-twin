import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            action,
            topic = '',
            existing_content = {},
            category = 'artigo',
            target_length = 'medium'
        } = await req.json();

        if (!action) {
            return Response.json({ error: 'action required' }, { status: 400 });
        }

        let result = {};

        if (action === 'generate_draft') {
            // Generate complete draft article from topic
            const draftPrompt = `Como Marcos Prado Troyjo, escreva um artigo completo sobre:

TEMA: ${topic}

CATEGORIA: ${category}

EXTENSÃO: ${target_length === 'short' ? '400-600 palavras' : target_length === 'long' ? '1200-1600 palavras' : '800-1000 palavras'}

Estruture o artigo profissionalmente com:
- Introdução contextual
- Desenvolvimento analítico (use dados e exemplos concretos)
- Implicações e perspectivas
- Conclusão prescritiva

Use vocabulário técnico apropriado (desglobalização, trumpulência, Novo ESG, etc).
Aplique as lentes cognitivas relevantes.
Tom: analítico, diplomático, prescritivo.

Formate em Markdown.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: draftPrompt,
                add_context_from_internet: true
            });

            result.draft = response;

        } else if (action === 'suggest_title') {
            // Suggest title based on content or topic
            const content = existing_content.body || existing_content.summary || topic;
            
            const titlePrompt = `Com base no seguinte conteúdo, sugira 5 títulos alternativos no estilo de Marcos Troyjo - impactantes, precisos e profissionais:

CONTEÚDO:
${content.substring(0, 1000)}

Retorne apenas os 5 títulos, um por linha, sem numeração.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: titlePrompt
            });

            result.titles = response.split('\n').filter(t => t.trim()).slice(0, 5);

        } else if (action === 'generate_summary') {
            // Generate summary from content
            const summaryPrompt = `Crie um resumo executivo (máximo 3 linhas) do seguinte conteúdo, no estilo Troyjo - direto, denso, prescritivo:

${existing_content.body || topic}

Resumo:`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: summaryPrompt
            });

            result.summary = response.trim();

        } else if (action === 'generate_tags_keywords') {
            // Auto-generate tags and keywords
            const content = existing_content.body || existing_content.summary || topic;
            
            const tagsPrompt = `Analise o conteúdo abaixo e extraia:
1. TAGS (3-5): categorias amplas/temas principais
2. KEYWORDS (5-8): termos-chave específicos para busca

CONTEÚDO:
${content}

Retorne no formato JSON:
{
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: tagsPrompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        tags: { type: "array", items: { type: "string" } },
                        keywords: { type: "array", items: { type: "string" } }
                    }
                }
            });

            result.tags = response.tags || [];
            result.keywords = response.keywords || [];

        } else if (action === 'enhance_content') {
            // Enhance existing content with Troyjo style
            const enhancePrompt = `Como editor, revise e aprimore o seguinte texto aplicando o estilo Marcos Troyjo:

CONTEÚDO ORIGINAL:
${existing_content.body}

Melhorias esperadas:
- Vocabulário técnico mais sofisticado
- Estrutura mais clara e impactante
- Dados e exemplos concretos quando possível
- Tom diplomático e prescritivo
- Citações ou conceitos Troyjo (desglobalização, Novo ESG, etc)

Retorne o texto aprimorado em Markdown.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: enhancePrompt,
                add_context_from_internet: topic ? true : false
            });

            result.enhanced_body = response;

        } else if (action === 'suggest_related') {
            // Suggest related topics/articles
            const relatedPrompt = `Com base no tema "${topic}" ou conteúdo fornecido, sugira 5 temas relacionados que seriam interessantes para artigos futuros no contexto geopolítico/econômico Troyjo:

${existing_content.body ? existing_content.body.substring(0, 500) : ''}

Liste apenas os 5 temas, um por linha.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: relatedPrompt
            });

            result.related_topics = response.split('\n').filter(t => t.trim()).slice(0, 5);

        } else if (action === 'complete_article') {
            // Generate complete article with all metadata
            const completePrompt = `Crie um artigo COMPLETO sobre:

TEMA: ${topic}
CATEGORIA: ${category}

Retorne no formato JSON:
{
  "title": "título impactante",
  "summary": "resumo executivo (2-3 linhas)",
  "body": "conteúdo completo em Markdown (800-1000 palavras)",
  "tags": ["tag1", "tag2", "tag3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Estilo Troyjo: analítico, diplomático, prescritivo. Use vocabulário técnico apropriado.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: completePrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        summary: { type: "string" },
                        body: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        keywords: { type: "array", items: { type: "string" } }
                    }
                }
            });

            result = {
                ...response,
                category,
                author: user.full_name || user.email,
                status: 'rascunho'
            };
        }

        return Response.json(result);

    } catch (error) {
        console.error('Error in AI content assistant:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});