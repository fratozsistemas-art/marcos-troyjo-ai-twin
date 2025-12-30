import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function WorkflowExecutionMonitor({ lang = 'pt' }) {
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExecution, setSelectedExecution] = useState(null);

    const t = {
        pt: {
            title: 'Execuções de Workflows',
            status: 'Status',
            workflow: 'Workflow',
            content: 'Conteúdo',
            confidence: 'Confiança',
            actions: 'Ações',
            time: 'Tempo',
            viewDetails: 'Ver Detalhes',
            noExecutions: 'Nenhuma execução registrada',
            reasoning: 'Raciocínio',
            flags: 'Sinalizações'
        },
        en: {
            title: 'Workflow Executions',
            status: 'Status',
            workflow: 'Workflow',
            content: 'Content',
            confidence: 'Confidence',
            actions: 'Actions',
            time: 'Time',
            viewDetails: 'View Details',
            noExecutions: 'No executions recorded',
            reasoning: 'Reasoning',
            flags: 'Flags'
        }
    }[lang];

    useEffect(() => {
        loadExecutions();
        const interval = setInterval(loadExecutions, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const loadExecutions = async () => {
        try {
            const data = await base44.entities.WorkflowExecution.list('-created_date', 50);
            setExecutions(data);
        } catch (error) {
            console.error('Error loading executions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'pending_review':
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'failed':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'pending_review':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {executions.map((execution) => (
                            <motion.div
                                key={execution.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-3 border rounded-lg ${getStatusColor(execution.execution_status)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusIcon(execution.execution_status)}
                                            <span className="text-sm font-semibold">
                                                {execution.content_type}
                                            </span>
                                            {execution.needs_review && (
                                                <Badge variant="outline" className="text-xs">
                                                    {lang === 'pt' ? 'Requer Revisão' : 'Needs Review'}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-center gap-4">
                                                <span>{t.confidence}: {Math.round((execution.ai_confidence || 0) * 100)}%</span>
                                                <span>{t.actions}: {execution.actions_taken?.length || 0}</span>
                                                <span>{execution.execution_time_ms}ms</span>
                                            </div>
                                            {execution.collections_assigned?.length > 0 && (
                                                <div className="text-gray-600">
                                                    {lang === 'pt' ? 'Coleções' : 'Collections'}: {execution.collections_assigned.length}
                                                </div>
                                            )}
                                            {execution.tags_added?.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {execution.tags_added.map((tag, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedExecution(execution)}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}

                        {executions.length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">{t.noExecutions}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t.viewDetails}</DialogTitle>
                    </DialogHeader>
                    {selectedExecution && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-2">{t.status}</h4>
                                <Badge className={getStatusColor(selectedExecution.execution_status)}>
                                    {selectedExecution.execution_status}
                                </Badge>
                            </div>

                            {selectedExecution.reasoning && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{t.reasoning}</h4>
                                    <p className="text-sm text-gray-600">{selectedExecution.reasoning}</p>
                                </div>
                            )}

                            {selectedExecution.actions_taken && selectedExecution.actions_taken.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{t.actions}</h4>
                                    <div className="space-y-2">
                                        {selectedExecution.actions_taken.map((action, idx) => (
                                            <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                                <div className="font-medium">{action.action_type}</div>
                                                <div className="text-gray-600">{action.status}</div>
                                                {action.details && (
                                                    <pre className="mt-1 text-xs">
                                                        {JSON.stringify(action.details, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedExecution.flags_raised && selectedExecution.flags_raised.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{t.flags}</h4>
                                    <div className="space-y-2">
                                        {selectedExecution.flags_raised.map((flag, idx) => (
                                            <div key={idx} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                                <div className="font-medium">{flag.flag_type}</div>
                                                <div className="text-gray-600">{flag.reason}</div>
                                                <Badge variant="outline" className="mt-1">
                                                    {flag.severity}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}