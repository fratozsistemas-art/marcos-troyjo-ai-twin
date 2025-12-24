import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { user_email } = await req.json();

        if (!user_email) {
            return Response.json({ error: 'user_email is required' }, { status: 400 });
        }

        // Get user's activity over the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const activities = await base44.asServiceRole.entities.UserActivity.filter({
            user_email,
        });

        const recentActivities = activities.filter(
            a => new Date(a.created_date) > thirtyDaysAgo
        );

        // Count activities by type
        const activityCounts = {};
        recentActivities.forEach(activity => {
            activityCounts[activity.activity_type] = (activityCounts[activity.activity_type] || 0) + 1;
        });

        // Get available roles
        const roles = await base44.asServiceRole.entities.FactRole.filter({ active: true });

        // Get existing assignments
        const existingAssignments = await base44.asServiceRole.entities.UserRoleAssignment.filter({
            user_email
        });

        const assignedRoleNames = existingAssignments.map(a => a.role_name);

        // AI analysis
        const analysisPrompt = `Analyze the following user activity data and suggest the most appropriate role assignment. Consider the existing RBAC system with these roles:

AVAILABLE ROLES:
${roles.map(r => `
- ${r.role_name} (${r.display_name}):
  ${r.description}
  Permissions: ${Object.entries(r.permissions || {}).filter(([_, v]) => v).map(([k]) => k).join(', ')}
`).join('\n')}

USER ACTIVITY (Last 30 Days):
Total Activities: ${recentActivities.length}
Activity Breakdown:
${Object.entries(activityCounts).map(([type, count]) => `  - ${type}: ${count} times`).join('\n')}

CURRENT ROLE ASSIGNMENTS:
${assignedRoleNames.length > 0 ? assignedRoleNames.join(', ') : 'None'}

Based on the activity patterns, suggest the most appropriate role for this user. Consider:
1. Frequency and types of activities performed
2. Whether they're already assigned roles
3. Natural progression path (viewer -> editor -> validator -> admin)
4. Whether their behavior matches the role requirements

If user has minimal activity or already has an appropriate role, suggest no change.
If suggesting a new role, provide strong reasoning based on their actual behavior patterns.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    should_suggest: {
                        type: "boolean",
                        description: "Whether to suggest a role change"
                    },
                    suggested_role_name: {
                        type: "string",
                        description: "The suggested role name"
                    },
                    confidence: {
                        type: "number",
                        description: "Confidence score 0-1"
                    },
                    reasoning: {
                        type: "string",
                        description: "Detailed reasoning for this suggestion"
                    },
                    key_activities: {
                        type: "array",
                        items: { type: "string" },
                        description: "Key activities that support this suggestion"
                    }
                }
            }
        });

        if (!aiResponse.should_suggest) {
            return Response.json({
                suggestion_created: false,
                reason: aiResponse.reasoning
            });
        }

        // Find the suggested role
        const suggestedRole = roles.find(r => r.role_name === aiResponse.suggested_role_name);
        if (!suggestedRole) {
            return Response.json({ error: 'Suggested role not found' }, { status: 404 });
        }

        // Check if suggestion already exists
        const existingSuggestions = await base44.asServiceRole.entities.RoleSuggestion.filter({
            user_email,
            suggested_role_id: suggestedRole.id,
            status: 'pending'
        });

        if (existingSuggestions.length > 0) {
            return Response.json({
                suggestion_created: false,
                reason: 'Suggestion already exists for this user and role'
            });
        }

        // Create suggestion
        const suggestion = await base44.asServiceRole.entities.RoleSuggestion.create({
            user_email,
            suggested_role_id: suggestedRole.id,
            suggested_role_name: suggestedRole.role_name,
            confidence_score: aiResponse.confidence,
            reasoning: aiResponse.reasoning,
            activity_summary: {
                total_activities: recentActivities.length,
                activity_counts: activityCounts,
                key_activities: aiResponse.key_activities,
                analysis_date: new Date().toISOString()
            },
            status: 'pending'
        });

        return Response.json({
            suggestion_created: true,
            suggestion
        });

    } catch (error) {
        console.error('Error analyzing user:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});