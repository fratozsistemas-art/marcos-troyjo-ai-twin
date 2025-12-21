import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get('OPENAI_API_KEY'),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { entry_id, force = false } = await req.json();

        if (!entry_id) {
            return Response.json({ 
                error: 'entry_id is required' 
            }, { status: 400 });
        }

        // Get the entry
        const entries = await base44.entities.KnowledgeEntry.filter({ id: entry_id });
        
        if (entries.length === 0) {
            return Response.json({ 
                error: 'Entry not found' 
            }, { status: 404 });
        }

        const entry = entries[0];

        // Check if embedding already exists
        if (!force && entry.embedding && entry.embedding.length > 0) {
            return Response.json({
                success: true,
                message: 'Embedding already exists',
                cached: true
            });
        }

        // Prepare text for embedding
        const textToEmbed = `${entry.title}\n\n${entry.summary || ''}\n\n${entry.body}`;

        // Generate embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: textToEmbed,
            encoding_format: 'float'
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Update entry with embedding
        await base44.entities.KnowledgeEntry.update(entry_id, {
            embedding: embedding,
            embedding_model: 'text-embedding-3-small',
            last_embedded_date: new Date().toISOString()
        });

        return Response.json({
            success: true,
            message: 'Embedding generated successfully',
            dimension: embedding.length,
            cached: false
        });

    } catch (error) {
        console.error('Error generating embedding:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});