import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { entities, filters = [], fields } = await req.json();

        if (!entities || !Array.isArray(entities) || entities.length === 0) {
            return Response.json({ error: 'No entities selected' }, { status: 400 });
        }

        const reportData = {};

        // Fetch Forums
        if (entities.includes('Forum')) {
            const forums = await base44.entities.Forum.filter({ active: true });
            reportData.Forum = forums.map(forum => {
                const selected = {};
                fields.Forum.forEach(field => {
                    if (field === 'members' && Array.isArray(forum[field])) {
                        selected[field] = forum[field];
                    } else if (field === 'key_themes' && Array.isArray(forum[field])) {
                        selected[field] = forum[field];
                    } else {
                        selected[field] = forum[field] || '';
                    }
                });
                return selected;
            });
        }

        // Fetch Events
        if (entities.includes('Event')) {
            let eventQuery = { active: true };
            
            // Apply advanced filters
            if (Array.isArray(filters)) {
                filters.filter(f => f.entity === 'Event' && f.field && f.value).forEach(filter => {
                    const { field, operator, value } = filter;
                    if (operator === 'eq') eventQuery[field] = value;
                    else if (operator === 'ne') eventQuery[field] = { $ne: value };
                    else if (operator === 'gt') eventQuery[field] = { $gt: value };
                    else if (operator === 'gte') eventQuery[field] = { $gte: value };
                    else if (operator === 'lt') eventQuery[field] = { $lt: value };
                    else if (operator === 'lte') eventQuery[field] = { $lte: value };
                    else if (operator === 'contains') eventQuery[field] = { $regex: value, $options: 'i' };
                });
            }

            const events = await base44.entities.Event.filter(eventQuery);
            reportData.Event = events.map(event => {
                const selected = {};
                fields.Event.forEach(field => {
                    if (field === 'location' && typeof event[field] === 'object') {
                        selected[field] = `${event[field].city || ''}, ${event[field].country || ''}`;
                    } else if (field === 'key_themes' && Array.isArray(event[field])) {
                        selected[field] = event[field];
                    } else {
                        selected[field] = event[field] || '';
                    }
                });
                return selected;
            });
        }

        // Fetch Key Actors
        if (entities.includes('KeyActor')) {
            let actorQuery = { active: true };
            
            // Apply advanced filters
            if (Array.isArray(filters)) {
                filters.filter(f => f.entity === 'KeyActor' && f.field && f.value).forEach(filter => {
                    const { field, operator, value } = filter;
                    if (operator === 'eq') actorQuery[field] = value;
                    else if (operator === 'ne') actorQuery[field] = { $ne: value };
                    else if (operator === 'contains') actorQuery[field] = { $regex: value, $options: 'i' };
                });
            }

            const actors = await base44.entities.KeyActor.filter(actorQuery);
            reportData.KeyActor = actors.map(actor => {
                const selected = {};
                fields.KeyActor.forEach(field => {
                    if (field === 'areas_of_influence' && Array.isArray(actor[field])) {
                        selected[field] = actor[field];
                    } else if (field === 'key_positions' && Array.isArray(actor[field])) {
                        selected[field] = actor[field];
                    } else {
                        selected[field] = actor[field] || '';
                    }
                });
                return selected;
            });
        }

        // Log report generation
        await base44.entities.AccessLog.create({
            user_email: user.email,
            action: 'generate_ssot_report',
            resource: 'SSOT Report',
            metadata: {
                entities,
                filters,
                record_counts: Object.keys(reportData).reduce((acc, key) => {
                    acc[key] = reportData[key].length;
                    return acc;
                }, {})
            }
        });

        return Response.json({
            success: true,
            data: reportData,
            summary: {
                total_records: Object.values(reportData).reduce((sum, arr) => sum + arr.length, 0),
                entities: Object.keys(reportData)
            }
        });

    } catch (error) {
        console.error('Error generating SSOT report:', error);
        return Response.json({ 
            error: error.message || 'Internal server error',
            details: error.toString()
        }, { status: 500 });
    }
});