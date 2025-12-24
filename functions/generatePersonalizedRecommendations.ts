import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's recent interactions (last 90 days)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const interactions = await base44.asServiceRole.entities.UserInteraction.filter({
            user_email: user.email
        });

        const recentInteractions = interactions.filter(
            i => new Date(i.created_date) > ninetyDaysAgo
        );

        // Count interactions by content type
        const contentTypeCounts = {};
        const viewedContent = {};

        recentInteractions.forEach(interaction => {
            contentTypeCounts[interaction.content_type] = (contentTypeCounts[interaction.content_type] || 0) + 1;
            
            if (!viewedContent[interaction.content_type]) {
                viewedContent[interaction.content_type] = [];
            }
            if (!viewedContent[interaction.content_type].includes(interaction.content_id)) {
                viewedContent[interaction.content_type].push(interaction.content_id);
            }
        });

        // Get all available content
        const [books, publications, neologisms, concepts] = await Promise.all([
            base44.asServiceRole.entities.Book.list(),
            base44.asServiceRole.entities.Publication.list(),
            base44.asServiceRole.entities.Vocabulary.list(),
            base44.asServiceRole.entities.ConceptEvolution.list()
        ]);

        // AI-powered recommendation analysis
        const analysisPrompt = `Analyze user behavior and generate personalized recommendations.

USER INTERACTION PROFILE:
Total Interactions: ${recentInteractions.length}
Content Type Breakdown:
${Object.entries(contentTypeCounts).map(([type, count]) => `  - ${type}: ${count} interactions`).join('\n')}

Viewed Content IDs by Type:
${Object.entries(viewedContent).map(([type, ids]) => `  - ${type}: ${ids.slice(0, 5).join(', ')}`).join('\n')}

AVAILABLE CONTENT:
Books: ${books.length} (IDs: ${books.slice(0, 10).map(b => b.id).join(', ')})
Publications: ${publications.length} (IDs: ${publications.slice(0, 10).map(p => p.id).join(', ')})
Neologisms: ${neologisms.length} (IDs: ${neologisms.slice(0, 10).map(n => n.id).join(', ')})
Concepts: ${concepts.length} (IDs: ${concepts.slice(0, 10).map(c => c.id).join(', ')})

Based on the user's interaction pattern, recommend:
1. 3-5 books they might be interested in (exclude already viewed)
2. 3-5 publications/articles they should read
3. 2-3 neologisms or concepts to explore
4. Overall learning path or thematic focus

Consider:
- User's most engaged content types
- Natural progression in complexity
- Related topics and themes
- Diversity in recommendations`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    recommended_books: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                content_id: { type: "string" },
                                reason: { type: "string" },
                                relevance_score: { type: "number" }
                            }
                        }
                    },
                    recommended_publications: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                content_id: { type: "string" },
                                reason: { type: "string" },
                                relevance_score: { type: "number" }
                            }
                        }
                    },
                    recommended_concepts: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                content_id: { type: "string" },
                                reason: { type: "string" },
                                relevance_score: { type: "number" }
                            }
                        }
                    },
                    learning_path: {
                        type: "string",
                        description: "Suggested learning path"
                    },
                    thematic_focus: {
                        type: "array",
                        items: { type: "string" },
                        description: "Main themes user is interested in"
                    }
                }
            }
        });

        // Enrich recommendations with actual content data
        const enrichedBooks = aiResponse.recommended_books?.map(rec => {
            const book = books.find(b => b.id === rec.content_id);
            return book ? { ...rec, content: book } : null;
        }).filter(Boolean) || [];

        const enrichedPublications = aiResponse.recommended_publications?.map(rec => {
            const pub = publications.find(p => p.id === rec.content_id);
            return pub ? { ...rec, content: pub } : null;
        }).filter(Boolean) || [];

        const enrichedConcepts = aiResponse.recommended_concepts?.map(rec => {
            const concept = [...neologisms, ...concepts].find(c => c.id === rec.content_id);
            return concept ? { ...rec, content: concept } : null;
        }).filter(Boolean) || [];

        return Response.json({
            recommendations: {
                books: enrichedBooks,
                publications: enrichedPublications,
                concepts: enrichedConcepts
            },
            learning_path: aiResponse.learning_path,
            thematic_focus: aiResponse.thematic_focus,
            interaction_summary: {
                total_interactions: recentInteractions.length,
                content_type_breakdown: contentTypeCounts
            }
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});