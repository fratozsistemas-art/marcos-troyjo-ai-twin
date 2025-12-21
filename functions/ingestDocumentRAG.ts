import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { document_id } = await req.json();
        
        if (!document_id) {
            return Response.json({ error: 'document_id required' }, { status: 400 });
        }

        // Get document
        const documents = await base44.asServiceRole.entities.Document.filter({ id: document_id });
        if (documents.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }
        const document = documents[0];

        // Fetch document content
        const response = await fetch(document.file_url);
        if (!response.ok) {
            return Response.json({ error: 'Failed to fetch document' }, { status: 500 });
        }

        const fileBuffer = await response.arrayBuffer();
        const fileBlob = new Blob([fileBuffer]);

        // Extract text based on file type
        let fullText = '';
        if (document.file_type === 'application/pdf') {
            // For PDF, use OpenAI to extract text
            const formData = new FormData();
            formData.append('file', fileBlob, document.name);
            formData.append('model', 'whisper-1'); // Note: This is for audio, we'll use GPT-4 Vision for PDF
            
            // Alternative: Use Core.InvokeLLM with file attachment
            const extractResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: 'Extract all text from this document preserving structure, headings, and citations. Output plain text.',
                file_urls: [document.file_url]
            });
            fullText = extractResult;
        } else if (document.file_type === 'text/plain') {
            fullText = await response.text();
        } else {
            return Response.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        // Chunk text (max 512 tokens per chunk, ~2000 chars with 20% overlap)
        const chunkSize = 2000;
        const overlap = 400;
        const chunks = [];
        
        for (let i = 0; i < fullText.length; i += (chunkSize - overlap)) {
            const chunk = fullText.slice(i, i + chunkSize);
            if (chunk.trim().length > 50) { // Skip very small chunks
                chunks.push({
                    content: chunk.trim(),
                    index: chunks.length
                });
            }
        }

        // Generate embeddings using OpenAI
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        const embeddingsResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: chunks.map(c => c.content)
            })
        });

        if (!embeddingsResponse.ok) {
            const error = await embeddingsResponse.text();
            console.error('OpenAI error:', error);
            return Response.json({ error: 'Failed to generate embeddings' }, { status: 500 });
        }

        const embeddingsData = await embeddingsResponse.json();
        
        // Store chunks with embeddings
        const documentChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const embedding = embeddingsData.data[i].embedding;
            
            documentChunks.push({
                document_id: document.id,
                document_name: document.name,
                chunk_index: chunk.index,
                content: chunk.content,
                embedding: embedding,
                token_count: Math.ceil(chunk.content.length / 4), // Rough estimate
                user_email: user.email,
                indexed_at: new Date().toISOString(),
                metadata: {
                    author: document.metadata?.author,
                    publication_date: document.metadata?.publication_date
                }
            });
        }

        // Bulk create chunks
        await base44.asServiceRole.entities.DocumentChunk.bulkCreate(documentChunks);

        // Update document to mark as indexed
        await base44.asServiceRole.entities.Document.update(document.id, {
            metadata: {
                ...document.metadata,
                indexed: true,
                chunk_count: documentChunks.length,
                indexed_at: new Date().toISOString()
            }
        });

        return Response.json({
            success: true,
            document_id: document.id,
            chunks_created: documentChunks.length,
            total_tokens: documentChunks.reduce((sum, c) => sum + c.token_count, 0)
        });

    } catch (error) {
        console.error('Error ingesting document:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});