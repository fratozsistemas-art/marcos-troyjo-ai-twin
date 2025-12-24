import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';

export default function FactPermissionGuard({ permission, children, fallback, showLoading = true, lang = 'pt' }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const t = {
        pt: {
            checking: 'Verificando permissões...',
            noAccess: 'Você não tem permissão para acessar este recurso.',
            contactAdmin: 'Entre em contato com um administrador se você acredita que deveria ter acesso.'
        },
        en: {
            checking: 'Checking permissions...',
            noAccess: 'You do not have permission to access this resource.',
            contactAdmin: 'Contact an administrator if you believe you should have access.'
        }
    };

    const text = t[lang];

    useEffect(() => {
        checkPermission();
    }, [permission]);

    const checkPermission = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('checkFactPermission', {
                permission
            });
            setHasPermission(response.data.has_permission);
        } catch (error) {
            console.error('Error checking permission:', error);
            setHasPermission(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && showLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                <span className="ml-2 text-sm text-gray-600">{text.checking}</span>
            </div>
        );
    }

    if (!hasPermission) {
        if (fallback) {
            return fallback;
        }

        return (
            <Alert variant="destructive">
                <Shield className="w-4 h-4" />
                <AlertDescription>
                    <p className="font-semibold">{text.noAccess}</p>
                    <p className="text-sm mt-1">{text.contactAdmin}</p>
                </AlertDescription>
            </Alert>
        );
    }

    return <>{children}</>;
}