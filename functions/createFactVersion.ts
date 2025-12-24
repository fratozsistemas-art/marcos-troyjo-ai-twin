import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fact_id, old_snapshot, new_snapshot, change_reason } = await req.json();

        if (!fact_id || !new_snapshot) {
            return Response.json({ error: 'fact_id and new_snapshot are required' }, { status: 400 });
        }

        // Calculate changes
        const changes = calculateDiff(old_snapshot || {}, new_snapshot);

        // Get current version count
        const existingVersions = await base44.asServiceRole.entities.StrategicFactHistory.filter({ fact_id });
        const versionNumber = existingVersions.length + 1;

        // Create version history entry
        const historyEntry = await base44.asServiceRole.entities.StrategicFactHistory.create({
            fact_id,
            version: `${versionNumber}.0`,
            snapshot: new_snapshot,
            changes,
            changed_by: user.email,
            change_reason: change_reason || 'Updated'
        });

        return Response.json({
            success: true,
            version: historyEntry.version,
            history_id: historyEntry.id
        });

    } catch (error) {
        console.error('Error creating version:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateDiff(oldData, newData) {
    const changes = {
        added: {},
        modified: {},
        removed: {}
    };

    // Check for new or modified fields
    for (const key in newData) {
        if (!(key in oldData)) {
            changes.added[key] = newData[key];
        } else if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            changes.modified[key] = {
                old: oldData[key],
                new: newData[key]
            };
        }
    }

    // Check for removed fields
    for (const key in oldData) {
        if (!(key in newData)) {
            changes.removed[key] = oldData[key];
        }
    }

    return changes;
}