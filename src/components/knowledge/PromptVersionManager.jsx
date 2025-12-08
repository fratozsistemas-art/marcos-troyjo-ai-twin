import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shield, Code, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PromptVersionManager({ lang = 'pt' }) {
    const [versions, setVersions] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const user = await base44.auth.me();
            if (user.role === 'admin') {
                setIsAdmin(true);
                loadVersions();
            }
        } catch (error) {
            console.error('Error checking admin access:', error);
        }
    };

    const loadVersions = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.PromptVersion.list('-created_date', 50);
            setVersions(data);
        } catch (error) {
            console.error('Error loading versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (versionId) => {
        try {
            // Deactivate all others
            const activeVersions = versions.filter(v => v.status === 'active');
            for (const v of activeVersions) {
                await base44.entities.PromptVersion.update(v.id, { status: 'deprecated' });
            }

            // Activate this one
            await base44.entities.PromptVersion.update(versionId, {
                status: 'active',
                activated_at: new Date().toISOString()
            });

            toast.success(lang === 'pt' ? 'Versão ativada!' : 'Version activated!');
            loadVersions();
        } catch (error) {
            console.error('Error activating version:', error);
            toast.error('Error');
        }
    };

    if (!isAdmin) {
        return (
            <Card>
                <CardContent className="py-8 text-center">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                        {lang === 'pt' ? 'Acesso restrito a administradores' : 'Access restricted to administrators'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const t = {
        pt: {
            title: 'Versões de Prompt',
            activate: 'Ativar',
            active: 'Ativa',
            testing: 'Em Teste',
            deprecated: 'Obsoleta'
        },
        en: {
            title: 'Prompt Versions',
            activate: 'Activate',
            active: 'Active',
            testing: 'Testing',
            deprecated: 'Deprecated'
        }
    };

    const text = t[lang];

    const statusConfig = {
        active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
        testing: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
        deprecated: { color: 'bg-gray-100 text-gray-800', icon: Code }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        {text.title}
                        <Badge className="ml-2 bg-red-600">Admin Only</Badge>
                    </CardTitle>
                </CardHeader>
            </Card>

            {versions.map((version) => {
                const config = statusConfig[version.status];
                const Icon = config.icon;
                
                return (
                    <Card key={version.id}>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-[#002D62] mb-1">{version.version}</h4>
                                    <Badge className={config.color}>
                                        <Icon className="w-3 h-3 mr-1" />
                                        {text[version.status]}
                                    </Badge>
                                </div>
                                {version.status !== 'active' && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleActivate(version.id)}
                                        className="bg-[#002D62]"
                                    >
                                        {text.activate}
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm text-[#333F48] mb-3">{version.changes}</p>
                            <details className="text-xs">
                                <summary className="cursor-pointer text-[#333F48]/60 mb-2">
                                    {lang === 'pt' ? 'Ver prompt completo' : 'View full prompt'}
                                </summary>
                                <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-64 text-[#333F48]">
                                    {version.prompt_content}
                                </pre>
                            </details>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}