import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { checkRateLimit } from './utils/rateLimiter.js';
import { validateString, validateArray } from './utils/inputValidator.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const rateCheck = checkRateLimit(user.email, 'suggestCollections');
        if (!rateCheck.allowed) {
            return Response.json({ 
                error: 'Rate limit exceeded',
                retryAfter: rateCheck.retryAfter 
            }, { status: 429 });
        }

        const body = await req.json();

        // Input validation
        const title = validateString(body.title, { maxLength: 500, paramName: 'title' });
        const tags = validateArray(body.tags || [], { maxLength: 50 });
        const contentType = body.content_type || 'article';
        const description = body.description ? validateString(body.description, { maxLength: 2000 }) : '';

        // Fetch user's existing collections
        const collections = await base44.entities.ContentCollection.filter({
            owner_email: user.email
        });

        if (collections.length === 0) {
            return Response.json({
                success: true,
                suggested_collections: [],
                message: 'No collections available for suggestions'
            });
        }

        // Build collection context for LLM
        const collectionContext = collections.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description || '',
            type: c.collection_type,
            tags: c.tags || [],
            item_count: c.content_items?.length || 0
        }));

        const suggestionPrompt = `You are an expert content curator specializing in organizing geopolitical and economic content.

A user has created the following ${contentType}:

Title: ${title}
${description ? `Description: ${description}` : ''}
Tags: ${tags.join(', ')}

The user has the following existing collections:

${collectionContext.map((c, idx) => 
    `${idx + 1}. "${c.name}" (${c.type})
   - Description: ${c.description}
   - Tags: ${c.tags.join(', ') || 'none'}
   - Items: ${c.item_count}`
).join('\n\n')}

Task: Suggest which existing collections this content would fit well into.

Criteria:
1. Match based on topic, tags, and thematic alignment
2. Consider collection purpose and type
3. Prioritize collections with related tags
4. A content item can fit into multiple collections
5. Only suggest collections where the fit is strong (confidence > 0.6)

Return your suggestions as JSON with:
- collection_id
- collection_name
- confidence (0-1)
- reasoning (brief explanation of why it fits)

Order by confidence (highest first). Maximum 5 suggestions.`;

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: suggestionPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    suggestions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                collection_id: { type: "string" },
                                collection_name: { type: "string" },
                                confidence: { type: "number" },
                                reasoning: { type: "string" }
                            }
                        }
                    },
                    overall_assessment: {
                        type: "string",
                        description: "Brief assessment of content organization opportunities"
                    }
                }
            }
        });

        const suggestions = llmResponse.suggestions || [];

        // Enrich suggestions with collection data
        const enrichedSuggestions = suggestions.map(s => {
            const collection = collections.find(c => c.id === s.collection_id);
            return {
                ...s,
                collection_type: collection?.collection_type,
                collection_color: collection?.color,
                current_item_count: collection?.content_items?.length || 0
            };
        });

        return Response.json({
            success: true,
            suggested_collections: enrichedSuggestions,
            overall_assessment: llmResponse.overall_assessment,
            total_collections_analyzed: collections.length,
            metadata: {
                analyzed_at: new Date().toISOString(),
                content_type: contentType
            }
        });

    } catch (error) {
        console.error('Error suggesting collections:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});