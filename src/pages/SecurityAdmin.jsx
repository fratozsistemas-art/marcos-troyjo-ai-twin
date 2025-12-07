import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import SecurityDashboard from '@/components/admin/SecurityDashboard';

export default function SecurityAdmin() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const user = await base44.auth.me();
            setIsAdmin(user.role === 'admin');
        } catch (error) {
            console.error('Error checking admin access:', error);
        } finally {
            setLoading(false);
        }
    };

    const t = {
        pt: {
            title: 'Administração de Segurança',
            subtitle: 'Monitoramento e proteção de propriedade intelectual',
            back: 'Voltar',
            unauthorized: 'Acesso não autorizado',
            unauthorizedDesc: 'Você precisa de privilégios de administrador para acessar esta página.'
        },
        en: {
            title: 'Security Administration',
            subtitle: 'IP monitoring and protection',
            back: 'Back',
            unauthorized: 'Unauthorized Access',
            unauthorizedDesc: 'You need administrator privileges to access this page.'
        }
    }[lang];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-[#002D62] mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.unauthorized}</h1>
                    <p className="text-gray-600 mb-6">{t.unauthorizedDesc}</p>
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t.back}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{t.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{t.subtitle}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <SecurityDashboard lang={lang} />
            </main>
        </div>
    );
}