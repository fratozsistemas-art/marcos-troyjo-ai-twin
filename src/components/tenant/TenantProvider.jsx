import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTenant();
    }, []);

    const loadTenant = async () => {
        setLoading(true);
        try {
            // Por enquanto, usar Troyjo como padrão
            // No futuro: detectar via subdomain ou path parameter
            const thoughtLeaders = await base44.entities.ThoughtLeader.filter({ 
                slug: 'troyjo',
                active: true 
            });

            if (thoughtLeaders.length > 0) {
                const tl = thoughtLeaders[0];
                const configs = await base44.entities.TenantConfiguration.filter({
                    thought_leader_id: tl.id
                });

                setTenant({
                    thoughtLeader: tl,
                    config: configs[0] || {},
                    branding: tl.branding || {
                        primary_color: '#002D62',
                        secondary_color: '#00654A',
                        accent_color: '#D4AF37',
                        highlight_color: '#8B1538'
                    }
                });
            }
        } catch (error) {
            console.error('Error loading tenant:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#002D62] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <TenantContext.Provider value={{ tenant, loading }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
}