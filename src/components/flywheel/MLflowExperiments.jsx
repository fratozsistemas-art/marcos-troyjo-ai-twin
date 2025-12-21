import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, FlaskConical, TrendingUp, Activity, GitCompare } from 'lucide-react';
import { toast } from 'sonner';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import MLflowRunComparison from './MLflowRunComparison';

const translations = {
    pt: {
        title: 'MLflow Experiments',
        description: 'Tracking de experimentos ML',
        createExperiment: 'Novo Experimento',
        experimentName: 'Nome do Experimento',
        runs: 'Execuções',
        noExperiments: 'Nenhum experimento encontrado',
        viewRuns: 'Ver Execuções',
        metrics: 'Métricas',
        parameters: 'Parâmetros',
        create: 'Criar',
        cancel: 'Cancelar'
    },
    en: {
        title: 'MLflow Experiments',
        description: 'ML experiment tracking',
        createExperiment: 'New Experiment',
        experimentName: 'Experiment Name',
        runs: 'Runs',
        noExperiments: 'No experiments found',
        viewRuns: 'View Runs',
        metrics: 'Metrics',
        parameters: 'Parameters',
        create: 'Create',
        cancel: 'Cancel'
    }
};

export default function MLflowExperiments({ lang = 'pt' }) {
    const [experiments, setExperiments] = useState([]);
    const [selectedExp, setSelectedExp] = useState(null);
    const [runs, setRuns] = useState([]);
    const [selectedRun, setSelectedRun] = useState(null);
    const [metricHistory, setMetricHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newExpName, setNewExpName] = useState('');
    const [selectedForComparison, setSelectedForComparison] = useState([]);
    const [showComparison, setShowComparison] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadExperiments();
    }, []);

    const loadExperiments = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('mlflowManager', {
                action: 'listExperiments'
            });

            if (response.data.success) {
                setExperiments(response.data.data.experiments || []);
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error loading experiments:', error);
            toast.error('Erro ao carregar experimentos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExperiment = async () => {
        if (!newExpName.trim()) return;

        try {
            const response = await base44.functions.invoke('mlflowManager', {
                action: 'createExperiment',
                data: { name: newExpName }
            });

            if (response.data.success) {
                toast.success('Experimento criado!');
                setDialogOpen(false);
                setNewExpName('');
                loadExperiments();
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error creating experiment:', error);
            toast.error('Erro ao criar experimento');
        }
    };

    const loadRuns = async (experimentId) => {
        try {
            const response = await base44.functions.invoke('mlflowManager', {
                action: 'listRuns',
                data: { experimentId }
            });

            if (response.data.success) {
                setRuns(response.data.data.runs || []);
            }
        } catch (error) {
            console.error('Error loading runs:', error);
        }
    };

    const loadMetricHistory = async (runId, metricKey) => {
        try {
            const response = await base44.functions.invoke('mlflowManager', {
                action: 'getMetricHistory',
                data: { runId, metricKey }
            });

            if (response.data.success) {
                const history = response.data.data.metrics || [];
                setMetricHistory(history.map(m => ({
                    step: m.step,
                    value: m.value,
                    timestamp: new Date(m.timestamp).toLocaleString()
                })));
            }
        } catch (error) {
            console.error('Error loading metric history:', error);
        }
    };

    const handleSelectExperiment = (exp) => {
        setSelectedExp(exp);
        setSelectedForComparison([]);
        setShowComparison(false);
        loadRuns(exp.experiment_id);
    };

    const toggleRunSelection = (run) => {
        setSelectedForComparison(prev => {
            const isSelected = prev.some(r => r.info.run_id === run.info.run_id);
            if (isSelected) {
                return prev.filter(r => r.info.run_id !== run.info.run_id);
            } else {
                return [...prev, run];
            }
        });
    };

    const removeRunFromComparison = (runId) => {
        setSelectedForComparison(prev => prev.filter(r => r.info.run_id !== runId));
    };

    const clearComparison = () => {
        setSelectedForComparison([]);
        setShowComparison(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <FlaskConical className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#002D62]">
                                <Plus className="w-4 h-4 mr-2" />
                                {t.createExperiment}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t.createExperiment}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t.experimentName}</Label>
                                    <Input
                                        value={newExpName}
                                        onChange={(e) => setNewExpName(e.target.value)}
                                        placeholder="my-ml-experiment"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        {t.cancel}
                                    </Button>
                                    <Button onClick={handleCreateExperiment} className="bg-[#002D62]">
                                        {t.create}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {selectedForComparison.length > 0 && (
                    <div className="mb-4">
                        <Button
                            onClick={() => setShowComparison(!showComparison)}
                            variant={showComparison ? "default" : "outline"}
                            className="w-full"
                        >
                            <GitCompare className="w-4 h-4 mr-2" />
                            {showComparison ? 'Hide' : 'Show'} Comparison ({selectedForComparison.length} runs)
                        </Button>
                    </div>
                )}

                {showComparison && selectedForComparison.length > 0 ? (
                    <MLflowRunComparison
                        selectedRuns={selectedForComparison}
                        onRemoveRun={removeRunFromComparison}
                        onClearAll={clearComparison}
                        lang={lang}
                    />
                ) : (
                <div className="grid lg:grid-cols-2 gap-4">
                    {/* Experiments List */}
                    <div>
                        <h3 className="font-semibold mb-3">Experiments</h3>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                            </div>
                        ) : experiments.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">{t.noExperiments}</p>
                        ) : (
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-2">
                                    {experiments.map((exp) => (
                                        <div
                                            key={exp.experiment_id}
                                            onClick={() => handleSelectExperiment(exp)}
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                selectedExp?.experiment_id === exp.experiment_id
                                                    ? 'bg-blue-50 border-blue-300'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <p className="font-medium text-sm">{exp.name}</p>
                                            <p className="text-xs text-gray-500">ID: {exp.experiment_id}</p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Runs List */}
                    <div>
                        <h3 className="font-semibold mb-3">{t.runs}</h3>
                        {selectedExp ? (
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-2">
                                    {runs.map((run) => {
                                        const isSelected = selectedForComparison.some(r => r.info.run_id === run.info.run_id);
                                        
                                        return (
                                        <div
                                            key={run.info.run_id}
                                            className={`border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                selectedRun?.info.run_id === run.info.run_id
                                                    ? 'bg-blue-50 border-blue-300'
                                                    : ''
                                            } ${isSelected ? 'ring-2 ring-[#002D62]' : ''}`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleRunSelection(run);
                                                    }}
                                                    className="mt-1"
                                                />
                                                <div 
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setSelectedRun(run);
                                                        if (run.data.metrics && Object.keys(run.data.metrics).length > 0) {
                                                            const firstMetric = Object.keys(run.data.metrics)[0];
                                                            loadMetricHistory(run.info.run_id, firstMetric);
                                                        }
                                                    }}
                                                >
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant={
                                                    run.info.status === 'FINISHED' ? 'default' :
                                                    run.info.status === 'RUNNING' ? 'secondary' : 'destructive'
                                                }>{run.info.status}</Badge>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(run.info.start_time).toLocaleString()}
                                                </span>
                                            </div>
                                            {run.data.metrics && Object.keys(run.data.metrics).length > 0 && (
                                                <div className="text-xs space-y-1">
                                                    <p className="font-semibold">{t.metrics}:</p>
                                                    {Object.entries(run.data.metrics).slice(0, 3).map(([key, value]) => (
                                                        <p key={key} className="flex items-center justify-between">
                                                            <span className="text-gray-600">{key}:</span>
                                                            <strong className="text-[#002D62]">{Number(value).toFixed(4)}</strong>
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                            {run.data.params && Object.keys(run.data.params).length > 0 && (
                                                <div className="text-xs space-y-1 mt-2 pt-2 border-t">
                                                    <p className="font-semibold">{t.parameters}:</p>
                                                    {Object.entries(run.data.params).slice(0, 2).map(([key, value]) => (
                                                        <p key={key} className="flex items-center justify-between">
                                                            <span className="text-gray-600">{key}:</span>
                                                            <span className="text-gray-900">{value}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                Selecione um experimento
                            </p>
                        )}
                    </div>
                </div>
                )}

                {/* Metric Chart */}
                {!showComparison && (
                {selectedRun && metricHistory.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Metric History
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={metricHistory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="step" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#002D62" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
                )}
            </CardContent>
        </Card>
    );
}