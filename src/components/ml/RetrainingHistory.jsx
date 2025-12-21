import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, CheckCircle, XCircle, Clock, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const statusIcons = {
    pending: <Clock className="w-4 h-4 text-amber-600" />,
    running: <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />,
    completed: <CheckCircle className="w-4 h-4 text-green-600" />,
    failed: <XCircle className="w-4 h-4 text-red-600" />,
    cancelled: <XCircle className="w-4 h-4 text-gray-600" />
};

export default function RetrainingHistory({ lang = 'pt' }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
        const interval = setInterval(loadJobs, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const loadJobs = async () => {
        try {
            const data = await base44.entities.RetrainingJob.list('-created_date', 50);
            setJobs(data);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDuration = (startedAt, completedAt) => {
        if (!startedAt || !completedAt) return 'N/A';
        const diff = new Date(completedAt) - new Date(startedAt);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <History className="w-5 h-5" />
                    {lang === 'pt' ? 'Histórico de Retreinamentos' : 'Retraining History'}
                </CardTitle>
                <CardDescription>
                    {lang === 'pt' ? 'Jobs de retreinamento executados' : 'Executed retraining jobs'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : jobs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Nenhum retreinamento ainda</p>
                ) : (
                    <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                            {jobs.map(job => (
                                <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {statusIcons[job.status]}
                                            <span className="font-semibold">{job.model_name}</span>
                                            <Badge variant="outline">{job.status}</Badge>
                                            {job.deployed && (
                                                <Badge className="bg-green-100 text-green-800">Deployed</Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(job.created_date).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <p className="text-gray-600"><strong>Motivo:</strong> {job.trigger_reason}</p>
                                        
                                        {job.status === 'completed' && job.improvement && (
                                            <div className="border-t pt-2 mt-2">
                                                <p className="font-semibold mb-1">Melhoria:</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(job.improvement).map(([metric, value]) => {
                                                        const isImproved = parseFloat(value) > 0;
                                                        return (
                                                            <div key={metric} className="flex items-center gap-1">
                                                                {isImproved ? 
                                                                    <TrendingUp className="w-3 h-3 text-green-600" /> :
                                                                    <TrendingDown className="w-3 h-3 text-red-600" />
                                                                }
                                                                <span className={isImproved ? 'text-green-600' : 'text-red-600'}>
                                                                    {metric}: {value}%
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {job.mlflow_run_id && (
                                            <p className="text-xs text-gray-500">
                                                <strong>MLflow Run:</strong> {job.mlflow_run_id}
                                            </p>
                                        )}

                                        {job.started_at && job.completed_at && (
                                            <p className="text-xs text-gray-500">
                                                <strong>Duração:</strong> {calculateDuration(job.started_at, job.completed_at)}
                                            </p>
                                        )}

                                        {job.error_message && (
                                            <p className="text-xs text-red-600">
                                                <strong>Erro:</strong> {job.error_message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}