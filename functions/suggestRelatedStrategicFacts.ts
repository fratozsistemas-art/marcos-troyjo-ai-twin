import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fact_id } = await req.json();

        if (!fact_id) {
            return Response.json({ error: 'fact_id is required' }, { status: 400 });
        }

        // Get the source fact
        const sourceFacts = await base44.entities.StrategicFact.filter({ fact_id });
        if (sourceFacts.length === 0) {
            return Response.json({ error: 'Fact not found' }, { status: 404 });
        }
        const sourceFact = sourceFacts[0];

        // Get all other facts
        const allFacts = await base44.entities.StrategicFact.list();
        const otherFacts = allFacts.filter(f => f.fact_id !== fact_id);

        // Step 1: Find facts with matching topic_id or tags
        const topicMatches = otherFacts.filter(f => 
            f.topic_id === sourceFact.topic_id
        );

        const tagMatches = otherFacts.filter(f => {
            const sourceTags = sourceFact.tags || [];
            const targetTags = f.tags || [];
            return sourceTags.some(tag => targetTags.includes(tag));
        });

        // Combine and deduplicate
        const directMatches = [...new Map(
            [...topicMatches, ...tagMatches].map(f => [f.fact_id, f])
        ).values()];

        // Step 2: Use AI to find semantic similarities
        const semanticPrompt = `Analyze the following strategic fact and identify which of the candidate facts are most semantically related:

SOURCE FACT:
Topic: ${sourceFact.topic_label}
Summary: ${sourceFact.summary}
Detail: ${sourceFact.detail}
Tags: ${(sourceFact.tags || []).join(', ')}

CANDIDATE FACTS:
${otherFacts.slice(0, 50).map((f, idx) => `
${idx + 1}. [${f.fact_id}]
   Topic: ${f.topic_label}
   Summary: ${f.summary}
   Tags: ${(f.tags || []).join(', ')}
`).join('\n')}

Return a JSON array of fact_ids that are semantically related to the source fact, ordered by relevance (most relevant first). Include only facts that have meaningful conceptual connections. Limit to top 10.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: semanticPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    related_fact_ids: {
                        type: "array",
                        items: { type: "string" }
                    },
                    reasoning: {
                        type: "string"
                    }
                }
            }
        });

        const semanticMatches = aiResponse.related_fact_ids || [];

        // Step 3: Combine results and score
        const suggestions = [];
        const processedIds = new Set();

        // Add direct matches with high scores
        directMatches.forEach(fact => {
            if (!processedIds.has(fact.fact_id)) {
                suggestions.push({
                    ...fact,
                    relevance_score: 0.9,
                    match_reason: 'Same topic or shared tags'
                });
                processedIds.add(fact.fact_id);
            }
        });

        // Add semantic matches
        semanticMatches.forEach((factId, index) => {
            if (!processedIds.has(factId)) {
                const fact = otherFacts.find(f => f.fact_id === factId);
                if (fact) {
                    suggestions.push({
                        ...fact,
                        relevance_score: 0.8 - (index * 0.05),
                        match_reason: 'Semantic similarity (AI detected)'
                    });
                    processedIds.add(factId);
                }
            }
        });

        // Sort by relevance score
        suggestions.sort((a, b) => b.relevance_score - a.relevance_score);

        return Response.json({
            source_fact_id: fact_id,
            suggestions: suggestions.slice(0, 15),
            ai_reasoning: aiResponse.reasoning
        });

    } catch (error) {
        console.error('Error suggesting related facts:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});