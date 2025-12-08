import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function PermissionGate({ resource, action, children, fallback = null }) {
    const [hasPermission, setHasPermission] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkPermission();
    }, [resource, action]);

    const checkPermission = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('checkPermissions', {
                resource,
                action
            });
            setHasPermission(response.data.allowed);
        } catch (error) {
            console.error('Error checking permission:', error);
            setHasPermission(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (!hasPermission) return fallback;
    return children;
}

export function usePermissions() {
    const [permissions, setPermissions] = useState(null);
    const [roleType, setRoleType] = useState(null);
    const [specialPrivileges, setSpecialPrivileges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('checkPermissions', {
                resource: 'articles',
                action: 'read'
            });
            setPermissions(response.data.all_permissions);
            setRoleType(response.data.role_type);
            setSpecialPrivileges(response.data.special_privileges);
        } catch (error) {
            console.error('Error loading permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const can = (resource, action) => {
        return permissions?.[resource]?.[action] === true;
    };

    const hasPrivilege = (privilege) => {
        return specialPrivileges.includes(privilege);
    };

    return { permissions, roleType, specialPrivileges, can, hasPrivilege, loading };
}