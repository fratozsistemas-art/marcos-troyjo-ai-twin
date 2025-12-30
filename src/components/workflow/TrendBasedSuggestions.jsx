import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { TrendingUp, Lightbulb, AlertCircle, RefreshCw, Loader2, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function TrendBasedSuggestions({ lang = 'pt' }) {
    const [loading, setLoading] = useState(false);
    const [trends, setTrends] = useState(null);

    const t = {
        pt: {
            title: 'Sugestões Baseadas em Tendências',
            analyze: 'Analisar Tendências',
            analyzing: 'Analisando...',
            trends: 'Tendências Emergentes',
            gaps: 'Lacunas de Conteúdo',
            updates: 'Recomendações de Atualização',
            contentIdeas: 'Ideias de Conteúdo',
            relevance: 'Relevância',
            momentum: 'Momentum',
            priority: 'Prioridade',
            noData: 'Execute a análise para ver sugestões'
        },
        en: {
            title: 'Trend-Based Suggestions',
            analyze: 'Analyze Trends',
            analyzing: 'Analyzing...',
            trends: 'Emerging Trends',
            gaps: 'Content Gaps',
            updates: 'Update Recommendations',
            contentIdeas: 'Content Ideas',
            relevance: 'Relevance',
            momentum: 'Momentum',
            priority: 'Priority',
            noData: 'Run analysis to see suggestions'
        }
    }[lang];

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('analyzeTrendsAndSuggest', {
                timeframe: 30,
                min_relevance: 0.6
            });

            if (response.data.success) {
                setTrends(response.data);
                toast.success(
                    lang === 'pt'
                        ? `${response.data.emerging_trends?.length || 0} tendências identificadas!`
                        : `${response.data.emerging_trends?.length || 0} trends identified!`
                );
            }
        } catch (error) {
            console.error('Error analyzing trends:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        {t.title}
                    </CardTitle>
                    <Button
                        onClick={handleAnalyze}
                        disabled={loading}
                        size="sm"
                        className="gap-2"
                    >
                        {loading ? (
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
            </CardHeader>
            <CardContent>
                {!trends ? (
                    <div className="text-center py-8 text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">{t.noData}</p>
                    </div>
                ) : (
                    <Tabs defaultValue="trends" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="trends">{t.trends}</TabsTrigger>
                            <TabsTrigger value="gaps">{t.gaps}</TabsTrigger>
                            <TabsTrigger value="updates">{t.updates}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="trends" className="space-y-4 mt-4">
                            {trends.emerging_trends?.map((trend, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">{trend.trend_name}</h4>
                                        <Badge variant="outline">{trend.momentum}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{trend.description}</p>

                                    <div className="space-y-2">
                                        <h5 className="text-xs font-semibold text-gray-700">{t.contentIdeas}:</h5>
                                        {trend.content_ideas?.map((idea, ideaIdx) => (
                                            <div key={ideaIdx} className="p-3 bg-white rounded-lg border">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h6 className="font-medium text-sm">{idea.title}</h6>
                                                    <Badge className="text-xs">
                                                        {Math.round(idea.relevance_score * 100)}%
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-2">{idea.summary}</p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {idea.content_type}
                                                    </Badge>
                                                    {idea.suggested_tags?.slice(0, 3).map((tag, tagIdx) => (
                                                        <Badge key={tagIdx} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </TabsContent>

                        <TabsContent value="gaps" className="space-y-3 mt-4">
                            {trends.content_gaps?.map((gap, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle className="w-4 h-4 text-orange-600" />
                                        <h5 className="font-semibold text-sm text-orange-900">{gap.topic}</h5>
                                        <Badge variant="outline" className="ml-auto">
                                            {gap.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-orange-800">{gap.reason}</p>
                                </motion.div>
                            ))}
                            {(!trends.content_gaps || trends.content_gaps.length === 0) && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    {lang === 'pt' ? 'Nenhuma lacuna identificada' : 'No gaps identified'}
                                </p>
                            )}
                        </TabsContent>

                        <TabsContent value="updates" className="space-y-3 mt-4">
                            {trends.update_recommendations?.map((rec, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 border rounded-lg bg-green-50"
                                >
                                    <h5 className="font-semibold text-sm text-green-900 mb-2">
                                        {rec.article_title}
                                    </h5>
                                    <p className="text-xs text-green-800 mb-2">{rec.reason}</p>
                                    <ul className="text-xs text-green-700 space-y-1">
                                        {rec.suggested_updates?.map((update, uIdx) => (
                                            <li key={uIdx} className="flex items-start gap-2">
                                                <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                {update}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                            {(!trends.update_recommendations || trends.update_recommendations.length === 0) && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    {lang === 'pt' ? 'Nenhuma atualização recomendada' : 'No updates recommended'}
                                </p>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}