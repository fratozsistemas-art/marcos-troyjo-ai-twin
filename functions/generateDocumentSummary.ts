import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { document_id } = await req.json();

        // Buscar o documento
        const document = await base44.entities.Document.get(document_id);
        if (!document) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }

        // Buscar todos os chunks do documento
        const chunks = await base44.entities.DocumentChunk.filter({
            document_id: document_id
        });

        if (chunks.length === 0) {
            return Response.json({ error: 'No chunks found for this document' }, { status: 404 });
        }

        // Combinar conteúdo dos chunks
        const fullContent = chunks
            .sort((a, b) => a.chunk_index - b.chunk_index)
            .map((chunk, idx) => `[Chunk ${idx + 1}]\n${chunk.content}`)
            .join('\n\n');

        // Gerar resumo com LLM
        const summaryPrompt = `Você é Marcos Prado Troyjo. Analise o seguinte documento e gere um resumo estruturado e analítico.

**Documento**: ${document.title}
**Categoria**: ${document.category}
**Autor**: ${document.author || 'Não especificado'}

**Conteúdo do documento**:
${fullContent}

**Instruções para o resumo**:
1. Crie um resumo executivo (150-200 palavras) destacando os pontos principais
2. Identifique 3-5 insights-chave com análise geopolítica/econômica
3. Para cada insight, cite o chunk específico usado como fonte no formato: [${document.title}, Chunk X]
4. Conecte os conceitos do documento com frameworks Troyjo quando relevante (desglobalização, trumpulência, Novo ESG, etc)
5. Inclua implicações estratégicas e recomendações se aplicável

**Formato de saída** (em JSON):
{
  "executive_summary": "...",
  "key_insights": [
    {
      "insight": "...",
      "analysis": "...",
      "source_chunks": [1, 3],
      "citation": "[${document.title}, Chunks 1, 3]"
    }
  ],
  "strategic_implications": "...",
  "troyjo_frameworks_applied": ["framework1", "framework2"],
  "recommendations": ["...", "..."]
}`;

        const summaryData = await base44.integrations.Core.InvokeLLM({
            prompt: summaryPrompt,
            response_json_schema: {
                type: 'object',
                properties: {
                    executive_summary: { type: 'string' },
                    key_insights: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                insight: { type: 'string' },
                                analysis: { type: 'string' },
                                source_chunks: { type: 'array', items: { type: 'integer' } },
                                citation: { type: 'string' }
                            }
                        }
                    },
                    strategic_implications: { type: 'string' },
                    troyjo_frameworks_applied: { type: 'array', items: { type: 'string' } },
                    recommendations: { type: 'array', items: { type: 'string' } }
                }
            }
        });

        // Atualizar documento com resumo
        await base44.entities.Document.update(document_id, {
            ai_summary: summaryData.executive_summary,
            summary_metadata: {
                generated_at: new Date().toISOString(),
                key_insights: summaryData.key_insights,
                frameworks_applied: summaryData.troyjo_frameworks_applied
            }
        });

        return Response.json({
            success: true,
            summary: summaryData,
            document: {
                title: document.title,
                total_chunks: chunks.length
            }
        });

    } catch (error) {
        console.error('Error generating summary:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});