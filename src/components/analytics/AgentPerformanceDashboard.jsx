import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
    TrendingUp, Clock, Star, MessageSquare, ThumbsUp, 
    ThumbsDown, AlertCircle, CheckCircle, Loader2, Users,
    Activity, Zap, Target, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgentPerformanceDashboard({ lang = 'pt' }) {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [metrics, setMetrics] = useState(null);

    const t = {
        pt: {
            title: 'Dashboard de Performance dos Agentes',
            description: 'Métricas agregadas e análise comparativa',
            overview: 'Visão Geral',
            sentiment: 'Análise de Sentimento',
            comparison: 'Comparação',
            trends: 'Tendências',
            timeRange: 'Período',
            selectAgent: 'Selecionar Agente',
            allAgents: 'Todos os Agentes',
            totalInteractions: 'Total de Interações',
            avgResponseTime: 'Tempo Médio',
            successRate: 'Taxa de Sucesso',
            avgSatisfaction: 'Satisfação Média',
            sentimentDistribution: 'Distribuição de Sentimento',
            positive: 'Positivo',
            neutral: 'Neutro',
            negative: 'Negativo',
            personaPerformance: 'Performance por Persona',
            topPerformers: 'Melhores Performers',
            insights: 'Insights',
            loading: 'Carregando métricas...',
            noData: 'Sem dados disponíveis',
            last7days: 'Últimos 7 dias',
            last30days: 'Últimos 30 dias',
            last90days: 'Últimos 90 dias',
            allTime: 'Todo o período',
            responseTimeChart: 'Tempo de Resposta ao Longo do Tempo',
            satisfactionTrend: 'Tendência de Satisfação',
            interactionVolume: 'Volume de Interações'
        },
        en: {
            title: 'Agent Performance Dashboard',
            description: 'Aggregated metrics and comparative analysis',
            overview: 'Overview',
            sentiment: 'Sentiment Analysis',
            comparison: 'Comparison',
            trends: 'Trends',
            timeRange: 'Time Range',
            selectAgent: 'Select Agent',
            allAgents: 'All Agents',
            totalInteractions: 'Total Interactions',
            avgResponseTime: 'Avg Response Time',
            successRate: 'Success Rate',
            avgSatisfaction: 'Avg Satisfaction',
            sentimentDistribution: 'Sentiment Distribution',
            positive: 'Positive',
            neutral: 'Neutral',
            negative: 'Negative',
            personaPerformance: 'Performance by Persona',
            topPerformers: 'Top Performers',
            insights: 'Insights',
            loading: 'Loading metrics...',
            noData: 'No data available',
            last7days: 'Last 7 days',
            last30days: 'Last 30 days',
            last90days: 'Last 90 days',
            allTime: 'All time',
            responseTimeChart: 'Response Time Over Time',
            satisfactionTrend: 'Satisfaction Trend',
            interactionVolume: 'Interaction Volume'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadMetrics();
    }, [timeRange, selectedAgent]);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            let filters = {};
            if (selectedAgent !== 'all') {
                filters.agent_name = selectedAgent;
            }

            const allLogs = await base44.entities.AgentInteractionLog.filter(filters);
            const filteredLogs = allLogs.filter(log => 
                new Date(log.created_date) >= cutoffDate
            );

            setLogs(filteredLogs);
            calculateMetrics(filteredLogs);
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const analyzeSentiment = (text) => {
        // Simple sentiment analysis based on keywords
        const positiveWords = ['ótimo', 'excelente', 'bom', 'perfeito', 'útil', 'obrigado', 'great', 'excellent', 'good', 'perfect', 'useful', 'thanks'];
        const negativeWords = ['ruim', 'péssimo', 'erro', 'problema', 'não funciona', 'bad', 'terrible', 'error', 'problem', 'not working'];
        
        const lowerText = text.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    };

    const calculateMetrics = (data) => {
        if (data.length === 0) {
            setMetrics(null);
            return;
        }

        // Overall metrics
        const totalInteractions = data.length;
        const avgResponseTime = data.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalInteractions;
        const withFeedback = data.filter(log => log.feedback_score);
        const avgSatisfaction = withFeedback.length > 0
            ? withFeedback.reduce((sum, log) => sum + log.feedback_score, 0) / withFeedback.length
            : 0;
        const successRate = (withFeedback.filter(log => log.feedback_score >= 4).length / withFeedback.length) * 100 || 0;

        // Sentiment analysis
        const sentimentData = data.map(log => ({
            ...log,
            sentiment: log.sentiment || analyzeSentiment(log.response || '')
        }));

        const sentimentCounts = sentimentData.reduce((acc, log) => {
            acc[log.sentiment] = (acc[log.sentiment] || 0) + 1;
            return acc;
        }, {});

        // Persona performance
        const personaStats = {};
        data.forEach(log => {
            const persona = log.persona_mode || 'unknown';
            if (!personaStats[persona]) {
                personaStats[persona] = {
                    name: persona,
                    count: 0,
                    totalResponseTime: 0,
                    totalSatisfaction: 0,
                    feedbackCount: 0
                };
            }
            personaStats[persona].count++;
            personaStats[persona].totalResponseTime += log.response_time_ms || 0;
            if (log.feedback_score) {
                personaStats[persona].totalSatisfaction += log.feedback_score;
                personaStats[persona].feedbackCount++;
            }
        });

        const personaPerformance = Object.values(personaStats).map(stat => ({
            name: stat.name,
            interactions: stat.count,
            avgResponseTime: Math.round(stat.totalResponseTime / stat.count),
            avgSatisfaction: stat.feedbackCount > 0 ? (stat.totalSatisfaction / stat.feedbackCount).toFixed(1) : 0
        }));

        // Time series data
        const timeSeriesData = data.reduce((acc, log) => {
            const date = new Date(log.created_date).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = {
                    date,
                    count: 0,
                    totalResponseTime: 0,
                    totalSatisfaction: 0,
                    feedbackCount: 0
                };
            }
            acc[date].count++;
            acc[date].totalResponseTime += log.response_time_ms || 0;
            if (log.feedback_score) {
                acc[date].totalSatisfaction += log.feedback_score;
                acc[date].feedbackCount++;
            }
            return acc;
        }, {});

        const trends = Object.values(timeSeriesData).map(day => ({
            date: day.date,
            interactions: day.count,
            avgResponseTime: Math.round(day.totalResponseTime / day.count / 1000),
            avgSatisfaction: day.feedbackCount > 0 ? (day.totalSatisfaction / day.feedbackCount).toFixed(1) : 0
        }));

        setMetrics({
            totalInteractions,
            avgResponseTime: Math.round(avgResponseTime),
            avgSatisfaction: avgSatisfaction.toFixed(1),
            successRate: successRate.toFixed(1),
            sentimentCounts,
            personaPerformance,
            trends
        });
    };

    const COLORS = {
        positive: '#10b981',
        neutral: '#6b7280',
        negative: '#ef4444'
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#002D62] dark:text-blue-400" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{text.loading}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-lg dark:bg-gray-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2 text-[#002D62] dark:text-blue-400">
                                <Activity className="w-6 h-6" />
                                {text.title}
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">{text.description}</CardDescription>
                        </div>
                        <div className="flex gap-3">
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-40 dark:bg-gray-700 dark:border-gray-600">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">{text.last7days}</SelectItem>
                                    <SelectItem value="30d">{text.last30days}</SelectItem>
                                    <SelectItem value="90d">{text.last90days}</SelectItem>
                                    <SelectItem value="all">{text.allTime}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                                <SelectTrigger className="w-48 dark:bg-gray-700 dark:border-gray-600">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{text.allAgents}</SelectItem>
                                    <SelectItem value="troyjo_twin">Troyjo Twin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {!metrics ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
                        {text.noData}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="border-none shadow-lg dark:bg-gray-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {timeRange}
                                        </Badge>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{text.totalInteractions}</h3>
                                    <p className="text-3xl font-bold text-[#002D62] dark:text-blue-400 mt-2">
                                        {metrics.totalInteractions.toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="border-none shadow-lg dark:bg-gray-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                                        <Zap className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{text.avgResponseTime}</h3>
                                    <p className="text-3xl font-bold text-[#002D62] dark:text-blue-400 mt-2">
                                        {(metrics.avgResponseTime / 1000).toFixed(1)}s
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card className="border-none shadow-lg dark:bg-gray-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                                        <Award className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{text.avgSatisfaction}</h3>
                                    <p className="text-3xl font-bold text-[#002D62] dark:text-blue-400 mt-2">
                                        {metrics.avgSatisfaction}/5
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <Card className="border-none shadow-lg dark:bg-gray-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{text.successRate}</h3>
                                    <p className="text-3xl font-bold text-[#002D62] dark:text-blue-400 mt-2">
                                        {metrics.successRate}%
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Detailed Analytics */}
                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
                            <TabsTrigger value="overview">{text.overview}</TabsTrigger>
                            <TabsTrigger value="sentiment">{text.sentiment}</TabsTrigger>
                            <TabsTrigger value="comparison">{text.comparison}</TabsTrigger>
                            <TabsTrigger value="trends">{text.trends}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Card className="dark:bg-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-lg dark:text-gray-200">{text.interactionVolume}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={metrics.trends}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="interactions" fill="#002D62" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card className="dark:bg-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-lg dark:text-gray-200">{text.personaPerformance}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RadarChart data={metrics.personaPerformance}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="name" />
                                                <PolarRadiusAxis />
                                                <Radar name="Interactions" dataKey="interactions" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="sentiment" className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Card className="dark:bg-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-lg dark:text-gray-200">{text.sentimentDistribution}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: text.positive, value: metrics.sentimentCounts.positive || 0 },
                                                        { name: text.neutral, value: metrics.sentimentCounts.neutral || 0 },
                                                        { name: text.negative, value: metrics.sentimentCounts.negative || 0 }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    <Cell fill={COLORS.positive} />
                                                    <Cell fill={COLORS.neutral} />
                                                    <Cell fill={COLORS.negative} />
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card className="dark:bg-gray-800">
                                    <CardHeader>
                                        <CardTitle className="text-lg dark:text-gray-200">{text.insights}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                                    {Math.round((metrics.sentimentCounts.positive / metrics.totalInteractions) * 100)}% {text.positive}
                                                </p>
                                                <p className="text-xs text-green-700 dark:text-green-300">
                                                    {lang === 'pt' ? 'Alta satisfação do usuário' : 'High user satisfaction'}
                                                </p>
                                            </div>
                                        </div>
                                        {metrics.sentimentCounts.negative > 0 && (
                                            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                                        {Math.round((metrics.sentimentCounts.negative / metrics.totalInteractions) * 100)}% {text.negative}
                                                    </p>
                                                    <p className="text-xs text-red-700 dark:text-red-300">
                                                        {lang === 'pt' ? 'Requer atenção' : 'Requires attention'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="comparison" className="space-y-4">
                            <Card className="dark:bg-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-lg dark:text-gray-200">{text.personaPerformance}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {metrics.personaPerformance.map((persona, idx) => (
                                            <motion.div
                                                key={persona.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-4 rounded-lg border dark:border-gray-700 hover:shadow-lg transition-shadow"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-[#002D62] dark:text-blue-400 capitalize">
                                                        {persona.name}
                                                    </h4>
                                                    <Badge variant="outline" className="dark:border-gray-600">
                                                        {persona.interactions} {lang === 'pt' ? 'interações' : 'interactions'}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">{text.avgResponseTime}</p>
                                                        <p className="text-lg font-semibold dark:text-gray-200">
                                                            {(persona.avgResponseTime / 1000).toFixed(1)}s
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">{text.avgSatisfaction}</p>
                                                        <p className="text-lg font-semibold dark:text-gray-200">
                                                            {persona.avgSatisfaction}/5
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="trends" className="space-y-4">
                            <Card className="dark:bg-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-lg dark:text-gray-200">{text.responseTimeChart}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={metrics.trends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="avgResponseTime" stroke="#8884d8" name={text.avgResponseTime} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-gray-800">
                                <CardHeader>
                                    <CardTitle className="text-lg dark:text-gray-200">{text.satisfactionTrend}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={metrics.trends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={[0, 5]} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="avgSatisfaction" stroke="#10b981" name={text.avgSatisfaction} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}