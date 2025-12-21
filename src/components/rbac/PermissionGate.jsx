import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function PermissionGate({ permission, children, fallback = null }) {
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkPermission();
    }, [permission]);

    const checkPermission = async () => {
        try {
            const response = await base44.functions.invoke('checkPermissions', {
                permission_key: permission
            });

            setHasPermission(response.data.authorized);
        } catch (error) {
            console.error('Error checking permission:', error);
            setHasPermission(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return null;
    }

    if (!hasPermission) {
        return fallback;
    }

    return <>{children}</>;
}

export function usePermissions() {
    const [permissions, setPermissions] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        try {
            const user = await base44.auth.me();
            const roles = await base44.entities.Role.filter({
                user_email: user.email,
                is_active: true
            });

            if (roles.length > 0) {
                setRole(roles[0].role_type);
                setPermissions(roles[0].permissions);
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasPermission = (permissionKey) => {
        if (!permissions) return false;
        const [module, perm] = permissionKey.split('.');
        return permissions?.[module]?.[perm] === true;
    };

    return { permissions, role, loading, hasPermission };
}