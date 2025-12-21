import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, X } from 'lucide-react';

const translations = {
    pt: {
        title: 'Comparação de Runs',
        description: 'Compare métricas e parâmetros',
        metrics: 'Métricas',
        parameters: 'Parâmetros',
        remove: 'Remover',
        noRuns: 'Selecione runs para comparar',
        best: 'Melhor',
        clear: 'Limpar Tudo'
    },
    en: {
        title: 'Run Comparison',
        description: 'Compare metrics and parameters',
        metrics: 'Metrics',
        parameters: 'Parameters',
        remove: 'Remove',
        noRuns: 'Select runs to compare',
        best: 'Best',
        clear: 'Clear All'
    }
};

export default function MLflowRunComparison({ selectedRuns, onRemoveRun, onClearAll, lang = 'pt' }) {
    const [chartData, setChartData] = useState([]);
    const [bestRuns, setBestRuns] = useState({});
    const t = translations[lang];

    useEffect(() => {
        if (selectedRuns.length > 0) {
            processComparisonData();
        }
    }, [selectedRuns]);

    const processComparisonData = () => {
        // Prepare data for charts
        const data = selectedRuns.map((run, idx) => ({
            name: `Run #${idx + 1}`,
            runId: run.info.run_id.substring(0, 8),
            ...run.data.metrics
        }));

        setChartData(data);

        // Find best runs for each metric
        const best = {};
        if (selectedRuns.length > 0 && selectedRuns[0].data.metrics) {
            Object.keys(selectedRuns[0].data.metrics).forEach(metricKey => {
                let bestRun = selectedRuns[0];
                let bestValue = selectedRuns[0].data.metrics[metricKey];

                selectedRuns.forEach(run => {
                    const value = run.data.metrics[metricKey];
                    if (value !== undefined && value > bestValue) {
                        bestValue = value;
                        bestRun = run;
                    }
                });

                best[metricKey] = bestRun.info.run_id;
            });
        }

        setBestRuns(best);
    };

    if (selectedRuns.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-gray-500">
                    {t.noRuns}
                </CardContent>
            </Card>
        );
    }

    const allMetrics = selectedRuns.length > 0 && selectedRuns[0].data.metrics 
        ? Object.keys(selectedRuns[0].data.metrics) 
        : [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <TrendingUp className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClearAll}>
                        {t.clear}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="metrics">
                    <TabsList className="mb-4">
                        <TabsTrigger value="metrics">{t.metrics}</TabsTrigger>
                        <TabsTrigger value="parameters">{t.parameters}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="metrics" className="space-y-6">
                        {/* Selected Runs */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedRuns.map((run, idx) => (
                                <Badge key={run.info.run_id} variant="outline" className="gap-2">
                                    Run #{idx + 1} ({run.info.run_id.substring(0, 8)})
                                    <button onClick={() => onRemoveRun(run.info.run_id)}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>

                        {/* Metrics Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2 font-semibold">Metric</th>
                                        {selectedRuns.map((run, idx) => (
                                            <th key={run.info.run_id} className="text-right p-2 font-semibold">
                                                Run #{idx + 1}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allMetrics.map(metricKey => (
                                        <tr key={metricKey} className="border-b hover:bg-gray-50">
                                            <td className="p-2 font-medium">{metricKey}</td>
                                            {selectedRuns.map((run) => {
                                                const value = run.data.metrics[metricKey];
                                                const isBest = bestRuns[metricKey] === run.info.run_id;
                                                
                                                return (
                                                    <td key={run.info.run_id} className="text-right p-2">
                                                        <span className={isBest ? 'font-bold text-green-600' : ''}>
                                                            {value !== undefined ? Number(value).toFixed(4) : '-'}
                                                        </span>
                                                        {isBest && <Award className="w-3 h-3 inline ml-1 text-green-600" />}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Charts */}
                        {allMetrics.slice(0, 2).map(metricKey => (
                            <div key={metricKey}>
                                <h3 className="font-semibold mb-3">{metricKey}</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey={metricKey} fill="#002D62" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="parameters">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2 font-semibold">Parameter</th>
                                        {selectedRuns.map((run, idx) => (
                                            <th key={run.info.run_id} className="text-left p-2 font-semibold">
                                                Run #{idx + 1}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedRuns.length > 0 && selectedRuns[0].data.params && 
                                        Object.keys(selectedRuns[0].data.params).map(paramKey => (
                                            <tr key={paramKey} className="border-b hover:bg-gray-50">
                                                <td className="p-2 font-medium">{paramKey}</td>
                                                {selectedRuns.map((run) => (
                                                    <td key={run.info.run_id} className="p-2">
                                                        {run.data.params[paramKey] || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}