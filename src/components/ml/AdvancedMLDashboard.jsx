import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
    Brain, TrendingUp, AlertTriangle, Activity, 
    Loader2, RefreshCw, ChevronDown, Info, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { toast } from 'sonner';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const COLORS = ['#002D62', '#00654A', '#D4AF37', '#8B1538', '#00D4FF'];

export default function AdvancedMLDashboard({ lang = 'pt' }) {
    const [sentimentData, setSentimentData] = useState(null);
    const [anomalies, setAnomalies] = useState(null);
    const [policyImpact, setPolicyImpact] = useState(null);
    const [loading, setLoading] = useState({ sentiment: false, anomaly: false, policy: false });
    const [selectedAnomaly, setSelectedAnomaly] = useState(null);

    const t = {
        pt: {
            title: 'Análise ML Avançada',
            subtitle: 'Insights preditivos com IA',
            sentiment: 'Análise de Sentimento',
            anomalies: 'Detecção de Anomalias',
            policy: 'Impacto de Políticas',
            analyze: 'Analisar',
            analyzing: 'Analisando...',
            avgSentiment: 'Sentimento Médio',
            topThemes: 'Principais Temas',
            riskDistribution: 'Distribuição de Risco',
            detected: 'Detectadas',
            severity: 'Severidade',
            explanation: 'Explicação',
            causalChain: 'Cadeia Causal',
            confidence: 'Confiança',
            noData: 'Execute análise para ver resultados',
            directEffects: 'Efeitos Diretos',
            indirectEffects: 'Efeitos Indiretos',
            magnitude: 'Magnitude',
            probability: 'Probabilidade'
        },
        en: {
            title: 'Advanced ML Analysis',
            subtitle: 'AI-powered predictive insights',
            sentiment: 'Sentiment Analysis',
            anomalies: 'Anomaly Detection',
            policy: 'Policy Impact',
            analyze: 'Analyze',
            analyzing: 'Analyzing...',
            avgSentiment: 'Average Sentiment',
            topThemes: 'Top Themes',
            riskDistribution: 'Risk Distribution',
            detected: 'Detected',
            severity: 'Severity',
            explanation: 'Explanation',
            causalChain: 'Causal Chain',
            confidence: 'Confidence',
            noData: 'Run analysis to see results',
            directEffects: 'Direct Effects',
            indirectEffects: 'Indirect Effects',
            magnitude: 'Magnitude',
            probability: 'Probability'
        }
    }[lang];

    const analyzeSentiment = async () => {
        setLoading({ ...loading, sentiment: true });
        try {
            const response = await base44.functions.invoke('analyzeGeopoliticalSentiment', {
                analyze_trends: true
            });
            setSentimentData(response.data);
            toast.success(lang === 'pt' ? 'Análise concluída!' : 'Analysis complete!');
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message);
        } finally {
            setLoading({ ...loading, sentiment: false });
        }
    };

    const detectAnomalies = async () => {
        setLoading({ ...loading, anomaly: true });
        try {
            const response = await base44.functions.invoke('detectEconomicAnomalies', {
                data_source: 'corporate_facts',
                sensitivity: 'medium'
            });
            setAnomalies(response.data);
            toast.success(lang === 'pt' ? 'Anomalias detectadas!' : 'Anomalies detected!');
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message);
        } finally {
            setLoading({ ...loading, anomaly: false });
        }
    };

    const getSentimentColor = (score) => {
        if (score > 0.2) return '#00654A';
        if (score < -0.2) return '#8B1538';
        return '#D4AF37';
    };

    const getSeverityColor = (severity) => {
        switch(severity) {
            case 'critical': return '#8B1538';
            case 'high': return '#D4AF37';
            case 'medium': return '#00D4FF';
            default: return '#00654A';
        }
    };

    return (
        <Card>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center gap-2">
                    <Brain className="w-6 h-6" />
                    {t.title}
                </CardTitle>
                <CardDescription className="text-white/80">{t.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Tabs defaultValue="sentiment" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="sentiment">{t.sentiment}</TabsTrigger>
                        <TabsTrigger value="anomalies">{t.anomalies}</TabsTrigger>
                        <TabsTrigger value="policy">{t.policy}</TabsTrigger>
                    </TabsList>

                    {/* Sentiment Analysis Tab */}
                    <TabsContent value="sentiment" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                {lang === 'pt' 
                                    ? 'Análise de sentimento em notícias e artigos geopolíticos'
                                    : 'Sentiment analysis on geopolitical news and articles'}
                            </p>
                            <Button
                                onClick={analyzeSentiment}
                                disabled={loading.sentiment}
                                size="sm"
                                className="gap-2"
                            >
                                {loading.sentiment ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t.analyzing}
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        {t.analyze}
                                    </>
                                )}
                            </Button>
                        </div>

                        {sentimentData ? (
                            <div className="space-y-4">
                                {/* Metrics */}
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">{t.avgSentiment}</p>
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: getSentimentColor(sentimentData.aggregate_metrics.average_sentiment) }}
                                                />
                                                <p className="text-2xl font-bold">
                                                    {sentimentData.aggregate_metrics.average_sentiment.toFixed(2)}
                                                </p>
                                            </div>
                                            <Badge className="mt-2" variant="outline">
                                                {sentimentData.aggregate_metrics.sentiment_classification}
                                            </Badge>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">{t.topThemes}</p>
                                            <div className="space-y-1">
                                                {sentimentData.aggregate_metrics.top_themes?.slice(0, 3).map(([theme, count]) => (
                                                    <div key={theme} className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-700">{theme}</span>
                                                        <Badge variant="secondary">{count}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">{t.riskDistribution}</p>
                                            <ResponsiveContainer width="100%" height={100}>
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Low', value: sentimentData.aggregate_metrics.risk_distribution.low },
                                                            { name: 'Med', value: sentimentData.aggregate_metrics.risk_distribution.medium },
                                                            { name: 'High', value: sentimentData.aggregate_metrics.risk_distribution.high }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={20}
                                                        outerRadius={40}
                                                        dataKey="value"
                                                    >
                                                        {COLORS.map((color, index) => (
                                                            <Cell key={`cell-${index}`} fill={color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Detailed Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">
                                            {lang === 'pt' ? 'Análises Detalhadas' : 'Detailed Analyses'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="single" collapsible className="w-full">
                                            {sentimentData.sentiment_analysis?.analyses?.slice(0, 5).map((item, idx) => (
                                                <AccordionItem key={idx} value={`item-${idx}`}>
                                                    <AccordionTrigger className="hover:no-underline">
                                                        <div className="flex items-center gap-3 text-left">
                                                            <div 
                                                                className="w-2 h-2 rounded-full"
                                                                style={{ backgroundColor: getSentimentColor(item.score) }}
                                                            />
                                                            <span className="font-medium text-sm">{item.id}</span>
                                                            <Badge variant="outline" className="text-xs">{item.sentiment}</Badge>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-2 pl-5">
                                                            <div className="flex items-center gap-2 text-xs">
                                                                <span className="text-gray-500">Score:</span>
                                                                <Progress value={(item.score + 1) * 50} className="w-24 h-2" />
                                                                <span className="font-medium">{item.score.toFixed(2)}</span>
                                                            </div>
                                                            <div className="text-xs">
                                                                <span className="text-gray-500">{t.explanation}: </span>
                                                                <span className="text-gray-700">{item.explanation}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.themes?.map(theme => (
                                                                    <Badge key={theme} variant="secondary" className="text-xs">
                                                                        {theme}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">{t.noData}</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Anomaly Detection Tab */}
                    <TabsContent value="anomalies" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                {lang === 'pt' 
                                    ? 'Detecção de anomalias em indicadores econômicos'
                                    : 'Anomaly detection in economic indicators'}
                            </p>
                            <Button
                                onClick={detectAnomalies}
                                disabled={loading.anomaly}
                                size="sm"
                                className="gap-2"
                            >
                                {loading.anomaly ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t.analyzing}
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        {t.analyze}
                                    </>
                                )}
                            </Button>
                        </div>

                        {anomalies ? (
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">
                                                {lang === 'pt' ? 'Total Detectadas' : 'Total Detected'}
                                            </p>
                                            <p className="text-3xl font-bold text-orange-600">
                                                {anomalies.statistics?.anomalies_detected || 0}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">
                                                {lang === 'pt' ? 'Alta Severidade' : 'High Severity'}
                                            </p>
                                            <p className="text-3xl font-bold text-red-600">
                                                {anomalies.statistics?.high_severity || 0}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">
                                                {lang === 'pt' ? 'Séries Analisadas' : 'Series Analyzed'}
                                            </p>
                                            <p className="text-3xl font-bold text-blue-600">
                                                {anomalies.statistics?.total_series_analyzed || 0}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">{t.detected}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {anomalies.anomalies?.map((anomaly, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="p-4 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-800"
                                                    style={{ borderColor: getSeverityColor(anomaly.severity) }}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h5 className="font-semibold text-sm text-gray-900 dark:text-white">
                                                                {anomaly.indicator} - {anomaly.country}
                                                            </h5>
                                                            <Badge 
                                                                className="mt-1"
                                                                style={{ backgroundColor: getSeverityColor(anomaly.severity) }}
                                                            >
                                                                {anomaly.severity}
                                                            </Badge>
                                                        </div>
                                                        <Badge variant="outline">{anomaly.anomaly_type}</Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                                                        {anomaly.description}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">
                                                            {t.confidence}: {((anomaly.confidence || 0.5) * 100).toFixed(0)}%
                                                        </span>
                                                        <Progress value={(anomaly.confidence || 0.5) * 100} className="w-24 h-2" />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">{t.noData}</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Policy Impact Tab */}
                    <TabsContent value="policy" className="space-y-4">
                        <p className="text-sm text-gray-600 text-center py-8">
                            {lang === 'pt' 
                                ? 'Interface de análise de impacto de políticas - Em breve'
                                : 'Policy impact analysis interface - Coming soon'}
                        </p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}