import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { document_id, file_url } = await req.json();

        if (!document_id || !file_url) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch file content
        const fileResponse = await fetch(file_url);
        const fileText = await fileResponse.text();

        // Extract and chunk content
        const chunks = chunkText(fileText, 1000);

        // Generate embeddings and store in knowledge base
        const trainingEntries = [];
        for (const chunk of chunks) {
            const summary = await base44.integrations.Core.InvokeLLM({
                prompt: `Extraia os conceitos-chave e informações importantes deste texto:\n\n${chunk}`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        key_concepts: { type: 'array', items: { type: 'string' } },
                        summary: { type: 'string' }
                    }
                }
            });

            trainingEntries.push({
                document_id,
                content: chunk,
                key_concepts: summary.key_concepts || [],
                summary: summary.summary,
                user_email: user.email
            });
        }

        // Store training data as known positions for retrieval
        for (const entry of trainingEntries) {
            await base44.asServiceRole.entities.KnownPosition.create({
                topic: `Training: ${entry.key_concepts.join(', ')}`,
                position: entry.summary,
                source: `User Document: ${document_id}`,
                confidence: 90,
                category: 'other',
                keywords: entry.key_concepts
            });
        }

        return Response.json({
            success: true,
            entries_created: trainingEntries.length,
            message: 'Document training completed'
        });

    } catch (error) {
        console.error('Error training persona:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function chunkText(text, maxLength) {
    const chunks = [];
    let currentChunk = '';
    
    const sentences = text.split(/[.!?]\s+/);
    
    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
        }
    }
    
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}