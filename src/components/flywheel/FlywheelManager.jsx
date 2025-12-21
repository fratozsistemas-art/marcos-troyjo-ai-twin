import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Server, Loader2, RefreshCw, Play, Trash2, 
    Plus, Settings, Database, Activity
} from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Gerenciador Flywheel',
        description: 'Gerencie seus sites e deployments',
        loading: 'Carregando...',
        refresh: 'Atualizar',
        addSite: 'Novo Site',
        deploy: 'Deploy',
        delete: 'Excluir',
        backup: 'Backup',
        logs: 'Logs',
        noSites: 'Nenhum site encontrado',
        status: 'Status',
        lastDeploy: 'Último Deploy',
        actions: 'Ações'
    },
    en: {
        title: 'Flywheel Manager',
        description: 'Manage your sites and deployments',
        loading: 'Loading...',
        refresh: 'Refresh',
        addSite: 'New Site',
        deploy: 'Deploy',
        delete: 'Delete',
        backup: 'Backup',
        logs: 'Logs',
        noSites: 'No sites found',
        status: 'Status',
        lastDeploy: 'Last Deploy',
        actions: 'Actions'
    }
};

export default function FlywheelManager({ lang = 'pt' }) {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const t = translations[lang];

    useEffect(() => {
        loadSites();
    }, []);

    const loadSites = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('flywheelManager', {
                action: 'listSites'
            });

            if (response.data.success) {
                setSites(response.data.data.sites || []);
            } else {
                toast.error(response.data.error || 'Erro ao carregar sites');
            }
        } catch (error) {
            console.error('Error loading sites:', error);
            toast.error('Erro ao conectar com Flywheel');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, siteId, data = null) => {
        setActionLoading(`${action}-${siteId}`);
        try {
            const response = await base44.functions.invoke('flywheelManager', {
                action,
                siteId,
                data
            });

            if (response.data.success) {
                toast.success(`${action} executado com sucesso!`);
                if (action === 'deleteSite') {
                    loadSites();
                }
            } else {
                toast.error(response.data.error || `Erro ao executar ${action}`);
            }
        } catch (error) {
            console.error(`Error executing ${action}:`, error);
            toast.error('Erro ao executar ação');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'running':
                return 'bg-green-100 text-green-800';
            case 'deploying':
                return 'bg-blue-100 text-blue-800';
            case 'error':
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Server className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadSites}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {t.refresh}
                        </Button>
                        <Button size="sm" className="bg-[#002D62]">
                            <Plus className="w-4 h-4 mr-2" />
                            {t.addSite}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                        <span className="ml-2 text-sm text-gray-600">{t.loading}</span>
                    </div>
                ) : sites.length === 0 ? (
                    <div className="text-center py-8">
                        <Server className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">{t.noSites}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sites.map((site) => (
                            <div
                                key={site.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold text-[#002D62]">
                                                {site.name || site.domain}
                                            </h4>
                                            <Badge className={getStatusColor(site.status)}>
                                                {site.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            {site.domain && (
                                                <p className="flex items-center gap-1">
                                                    <Activity className="w-3 h-3" />
                                                    {site.domain}
                                                </p>
                                            )}
                                            {site.lastDeploy && (
                                                <p className="text-xs text-gray-500">
                                                    {t.lastDeploy}: {new Date(site.lastDeploy).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction('triggerDeploy', site.id)}
                                            disabled={actionLoading === `triggerDeploy-${site.id}`}
                                        >
                                            {actionLoading === `triggerDeploy-${site.id}` ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-1" />
                                                    {t.deploy}
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction('backupSite', site.id)}
                                            disabled={actionLoading === `backupSite-${site.id}`}
                                        >
                                            {actionLoading === `backupSite-${site.id}` ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Database className="w-4 h-4 mr-1" />
                                                    {t.backup}
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAction('deleteSite', site.id)}
                                            disabled={actionLoading === `deleteSite-${site.id}`}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            {actionLoading === `deleteSite-${site.id}` ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}