import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Logs de Deployment',
        description: 'Histórico detalhado de deployment',
        refresh: 'Atualizar',
        download: 'Baixar',
        loading: 'Carregando logs...',
        noLogs: 'Nenhum log disponível',
        timestamp: 'Timestamp',
        status: 'Status'
    },
    en: {
        title: 'Deployment Logs',
        description: 'Detailed deployment history',
        refresh: 'Refresh',
        download: 'Download',
        loading: 'Loading logs...',
        noLogs: 'No logs available',
        timestamp: 'Timestamp',
        status: 'Status'
    }
};

export default function DeploymentLogsDialog({ open, onOpenChange, siteId, lang = 'pt' }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const t = translations[lang];

    useEffect(() => {
        if (open && siteId) {
            loadLogs();
        }
    }, [open, siteId]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('flywheelManager', {
                action: 'getDeploymentLogs',
                siteId
            });

            if (response.data.success) {
                setLogs(response.data.data.logs || []);
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error loading logs:', error);
            toast.error('Erro ao carregar logs');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadLogs = () => {
        const logText = logs.map(log => 
            `[${log.timestamp}] ${log.level}: ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deployment-logs-${siteId}-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Logs baixados com sucesso!');
    };

    const getLogLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'warning':
                return 'bg-amber-100 text-amber-800';
            case 'info':
                return 'bg-blue-100 text-blue-800';
            case 'success':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle>{t.title}</DialogTitle>
                            <DialogDescription>{t.description}</DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleDownloadLogs} disabled={logs.length === 0}>
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                        <span className="ml-2 text-sm text-gray-600">{t.loading}</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {t.noLogs}
                    </div>
                ) : (
                    <ScrollArea className="h-[500px] rounded-md border p-4">
                        <div className="space-y-2">
                            {logs.map((log, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50">
                                    <Badge className={getLogLevelColor(log.level)}>
                                        {log.level}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 break-words">{log.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}