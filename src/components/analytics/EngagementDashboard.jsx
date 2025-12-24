import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Target, Eye, Zap, BookOpen, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EngagementDashboard({ lang = 'pt' }) {
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const t = {
        pt: {
            title: 'Análise de Engajamento',
            description: 'Insights profundos sobre seu comportamento',
            overview: 'Visão Geral',
            contentPreferences: 'Preferências de Conteúdo',
            engagementPatterns: 'Padrões de Engajamento',
            sectionFrequency: 'Seções Mais Visitadas',
            readingBehavior: 'Comportamento de Leitura',
            conversions: 'Ações & Conversões',
            timePatterns: 'Padrões Temporais',
            interactions: 'Interações',
            avgEngagement: 'Engajamento Médio',
            timeSpent: 'Tempo Gasto',
            uniqueSessions: 'Sessões Únicas',
            avgScrollDepth: 'Profundidade Média de Scroll',
            completionRate: 'Taxa de Conclusão',
            highEngagement: 'Alto Engajamento',
            mediumEngagement: 'Médio Engajamento',
            lowEngagement: 'Baixo Engajamento'
        },
        en: {
            title: 'Engagement Analysis',
            description: 'Deep insights into your behavior',
            overview: 'Overview',
            contentPreferences: 'Content Preferences',
            engagementPatterns: 'Engagement Patterns',
            sectionFrequency: 'Most Visited Sections',
            readingBehavior: 'Reading Behavior',
            conversions: 'Actions & Conversions',
            timePatterns: 'Time Patterns',
            interactions: 'Interactions',
            avgEngagement: 'Avg Engagement',
            timeSpent: 'Time Spent',
            uniqueSessions: 'Unique Sessions',
            avgScrollDepth: 'Avg Scroll Depth',
            completionRate: 'Completion Rate',
            highEngagement: 'High Engagement',
            mediumEngagement: 'Medium Engagement',
            lowEngagement: 'Low Engagement'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('getEngagementInsights');
            setInsights(response.data);
        } catch (error) {
            console.error('Error loading insights:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    if (!insights) return null;

    const COLORS = ['#002D62', '#00654A', '#8B1538', '#D4AF37', '#6B6B6B'];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#002D62]" />
                        {text.title}
                    </CardTitle>
                    <CardDescription>{text.description}</CardDescription>
                </CardHeader>
            </Card>

            {/* Overview Stats */}
            <div className="grid md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Eye className="w-8 h-8 text-[#002D62]" />
                                <div>
                                    <p className="text-2xl font-bold text-[#002D62]">
                                        {insights.overview.total_interactions}
                                    </p>
                                    <p className="text-xs text-gray-600">{text.interactions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Zap className="w-8 h-8 text-[#D4AF37]" />
                                <div>
                                    <p className="text-2xl font-bold text-[#002D62]">
                                        {insights.overview.avg_engagement_score}%
                                    </p>
                                    <p className="text-xs text-gray-600">{text.avgEngagement}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-8 h-8 text-[#00654A]" />
                                <div>
                                    <p className="text-2xl font-bold text-[#002D62]">
                                        {insights.overview.total_time_spent_minutes}min
                                    </p>
                                    <p className="text-xs text-gray-600">{text.timeSpent}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <Target className="w-8 h-8 text-[#8B1538]" />
                                <div>
                                    <p className="text-2xl font-bold text-[#002D62]">
                                        {insights.overview.unique_sessions}
                                    </p>
                                    <p className="text-xs text-gray-600">{text.uniqueSessions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Content Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>{text.contentPreferences}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={insights.content_preferences}
                                dataKey="view_count"
                                nameKey="content_type"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {insights.content_preferences.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Engagement Patterns */}
            <Card>
                <CardHeader>
                    <CardTitle>{text.engagementPatterns}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-2">{text.highEngagement}</p>
                            <Progress value={(insights.engagement_patterns.high_engagement / insights.overview.total_interactions) * 100} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">{insights.engagement_patterns.high_engagement} interações</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2">{text.mediumEngagement}</p>
                            <Progress value={(insights.engagement_patterns.medium_engagement / insights.overview.total_interactions) * 100} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">{insights.engagement_patterns.medium_engagement} interações</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-2">{text.lowEngagement}</p>
                            <Progress value={(insights.engagement_patterns.low_engagement / insights.overview.total_interactions) * 100} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">{insights.engagement_patterns.low_engagement} interações</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="font-semibold text-[#002D62]">{text.avgScrollDepth}</p>
                            <p className="text-3xl font-bold text-[#002D62]">{insights.engagement_patterns.avg_scroll_depth}%</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="font-semibold text-[#00654A]">{text.completionRate}</p>
                            <p className="text-3xl font-bold text-[#00654A]">{insights.engagement_patterns.completion_rate}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section Frequency */}
            {insights.section_frequency.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{text.sectionFrequency}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {insights.section_frequency.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.section}</span>
                                    <Badge variant="secondary">{item.visit_count} visitas</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}