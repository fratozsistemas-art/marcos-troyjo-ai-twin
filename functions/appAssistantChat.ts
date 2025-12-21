import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
});

const SYSTEM_PROMPT = `Você é um assistente virtual do Troyjo Twin, especializado em ajudar usuários a navegar e utilizar o aplicativo de análise geopolítica e econômica.

FUNCIONALIDADES DO APP:
1. **Dashboard**: Painel principal com widgets personalizáveis, dados corporativos, sincronização World Bank
2. **Analytics Dashboard**: Criação de dashboards customizados com visualizações de dados
3. **Consultation**: Chat com o Digital Twin do Marcos Troyjo para consultas sobre economia global
4. **SSOT (Single Source of Truth)**: Gerenciamento de fatos corporativos, dados do World Bank, visualizações
5. **Custom Chart Builder**: Criação de gráficos customizados (linha, barra, área, pizza) com filtros por país e ano
6. **Knowledge Base**: Base de conhecimento com tutoriais, FAQs, artigos, guias e referências técnicas
7. **Atalhos de Teclado**: g+h (home), g+d (dashboard), g+a (analytics), g+c (consulta), ? (ajuda)
8. **Export para Google Drive**: Salvar dashboards e dados no Google Drive

MÉTRICAS E DADOS:
- Dados do World Bank: PIB, comércio, indicadores econômicos
- Países BRICS: Brasil, China, Índia, Rússia, África do Sul
- Dados trimestrais com comparações YoY e QoQ
- Filtros por fonte (World Bank, IMF, WTO, NDB), categoria, país, ano

NAVEGAÇÃO:
- Use breadcrumbs no topo para voltar
- Menu lateral esquerdo com todas as seções
- Atalhos de teclado para acesso rápido

GUIA PARA GRÁFICOS CUSTOMIZADOS:
1. Selecione um indicador (ex: GDP, Trade Balance)
2. Escolha países para comparar
3. Selecione tipo de gráfico (linha para tendências, barra para comparações)
4. Aplique filtros de anos se necessário
5. Exporte para CSV ou Google Drive

Seja conciso, prático e focado em ajudar o usuário a usar o app efetivamente. Responda em português brasileiro.

IMPORTANTE: Sempre que o usuário fizer uma pergunta sobre como usar o app, conceitos econômicos, tutoriais ou solução de problemas, BUSQUE PRIMEIRO na base de conhecimento usando busca semântica antes de responder. Cite os artigos relevantes quando disponíveis.`;

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages, current_page, context } = await req.json();

        if (!messages || messages.length === 0) {
            return Response.json({ 
                error: 'No messages provided' 
            }, { status: 400 });
        }

        // Get last user message for knowledge base search
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        let knowledgeContext = '';

        // Search knowledge base using semantic search for relevant articles
        if (lastUserMessage?.content) {
            try {
                const kbResults = await base44.functions.invoke('searchKnowledgeBase', {
                    query: lastUserMessage.content,
                    limit: 3,
                    min_priority: 3,
                    use_semantic: true,
                    min_similarity: 0.7
                });

                if (kbResults.data?.results?.length > 0) {
                    knowledgeContext = '\n\n📚 ARTIGOS RELEVANTES DA BASE DE CONHECIMENTO:\n';
                    knowledgeContext += `Tipo de busca: ${kbResults.data.search_type === 'semantic' ? 'Semântica (AI)' : 'Palavras-chave'}\n`;
                    
                    kbResults.data.results.forEach((article, idx) => {
                        knowledgeContext += `\n${idx + 1}. "${article.title}" (${article.category})`;
                        if (article.similarity_score) {
                            knowledgeContext += ` [Relevância: ${(article.similarity_score * 100).toFixed(1)}%]`;
                        }
                        if (article.summary) {
                            knowledgeContext += `\n   Resumo: ${article.summary}`;
                        }
                        knowledgeContext += `\n   Conteúdo: ${article.body.substring(0, 400)}...`;
                        knowledgeContext += `\n   Link: /knowledge-article?id=${article.id}\n`;
                    });
                    knowledgeContext += '\n\n✅ USE estas informações da base de conhecimento para fundamentar sua resposta. Sempre cite os artigos relevantes com seus links.';
                }
            } catch (error) {
                console.error('Error searching knowledge base:', error);
            }
        }

        // Build context-aware system prompt
        let contextualPrompt = SYSTEM_PROMPT + knowledgeContext;
        
        if (current_page) {
            contextualPrompt += `\n\n📍 USUÁRIO ESTÁ ATUALMENTE EM: ${current_page}`;
        }
        
        if (context) {
            contextualPrompt += `\n\n🔍 CONTEXTO ADICIONAL: ${context}`;
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: contextualPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 800
        });

        const assistantMessage = completion.choices[0].message.content;

        return Response.json({
            success: true,
            message: assistantMessage,
            usage: {
                prompt_tokens: completion.usage.prompt_tokens,
                completion_tokens: completion.usage.completion_tokens,
                total_tokens: completion.usage.total_tokens
            }
        });

    } catch (error) {
        console.error('Error in app assistant chat:', error);
        return Response.json({ 
            error: error.message,
            details: error.stack
        }, { status: 500 });
    }
});