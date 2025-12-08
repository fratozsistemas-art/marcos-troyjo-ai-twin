import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_id, approved, custom_name } = await req.json();
        
        if (!conversation_id) {
            return Response.json({ error: 'conversation_id is required' }, { status: 400 });
        }

        // Get conversation
        const conversation = await base44.agents.getConversation(conversation_id);
        
        if (!conversation?.metadata?.pending_rename) {
            return Response.json({ error: 'No pending rename found' }, { status: 400 });
        }

        const pendingRename = conversation.metadata.pending_rename;
        
        // Update conversation based on user decision
        if (approved) {
            const newName = custom_name || pendingRename.suggested_name;
            
            await base44.agents.updateConversation(conversation_id, {
                metadata: {
                    ...conversation.metadata,
                    name: newName,
                    pending_rename: null,
                    rename_history: [
                        ...(conversation.metadata.rename_history || []),
                        {
                            old_name: conversation.metadata.name,
                            new_name: newName,
                            suggested_name: pendingRename.suggested_name,
                            approved: true,
                            custom_name: custom_name ? true : false,
                            applied_at: new Date().toISOString(),
                            applied_by: user.email
                        }
                    ]
                }
            });

            return Response.json({
                success: true,
                new_name: newName,
                message: 'Rename applied successfully'
            });
        } else {
            // User rejected the rename
            await base44.agents.updateConversation(conversation_id, {
                metadata: {
                    ...conversation.metadata,
                    pending_rename: null,
                    rename_history: [
                        ...(conversation.metadata.rename_history || []),
                        {
                            suggested_name: pendingRename.suggested_name,
                            approved: false,
                            rejected_at: new Date().toISOString(),
                            rejected_by: user.email
                        }
                    ]
                }
            });

            return Response.json({
                success: true,
                message: 'Rename rejected'
            });
        }

    } catch (error) {
        console.error('Error applying conversation rename:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});