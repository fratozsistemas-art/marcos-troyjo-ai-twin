import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Activity, AlertTriangle, TrendingUp, Target, Brain, 
    Zap, RefreshCw, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentMonitor({ lang = 'pt' }) {
    const [insights, setInsights] = useState(null);
    const [anomalies, setAnomalies] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    const translations = {
        pt: {
            title: "Monitor do Agente",
            desc: "Aprendizado e análise em tempo real",
            analyze: "Analisar Padrões",
            successRate: "Taxa de Sucesso",
            dataPoints: "Pontos de Dados",
            anomaliesDetected: "Anomalias Detectadas",
            insights: "Insights",
            predictions: "Previsões",
            recommendations: "Recomendações",
            lastUpdate: "Última atualização",
            noData: "Sem dados suficientes para análise",
            severity: {
                low: "Baixa",
                medium: "Média",
                high: "Alta",
                critical: "Crítica"
            },
            anomalyTypes: {
                slow_response: "Resposta Lenta",
                repeated_failure: "Falhas Repetidas",
                unusual_pattern: "Padrão Incomum",
                bottleneck: "Gargalo",
                error_spike: "Pico de Erros"
            }
        },
        en: {
            title: "Agent Monitor",
            desc: "Real-time learning and analysis",
            analyze: "Analyze Patterns",
            successRate: "Success Rate",
            dataPoints: "Data Points",
            anomaliesDetected: "Anomalies Detected",
            insights: "Insights",
            predictions: "Predictions",
            recommendations: "Recommendations",
            lastUpdate: "Last update",
            noData: "Not enough data for analysis",
            severity: {
                low: "Low",
                medium: "Medium",
                high: "High",
                critical: "Critical"
            },
            anomalyTypes: {
                slow_response: "Slow Response",
                repeated_failure: "Repeated Failures",
                unusual_pattern: "Unusual Pattern",
                bottleneck: "Bottleneck",
                error_spike: "Error Spike"
            }
        }
    };

    const t = translations[lang];

    useEffect(() => {
        analyzePatterns();
        const interval = setInterval(analyzePatterns, 60000);
        return () => clearInterval(interval);
    }, []);

    const analyzePatterns = async () => {
        setIsAnalyzing(true);
        try {
            const patternsResponse = await base44.functions.invoke('analyzePatterns', {
                context: 'real-time monitoring',
                learning_history_limit: 100
            });

            if (patternsResponse.data.success) {
                setInsights(patternsResponse.data);
            }

            const anomaliesResponse = await base44.functions.invoke('detectAnomalies', {
                time_window_minutes: 30
            });

            if (anomaliesResponse.data.success) {
                setAnomalies(anomaliesResponse.data.anomalies || []);
            }

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error analyzing patterns:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800 border-blue-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            critical: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[severity] || colors.medium;
    };

    return (
        <Card className="border-2 border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        <div>
                            <CardTitle>{t.title}</CardTitle>
                            <p className="text-xs text-emerald-100 mt-1">{t.desc}</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={analyzePatterns}
                        disabled={isAnalyzing}
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                        <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {insights && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-semibold text-green-900">{t.successRate}</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700">
                                {insights.success_rate_overall}%
                            </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-900">{t.dataPoints}</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                                {insights.data_points}
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-xs font-semibold text-red-900">{t.anomaliesDetected}</span>
                            </div>
                            <p className="text-2xl font-bold text-red-700">
                                {anomalies.length}
                            </p>
                        </div>
                    </div>
                )}

                {anomalies.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            {t.anomaliesDetected}
                        </h4>
                        <AnimatePresence>
                            {anomalies.map((anomaly, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 bg-white rounded-lg border-2 border-orange-200"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className={getSeverityColor(anomaly.severity)}>
                                                    {t.severity[anomaly.severity]}
                                                </Badge>
                                                <span className="text-xs font-medium text-gray-600">
                                                    {t.anomalyTypes[anomaly.anomaly_type]}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700">{anomaly.description}</p>
                                        </div>
                                    </div>
                                    {anomaly.suggested_fix && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                                            <Zap className="w-3 h-3 inline mr-1" />
                                            {anomaly.suggested_fix}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {insights?.insights && (
                    <div className="space-y-3">
                        {insights.insights.efficient_sequences && (
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <h5 className="text-xs font-semibold text-emerald-900 mb-2 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {t.recommendations}
                                </h5>
                                <ul className="space-y-1 text-xs text-emerald-800">
                                    {insights.insights.efficient_sequences?.slice(0, 3).map((seq, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-emerald-400">•</span>
                                            {seq.description || seq}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {insights.insights.predicted_actions && (
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <h5 className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    {t.predictions}
                                </h5>
                                <ul className="space-y-1 text-xs text-purple-800">
                                    {insights.insights.predicted_actions?.slice(0, 3).map((pred, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-purple-400">•</span>
                                            {pred.action || pred}
                                            {pred.likelihood && (
                                                <Badge variant="outline" className="ml-auto text-xs">
                                                    {pred.likelihood}%
                                                </Badge>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {lastUpdate && (
                    <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t.lastUpdate}: {lastUpdate.toLocaleTimeString()}
                    </div>
                )}

                {!insights && !isAnalyzing && (
                    <div className="text-center py-8 text-gray-500">
                        <Brain className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{t.noData}</p>
                        <Button
                            className="mt-4"
                            onClick={analyzePatterns}
                        >
                            {t.analyze}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}