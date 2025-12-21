import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query, max_tokens = 3000 } = await req.json();
        
        if (!query) {
            return Response.json({ error: 'query required' }, { status: 400 });
        }

        // Search user documents
        const searchResponse = await base44.functions.invoke('searchDocumentsRAG', {
            query,
            top_k: 10
        });

        if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
            return Response.json({
                context: '',
                sources: [],
                message: 'No relevant documents found'
            });
        }

        // Build context from top results (respecting token limit)
        let context = '=== CONTEXTO DE DOCUMENTOS DO USUÁRIO ===\n\n';
        const sources = [];
        let tokenCount = 0;

        for (const result of searchResponse.data.results) {
            const chunkTokens = result.content.length / 4; // Rough estimate
            
            if (tokenCount + chunkTokens > max_tokens) {
                break;
            }

            context += `Fonte: ${result.citation}\n`;
            context += `Similaridade: ${(result.similarity_score * 100).toFixed(1)}%\n`;
            if (result.metadata?.author) {
                context += `Autor: ${result.metadata.author}\n`;
            }
            if (result.metadata?.publication_date) {
                context += `Data: ${result.metadata.publication_date}\n`;
            }
            context += `\nConteúdo:\n${result.content}\n\n---\n\n`;
            
            sources.push({
                document_name: result.document_name,
                citation: result.citation,
                similarity: result.similarity_score,
                metadata: result.metadata
            });
            
            tokenCount += chunkTokens;
        }

        context += '=== FIM DO CONTEXTO ===\n\n';
        context += 'IMPORTANTE: Ao usar informações acima, SEMPRE cite a fonte usando o formato [Nome do Documento, chunk X].\n';
        context += 'Se houver conflito entre documentos do usuário e conhecimento base, PRIORIZE os documentos do usuário.\n';

        return Response.json({
            context,
            sources,
            token_count: Math.ceil(tokenCount),
            chunks_used: sources.length
        });

    } catch (error) {
        console.error('Error retrieving RAG context:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});