import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, PlayCircle, XCircle, CheckCircle2, Clock, GitCommit, FlaskConical, ExternalLink, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import PipelineAlerts from './PipelineAlerts';

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
    const [mlflowRuns, setMlflowRuns] = useState({});
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
                const pipelineData = response.data.data.pipelines || [];
                setPipelines(pipelineData);
                
                // Load MLflow runs for each pipeline
                loadMLflowRuns(pipelineData);
            }
        } catch (error) {
            console.error('Error loading pipelines:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMLflowRuns = async (pipelineData) => {
        try {
            const runsMap = {};
            
            for (const pipeline of pipelineData.slice(0, 5)) {
                try {
                    const response = await base44.functions.invoke('mlflowManager', {
                        action: 'listRuns',
                        data: { experimentId: 'default', limit: 100 }
                    });

                    if (response.data.success) {
                        const runs = response.data.data.runs || [];
                        const matchingRun = runs.find(run => 
                            run.data.tags?.some(tag => 
                                tag.key === 'pipeline_id' && tag.value === String(pipeline.id)
                            )
                        );
                        
                        if (matchingRun) {
                            runsMap[pipeline.id] = matchingRun;
                        }
                    }
                } catch (err) {
                    console.error('Error loading MLflow run for pipeline:', pipeline.id, err);
                }
            }
            
            setMlflowRuns(runsMap);
        } catch (error) {
            console.error('Error loading MLflow runs:', error);
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

    const handleManualDeploy = async (pipeline) => {
        setActionLoading(`deploy-${pipeline.id}`);
        try {
            const response = await base44.functions.invoke('triggerManualDeploy', {
                siteId,
                source: 'manual_ui',
                pipelineId: pipeline.id,
                mlflowRunId: mlflowRuns[pipeline.id]?.info.run_id,
                commitSha: pipeline.commit,
                branch: pipeline.branch
            });

            if (response.data.success) {
                toast.success('Deploy iniciado com sucesso!');
                
                // Dispatch alert event
                window.dispatchEvent(new CustomEvent('pipeline-alert', {
                    detail: {
                        type: 'info',
                        severity: 'low',
                        message: 'Manual deploy started',
                        details: `Pipeline #${pipeline.number}`,
                        timestamp: new Date().toISOString()
                    }
                }));
                
                setTimeout(() => loadPipelines(), 3000);
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error triggering deploy:', error);
            toast.error('Erro ao iniciar deploy');
        } finally {
            setActionLoading(null);
        }
    };

    const checkPipelineAlerts = async (pipeline) => {
        try {
            const response = await base44.functions.invoke('monitorPipelineAlerts', {
                action: 'checkPipelineStatus',
                siteId,
                pipelineId: pipeline.id,
                thresholds: {
                    maxDuration: 600
                }
            });

            if (response.data.success && response.data.data.alerts.length > 0) {
                response.data.data.alerts.forEach(alert => {
                    window.dispatchEvent(new CustomEvent('pipeline-alert', { detail: alert }));
                });
            }
        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    };

    useEffect(() => {
        if (pipelines.length > 0) {
            pipelines.forEach(pipeline => {
                if (pipeline.status === 'failed' || pipeline.duration > 600) {
                    checkPipelineAlerts(pipeline);
                }
            });
        }
    }, [pipelines]);

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <>
            <PipelineAlerts siteId={siteId} lang={lang} />
            
            <Card className="mt-4">
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
                                const mlflowRun = mlflowRuns[pipeline.id];

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
                                                    {mlflowRun && (
                                                        <Badge variant="outline" className="gap-1">
                                                            <FlaskConical className="w-3 h-3" />
                                                            MLflow
                                                        </Badge>
                                                    )}
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

                                                {mlflowRun && mlflowRun.data.metrics && (
                                                    <div className="pt-2 border-t mt-2">
                                                        <p className="text-xs font-semibold text-[#002D62] mb-1 flex items-center gap-1">
                                                            <FlaskConical className="w-3 h-3" />
                                                            MLflow Metrics:
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {Object.entries(mlflowRun.data.metrics).slice(0, 4).map(([key, value]) => (
                                                                <div key={key} className="text-xs">
                                                                    <span className="text-gray-600">{key}:</span>
                                                                    <span className="font-semibold ml-1">{Number(value).toFixed(4)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleManualDeploy(pipeline)}
                                                    disabled={actionLoading === `deploy-${pipeline.id}`}
                                                    title="Trigger manual deploy"
                                                >
                                                    {actionLoading === `deploy-${pipeline.id}` ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Rocket className="w-4 h-4" />
                                                    )}
                                                </Button>
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
        </>
    );
}