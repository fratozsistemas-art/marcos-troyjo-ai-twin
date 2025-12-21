import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, CheckCircle, XCircle, Clock, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const statusIcons = {
    pending: <Clock className="w-4 h-4 text-amber-600" />,
    running: <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />,
    success: <CheckCircle className="w-4 h-4 text-green-600" />,
    failed: <XCircle className="w-4 h-4 text-red-600" />,
    skipped: <Clock className="w-4 h-4 text-gray-400" />
};

export default function PipelineRunsViewer({ pipelineId, lang = 'pt' }) {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRuns, setExpandedRuns] = useState(new Set());

    useEffect(() => {
        loadRuns();
        const interval = setInterval(loadRuns, 5000);
        return () => clearInterval(interval);
    }, [pipelineId]);

    const loadRuns = async () => {
        try {
            const filter = pipelineId ? { pipeline_id: pipelineId } : {};
            const data = await base44.entities.PipelineRun.list('-created_date', 50);
            const filtered = pipelineId ? data.filter(r => r.pipeline_id === pipelineId) : data;
            setRuns(filtered);
        } catch (error) {
            console.error('Error loading runs:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (runId) => {
        const newExpanded = new Set(expandedRuns);
        if (newExpanded.has(runId)) {
            newExpanded.delete(runId);
        } else {
            newExpanded.add(runId);
        }
        setExpandedRuns(newExpanded);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <History className="w-5 h-5" />
                    {lang === 'pt' ? 'Execuções de Pipeline' : 'Pipeline Runs'}
                </CardTitle>
                <CardDescription>
                    {lang === 'pt' ? 'Histórico de execuções' : 'Execution history'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : runs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        {lang === 'pt' ? 'Nenhuma execução ainda' : 'No runs yet'}
                    </p>
                ) : (
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                            {runs.map(run => {
                                const isExpanded = expandedRuns.has(run.id);
                                return (
                                    <div key={run.id} className="border rounded-lg overflow-hidden">
                                        <div className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(run.id)}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    {statusIcons[run.status]}
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-sm">Run #{run.run_number}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {run.trigger_type}
                                                            </Badge>
                                                            <Badge variant={run.status === 'success' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
                                                                {run.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            <span>{new Date(run.created_date).toLocaleString()}</span>
                                                            {run.duration_seconds && (
                                                                <span className="ml-3">
                                                                    Duração: {Math.floor(run.duration_seconds / 60)}m {run.duration_seconds % 60}s
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {isExpanded && run.stages && (
                                            <div className="border-t bg-gray-50 p-4 space-y-2">
                                                {run.stages.map((stage, idx) => (
                                                    <div key={idx} className="bg-white rounded-lg p-3 border">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                {statusIcons[stage.status]}
                                                                <span className="font-medium text-sm">{stage.name}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                {stage.status}
                                                            </Badge>
                                                        </div>
                                                        {stage.duration_seconds && (
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                Duração: {stage.duration_seconds}s
                                                            </p>
                                                        )}
                                                        {stage.error_message && (
                                                            <p className="text-xs text-red-600 mt-2">
                                                                Erro: {stage.error_message}
                                                            </p>
                                                        )}
                                                        {stage.logs && (
                                                            <details className="mt-2">
                                                                <summary className="text-xs text-blue-600 cursor-pointer">Ver logs</summary>
                                                                <pre className="text-xs bg-gray-900 text-green-400 p-2 rounded mt-1 overflow-x-auto">
                                                                    {stage.logs}
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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