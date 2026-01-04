import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit } from './utils/rateLimiter';
import { logger } from './utils/logger';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rateCheck = checkRateLimit(user.email, 'uploads');
        if (!rateCheck.allowed) {
            return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const { file_url, import_type = 'article' } = await req.json();

        if (!file_url) {
            return Response.json({ error: 'file_url required' }, { status: 400 });
        }

        logger.info('Processing PDF to knowledge', { user: user.email, file_url });

        // Use InvokeLLM with file_urls to extract structured content
        const extractionPrompt = import_type === 'study_module' 
            ? `Analyze this educational document and extract:
- Title and description
- Main topics covered
- Key concepts and lessons
- Estimated reading/study time
- Difficulty level (beginner/intermediate/advanced)
- Content organized into logical sections with titles and summaries

Output a structured JSON with this information.`
            : `Analyze this document and extract:
- Title and author (if available)
- Main topics and themes
- Key insights and takeaways
- Summary of content
- Tags and keywords
- Publication date if mentioned

Output a structured JSON with this information.`;

        const extraction = await base44.integrations.Core.InvokeLLM({
            prompt: extractionPrompt,
            file_urls: [file_url],
            response_json_schema: {
                type: "object",
                properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    author: { type: "string" },
                    category: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    difficulty_level: { type: "string" },
                    estimated_duration_minutes: { type: "integer" },
                    sections: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                content: { type: "string" },
                                order: { type: "integer" }
                            }
                        }
                    },
                    key_insights: { type: "array", items: { type: "string" } }
                }
            }
        });

        logger.info('Extraction complete', { title: extraction.title });

        // Create appropriate entity based on import type
        let created;
        
        if (import_type === 'study_module') {
            created = await base44.entities.StudyModule.create({
                title: extraction.title,
                slug: extraction.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: extraction.description,
                category: extraction.category || 'innovation',
                difficulty_level: extraction.difficulty_level || 'intermediate',
                estimated_duration_minutes: extraction.estimated_duration_minutes || 60,
                content_sections: extraction.sections || [],
                active: true
            });
        } else if (import_type === 'document') {
            created = await base44.entities.Document.create({
                title: extraction.title,
                author: extraction.author || 'Unknown',
                file_url: file_url,
                file_type: 'pdf',
                category: extraction.category || 'other',
                description: extraction.description,
                tags: extraction.tags || [],
                ai_summary: extraction.key_insights?.join('\n\n') || extraction.description
            });
        } else {
            // Create as Article
            created = await base44.entities.Article.create({
                title: extraction.title,
                author: extraction.author || user.full_name,
                content: extraction.sections?.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n') || extraction.description,
                summary: extraction.description,
                tags: extraction.tags || [],
                category: extraction.category || 'technology',
                status: 'draft',
                quality_tier: 'ai_generated',
                approval_status: 'pendente'
            });
        }

        logger.audit('PDF imported to knowledge base', user, { 
            entityId: created.id, 
            type: import_type,
            title: extraction.title 
        });

        return Response.json({ 
            success: true, 
            entity: created,
            extraction_summary: {
                title: extraction.title,
                sections_count: extraction.sections?.length || 0,
                tags: extraction.tags
            }
        });

    } catch (error) {
        logger.error('Error processing PDF', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});