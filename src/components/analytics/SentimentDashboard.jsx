import React, { useState, useEffect } from 'react';
import { Smile, Meh, Frown, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function SentimentDashboard({ lang = 'pt', timeRange = '7d' }) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const t = {
        pt: {
            title: 'Análise de Sentimento',
            description: 'Sentimento agregado das interações e documentos',
            overall: 'Sentimento Geral',
            positive: 'Positivo',
            neutral: 'Neutro',
            negative: 'Negativo',
            trend: 'Tendência',
            bySource: 'Por Fonte',
            conversations: 'Conversas',
            documents: 'Documentos',
            feedback: 'Feedbacks',
            noData: 'Dados insuficientes para análise'
        },
        en: {
            title: 'Sentiment Analysis',
            description: 'Aggregated sentiment from interactions and documents',
            overall: 'Overall Sentiment',
            positive: 'Positive',
            neutral: 'Neutral',
            negative: 'Negative',
            trend: 'Trend',
            bySource: 'By Source',
            conversations: 'Conversations',
            documents: 'Documents',
            feedback: 'Feedback',
            noData: 'Insufficient data for analysis'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadSentimentData();
    }, [timeRange]);

    const loadSentimentData = async () => {
        setIsLoading(true);
        try {
            // Simulated sentiment data - in production, call backend function
            // const response = await base44.functions.invoke('analyzeSentiment', { timeRange });
            
            const mockData = {
                overall: {
                    score: 0.72,
                    label: 'positive',
                    trend: 0.05
                },
                breakdown: {
                    positive: 65,
                    neutral: 25,
                    negative: 10
                },
                bySources: [
                    { source: 'conversations', positive: 70, neutral: 20, negative: 10 },
                    { source: 'documents', positive: 60, neutral: 30, negative: 10 },
                    { source: 'feedback', positive: 65, neutral: 25, negative: 10 }
                ]
            };

            setData(mockData);
        } catch (error) {
            console.error('Error loading sentiment data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSentimentIcon = (label) => {
        const icons = {
            positive: Smile,
            neutral: Meh,
            negative: Frown
        };
        return icons[label] || Meh;
    };

    const getSentimentColor = (label) => {
        const colors = {
            positive: 'text-green-600 bg-green-50 border-green-200',
            neutral: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            negative: 'text-red-600 bg-red-50 border-red-200'
        };
        return colors[label] || colors.neutral;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 animate-pulse" />
                        {text.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm">Loading...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{text.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12 text-gray-500">
                    <Meh className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{text.noData}</p>
                </CardContent>
            </Card>
        );
    }

    const SentimentIcon = getSentimentIcon(data.overall.label);
    const sentimentColor = getSentimentColor(data.overall.label);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {text.title}
                </CardTitle>
                <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Sentiment */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{text.overall}</span>
                        <Badge className={`gap-1 ${sentimentColor}`}>
                            {data.overall.trend > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(data.overall.trend * 100).toFixed(1)}%
                        </Badge>
                    </div>
                    <div className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 ${sentimentColor}`}>
                        <SentimentIcon className="w-12 h-12" />
                        <div>
                            <div className="text-3xl font-bold">
                                {(data.overall.score * 100).toFixed(0)}
                            </div>
                            <div className="text-sm capitalize">{data.overall.label}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Breakdown */}
                <div className="space-y-3">
                    {[
                        { key: 'positive', icon: Smile, color: 'bg-green-500' },
                        { key: 'neutral', icon: Meh, color: 'bg-yellow-500' },
                        { key: 'negative', icon: Frown, color: 'bg-red-500' }
                    ].map((item, index) => {
                        const Icon = item.icon;
                        const value = data.breakdown[item.key];
                        return (
                            <motion.div
                                key={item.key}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-1"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        <span className="font-medium capitalize">{text[item.key]}</span>
                                    </div>
                                    <span className="font-bold">{value}%</span>
                                </div>
                                <Progress value={value} className={`h-2 ${item.color}`} />
                            </motion.div>
                        );
                    })}
                </div>

                {/* By Source */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">{text.bySource}</h4>
                    <div className="space-y-2">
                        {data.bySources.map((source, index) => (
                            <motion.div
                                key={source.source}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-3 rounded-lg border bg-gray-50"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium capitalize">
                                        {text[source.source]}
                                    </span>
                                    <div className="flex gap-1">
                                        <Badge variant="outline" className="text-xs bg-green-50">
                                            {source.positive}%
                                        </Badge>
                                        <Badge variant="outline" className="text-xs bg-yellow-50">
                                            {source.neutral}%
                                        </Badge>
                                        <Badge variant="outline" className="text-xs bg-red-50">
                                            {source.negative}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-green-500"
                                        style={{ width: `${source.positive}%` }}
                                    />
                                    <div
                                        className="bg-yellow-500"
                                        style={{ width: `${source.neutral}%` }}
                                    />
                                    <div
                                        className="bg-red-500"
                                        style={{ width: `${source.negative}%` }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}