import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PermissionGuard({ resource, action, children, fallback }) {
    const [authorized, setAuthorized] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkPermission();
    }, [resource, action]);

    const checkPermission = async () => {
        try {
            const response = await base44.functions.invoke('checkMLPermission', {
                resource,
                action
            });

            setAuthorized(response.data.authorized);
        } catch (error) {
            console.error('Error checking permission:', error);
            setAuthorized(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return null;
    }

    if (!authorized) {
        if (fallback) return fallback;
        
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Você não tem permissão para realizar esta ação.
                </AlertDescription>
            </Alert>
        );
    }

    return children;
}