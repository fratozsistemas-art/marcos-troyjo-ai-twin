import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { source_fact_id, target_fact_id, action } = await req.json();

        if (!source_fact_id || !target_fact_id || !action) {
            return Response.json({ 
                error: 'source_fact_id, target_fact_id, and action are required' 
            }, { status: 400 });
        }

        if (!['add', 'remove'].includes(action)) {
            return Response.json({ 
                error: 'action must be "add" or "remove"' 
            }, { status: 400 });
        }

        // Get source fact
        const sourceFacts = await base44.entities.StrategicFact.filter({ fact_id: source_fact_id });
        if (sourceFacts.length === 0) {
            return Response.json({ error: 'Source fact not found' }, { status: 404 });
        }
        const sourceFact = sourceFacts[0];

        // Get target fact (to verify it exists)
        const targetFacts = await base44.entities.StrategicFact.filter({ fact_id: target_fact_id });
        if (targetFacts.length === 0) {
            return Response.json({ error: 'Target fact not found' }, { status: 404 });
        }
        const targetFact = targetFacts[0];

        // Update related_fact_ids
        let relatedIds = sourceFact.related_fact_ids || [];

        if (action === 'add') {
            if (!relatedIds.includes(target_fact_id)) {
                relatedIds.push(target_fact_id);
            }
        } else if (action === 'remove') {
            relatedIds = relatedIds.filter(id => id !== target_fact_id);
        }

        // Update the source fact
        await base44.entities.StrategicFact.update(sourceFact.id, {
            related_fact_ids: relatedIds
        });

        // Optionally create bidirectional link
        let targetRelatedIds = targetFact.related_fact_ids || [];
        if (action === 'add' && !targetRelatedIds.includes(source_fact_id)) {
            targetRelatedIds.push(source_fact_id);
            await base44.entities.StrategicFact.update(targetFact.id, {
                related_fact_ids: targetRelatedIds
            });
        } else if (action === 'remove') {
            targetRelatedIds = targetRelatedIds.filter(id => id !== source_fact_id);
            await base44.entities.StrategicFact.update(targetFact.id, {
                related_fact_ids: targetRelatedIds
            });
        }

        return Response.json({
            success: true,
            action,
            source_fact_id,
            target_fact_id,
            updated_related_ids: relatedIds
        });

    } catch (error) {
        console.error('Error linking facts:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});