import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Database, Link2, Clock, Tag, AlertCircle, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import moment from 'moment';
import { toast } from 'sonner';

export default function StrategicFactsDashboard({ lang = 'pt' }) {
    const [facts, setFacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [generatingSummaries, setGeneratingSummaries] = useState(false);

    const t = {
        pt: {
            title: 'Dashboard de Fatos Estratégicos',
            description: 'Análise de cobertura e distribuição da base de conhecimento',
            overview: 'Visão Geral',
            byTopic: 'Por Tópico',
            activity: 'Atividade',
            relationships: 'Relacionamentos',
            totalFacts: 'Total de Fatos',
            totalTopics: 'Total de Tópicos',
            avgFactsPerTopic: 'Média por Tópico',
            mostConnected: 'Mais Conectados',
            recentlyUpdated: 'Atualizados Recentemente',
            topicDistribution: 'Distribuição por Tópico',
            factsByType: 'Fatos por Tipo',
            confidenceDistribution: 'Distribuição de Confiança',
            statusBreakdown: 'Status dos Fatos',
            noData: 'Nenhum dado disponível'
        },
        en: {
            title: 'Strategic Facts Dashboard',
            description: 'Coverage and distribution analysis of knowledge base',
            overview: 'Overview',
            byTopic: 'By Topic',
            activity: 'Activity',
            relationships: 'Relationships',
            totalFacts: 'Total Facts',
            totalTopics: 'Total Topics',
            avgFactsPerTopic: 'Avg per Topic',
            mostConnected: 'Most Connected',
            recentlyUpdated: 'Recently Updated',
            generateSummaries: 'Generate Summaries with AI',
            generatingSummaries: 'Generating summaries...',
            summariesGenerated: 'Summaries generated successfully',
            topicDistribution: 'Distribution by Topic',
            factsByType: 'Facts by Type',
            confidenceDistribution: 'Confidence Distribution',
            statusBreakdown: 'Facts Status',
            noData: 'No data available'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadFacts();
    }, []);

    const loadFacts = async () => {
        setIsLoading(true);
        try {
            const allFacts = await base44.entities.StrategicFact.list();
            setFacts(allFacts);
            analyzeData(allFacts);
        } catch (error) {
            console.error('Error loading facts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const analyzeData = (factsList) => {
        // Topic distribution
        const topicMap = {};
        factsList.forEach(fact => {
            if (!topicMap[fact.topic_id]) {
                topicMap[fact.topic_id] = {
                    topic_id: fact.topic_id,
                    topic_label: fact.topic_label,
                    count: 0,
                    facts: [],
                    total_relationships: 0
                };
            }
            topicMap[fact.topic_id].count++;
            topicMap[fact.topic_id].facts.push(fact);
            topicMap[fact.topic_id].total_relationships += (fact.related_fact_ids || []).length;
        });

        const topicData = Object.values(topicMap).sort((a, b) => b.count - a.count);

        // Fact type distribution
        const typeMap = {};
        factsList.forEach(fact => {
            typeMap[fact.fact_type] = (typeMap[fact.fact_type] || 0) + 1;
        });
        const typeData = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

        // Status distribution
        const statusMap = {};
        factsList.forEach(fact => {
            statusMap[fact.fact_status] = (statusMap[fact.fact_status] || 0) + 1;
        });
        const statusData = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

        // Confidence distribution
        const confidenceBuckets = { 'High (>0.9)': 0, 'Medium (0.7-0.9)': 0, 'Low (<0.7)': 0 };
        factsList.forEach(fact => {
            if (fact.confidence > 0.9) confidenceBuckets['High (>0.9)']++;
            else if (fact.confidence >= 0.7) confidenceBuckets['Medium (0.7-0.9)']++;
            else confidenceBuckets['Low (<0.7)']++;
        });
        const confidenceData = Object.entries(confidenceBuckets).map(([level, count]) => ({ level, count }));

        // Most connected facts
        const mostConnected = [...factsList]
            .sort((a, b) => (b.related_fact_ids || []).length - (a.related_fact_ids || []).length)
            .slice(0, 5);

        // Recently updated
        const recentlyUpdated = [...factsList]
            .filter(f => f.updated_date)
            .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
            .slice(0, 5);

        setAnalytics({
            totalFacts: factsList.length,
            totalTopics: Object.keys(topicMap).length,
            avgFactsPerTopic: (factsList.length / Object.keys(topicMap).length).toFixed(1),
            topicData,
            typeData,
            statusData,
            confidenceData,
            mostConnected,
            recentlyUpdated
        });
    };

    const handleGenerateSummaries = async () => {
        setGeneratingSummaries(true);
        try {
            const factsNeedingSummaries = facts.filter(f => 
                f.detail && (!f.summary || f.summary.length < 10)
            );

            if (factsNeedingSummaries.length === 0) {
                toast.info(lang === 'pt' ? 'Todos os fatos já possuem resumos' : 'All facts already have summaries');
                setGeneratingSummaries(false);
                return;
            }

            let successCount = 0;
            for (const fact of factsNeedingSummaries.slice(0, 10)) {
                try {
                    await base44.functions.invoke('generateFactSummary', {
                        fact_id: fact.fact_id,
                        detail: fact.detail,
                        topic_label: fact.topic_label,
                        fact_type: fact.fact_type
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Error generating summary for ${fact.fact_id}:`, error);
                }
            }

            toast.success(`${successCount} ${text.summariesGenerated}`);
            await loadFacts();
        } catch (error) {
            console.error('Error generating summaries:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar resumos' : 'Error generating summaries');
        } finally {
            setGeneratingSummaries(false);
        }
    };

    const COLORS = ['#002D62', '#00654A', '#8B1538', '#D4AF37', '#4A5568', '#718096', '#A0AEC0'];

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{text.noData}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#002D62]" />
                                {text.title}
                            </CardTitle>
                            <CardDescription>{text.description}</CardDescription>
                        </div>
                        <Button
                            onClick={handleGenerateSummaries}
                            disabled={generatingSummaries}
                            variant="outline"
                        >
                            {generatingSummaries ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {text.generatingSummaries}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    {text.generateSummaries}
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{text.totalFacts}</p>
                                    <p className="text-3xl font-bold text-[#002D62]">{analytics.totalFacts}</p>
                                </div>
                                <Database className="w-8 h-8 text-[#002D62] opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{text.totalTopics}</p>
                                    <p className="text-3xl font-bold text-[#00654A]">{analytics.totalTopics}</p>
                                </div>
                                <Tag className="w-8 h-8 text-[#00654A] opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{text.avgFactsPerTopic}</p>
                                    <p className="text-3xl font-bold text-[#8B1538]">{analytics.avgFactsPerTopic}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-[#8B1538] opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs for different views */}
            <Card>
                <CardContent className="pt-6">
                    <Tabs defaultValue="overview">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">{text.overview}</TabsTrigger>
                            <TabsTrigger value="topics">{text.byTopic}</TabsTrigger>
                            <TabsTrigger value="relationships">{text.relationships}</TabsTrigger>
                            <TabsTrigger value="activity">{text.activity}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Fact Type Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">{text.factsByType}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={analytics.typeData}
                                                    dataKey="count"
                                                    nameKey="type"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label
                                                >
                                                    {analytics.typeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Status Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">{text.statusBreakdown}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={analytics.statusData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#002D62" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Confidence Distribution */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-base">{text.confidenceDistribution}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={analytics.confidenceData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="level" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#00654A" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="topics" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{text.topicDistribution}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={analytics.topicData.slice(0, 10)} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="topic_label" type="category" width={200} />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#8B1538" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="relationships" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Link2 className="w-4 h-4" />
                                        {text.mostConnected}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        <div className="space-y-3">
                                            {analytics.mostConnected.map((fact, idx) => (
                                                <div key={fact.fact_id} className="p-4 border rounded-lg">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant="outline">{fact.fact_id}</Badge>
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    {(fact.related_fact_ids || []).length} {lang === 'pt' ? 'vínculos' : 'links'}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-semibold text-sm text-[#002D62] mb-1">
                                                                {fact.topic_label}
                                                            </h4>
                                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                                {fact.summary}
                                                            </p>
                                                        </div>
                                                        <div className="text-2xl font-bold text-[#002D62]">
                                                            #{idx + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activity" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {text.recentlyUpdated}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        <div className="space-y-3">
                                            {analytics.recentlyUpdated.map(fact => (
                                                <div key={fact.fact_id} className="p-4 border rounded-lg">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant="outline">{fact.fact_id}</Badge>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {moment(fact.updated_date).fromNow()}
                                                                </Badge>
                                                            </div>
                                                            <h4 className="font-semibold text-sm text-[#002D62] mb-1">
                                                                {fact.topic_label}
                                                            </h4>
                                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                                {fact.summary}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}