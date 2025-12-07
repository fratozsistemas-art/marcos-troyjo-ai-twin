import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

export async function logAccess(req, action, resourceType, resourceId, metadata = {}) {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        // Get IP and user agent
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        
        await base44.asServiceRole.entities.AccessLog.create({
            user_email: user?.email || 'anonymous',
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            ip_address: ip,
            user_agent: userAgent,
            metadata,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to log access:', error);
    }
}

export async function checkPermission(base44, user, action, resourceType) {
    // Admin bypass
    if (user.role === 'admin') return true;
    
    // Define permission matrix
    const permissions = {
        'user': {
            'document': ['read', 'create'],
            'conversation': ['read', 'create', 'update', 'delete'],
            'profile': ['read', 'update']
        },
        'admin': {
            'document': ['read', 'create', 'update', 'delete'],
            'conversation': ['read', 'create', 'update', 'delete'],
            'profile': ['read', 'create', 'update', 'delete'],
            'user': ['read', 'create', 'update', 'delete']
        }
    };
    
    const userPermissions = permissions[user.role] || permissions['user'];
    const resourcePermissions = userPermissions[resourceType] || [];
    
    return resourcePermissions.includes(action);
}