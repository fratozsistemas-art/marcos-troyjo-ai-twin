import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, PlayCircle, XCircle, CheckCircle2, Clock, GitCommit } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Pipelines CI/CD',
        description: 'Histórico de builds e deployments',
        refresh: 'Atualizar',
        retry: 'Tentar Novamente',
        cancel: 'Cancelar',
        noPipelines: 'Nenhuma pipeline encontrada',
        status: 'Status',
        duration: 'Duração',
        commit: 'Commit',
        branch: 'Branch',
        triggeredBy: 'Acionado por'
    },
    en: {
        title: 'CI/CD Pipelines',
        description: 'Build and deployment history',
        refresh: 'Refresh',
        retry: 'Retry',
        cancel: 'Cancel',
        noPipelines: 'No pipelines found',
        status: 'Status',
        duration: 'Duration',
        commit: 'Commit',
        branch: 'Branch',
        triggeredBy: 'Triggered by'
    }
};

const statusConfig = {
    pending: { icon: Clock, color: 'bg-gray-100 text-gray-800' },
    running: { icon: Loader2, color: 'bg-blue-100 text-blue-800', spin: true },
    success: { icon: CheckCircle2, color: 'bg-green-100 text-green-800' },
    failed: { icon: XCircle, color: 'bg-red-100 text-red-800' },
    cancelled: { icon: XCircle, color: 'bg-gray-100 text-gray-800' }
};

export default function PipelineViewer({ siteId, lang = 'pt' }) {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const t = translations[lang];

    useEffect(() => {
        if (siteId) {
            loadPipelines();
            const interval = setInterval(loadPipelines, 10000);
            return () => clearInterval(interval);
        }
    }, [siteId]);

    const loadPipelines = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('flywheelCICD', {
                action: 'listPipelines',
                siteId,
                data: { limit: 20 }
            });

            if (response.data.success) {
                setPipelines(response.data.data.pipelines || []);
            }
        } catch (error) {
            console.error('Error loading pipelines:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (pipelineId) => {
        setActionLoading(`retry-${pipelineId}`);
        try {
            const response = await base44.functions.invoke('flywheelCICD', {
                action: 'retryPipeline',
                siteId,
                data: { pipelineId }
            });

            if (response.data.success) {
                toast.success('Pipeline reiniciada!');
                loadPipelines();
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error retrying pipeline:', error);
            toast.error('Erro ao reiniciar pipeline');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (pipelineId) => {
        setActionLoading(`cancel-${pipelineId}`);
        try {
            const response = await base44.functions.invoke('flywheelCICD', {
                action: 'cancelPipeline',
                siteId,
                data: { pipelineId }
            });

            if (response.data.success) {
                toast.success('Pipeline cancelada!');
                loadPipelines();
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error canceling pipeline:', error);
            toast.error('Erro ao cancelar pipeline');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <GitCommit className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadPipelines}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && pipelines.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : pipelines.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {t.noPipelines}
                    </div>
                ) : (
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                            {pipelines.map((pipeline) => {
                                const status = statusConfig[pipeline.status] || statusConfig.pending;
                                const StatusIcon = status.icon;

                                return (
                                    <div
                                        key={pipeline.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={status.color}>
                                                        <StatusIcon className={`w-3 h-3 mr-1 ${status.spin ? 'animate-spin' : ''}`} />
                                                        {pipeline.status}
                                                    </Badge>
                                                    <span className="text-sm font-medium text-[#002D62]">
                                                        #{pipeline.number}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-gray-600 space-y-1">
                                                    {pipeline.commit && (
                                                        <p>
                                                            <strong>{t.commit}:</strong> {pipeline.commit.substring(0, 7)} - {pipeline.commit_message}
                                                        </p>
                                                    )}
                                                    {pipeline.branch && (
                                                        <p>
                                                            <strong>{t.branch}:</strong> {pipeline.branch}
                                                        </p>
                                                    )}
                                                    {pipeline.triggered_by && (
                                                        <p>
                                                            <strong>{t.triggeredBy}:</strong> {pipeline.triggered_by}
                                                        </p>
                                                    )}
                                                    <p>
                                                        <strong>{t.duration}:</strong> {formatDuration(pipeline.duration)}
                                                    </p>
                                                    <p className="text-gray-500">
                                                        {new Date(pipeline.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {(pipeline.status === 'failed' || pipeline.status === 'cancelled') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRetry(pipeline.id)}
                                                        disabled={actionLoading === `retry-${pipeline.id}`}
                                                    >
                                                        {actionLoading === `retry-${pipeline.id}` ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <PlayCircle className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                {pipeline.status === 'running' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCancel(pipeline.id)}
                                                        disabled={actionLoading === `cancel-${pipeline.id}`}
                                                    >
                                                        {actionLoading === `cancel-${pipeline.id}` ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}