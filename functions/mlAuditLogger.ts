// This is a utility export for client-side audit logging
// Import this in your components to log user actions

export const logMLAction = async (base44, action_type, resource_type, resource_id = null, resource_name = null, action_details = null, status = 'success', error_message = null) => {
    try {
        await base44.functions.invoke('logMLAction', {
            action_type,
            resource_type,
            resource_id,
            resource_name,
            action_details,
            status,
            error_message
        });
    } catch (error) {
        console.error('Failed to log ML action:', error);
    }
};