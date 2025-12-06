import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, Calendar, MessageSquare, Loader2, Download, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function TopicDeepDive({ lang = 'pt' }) {
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('weekly');

    const t = {
        pt: {
            title: "Análise Profunda de Tópicos",
            desc: "Insights detalhados sobre suas discussões",
            weekly: "Semanal",
            monthly: "Mensal",
            generate: "Gerar Relatório",
            generating: "Gerando...",
            overview: "Visão Geral",
            recommendations: "Recomendações",
            topTopics: "Principais Tópicos",
            discussions: "discussões",
            keyPoints: "Pontos-Chave",
            excerpts: "Trechos de Conversas",
            trend: "Tendência",
            noData: "Nenhum dado disponível para o período selecionado",
            download: "Baixar Relatório"
        },
        en: {
            title: "Topic Deep Dive",
            desc: "Detailed insights on your discussions",
            weekly: "Weekly",
            monthly: "Monthly",
            generate: "Generate Report",
            generating: "Generating...",
            overview: "Overview",
            recommendations: "Recommendations",
            topTopics: "Top Topics",
            discussions: "discussions",
            keyPoints: "Key Points",
            excerpts: "Conversation Excerpts",
            trend: "Trend",
            noData: "No data available for selected period",
            download: "Download Report"
        }
    }[lang];

    const trendIcons = {
        'increasing': TrendingUp,
        'decreasing': TrendingDown,
        'stable': Minus,
        'up': TrendingUp,
        'down': TrendingDown
    };

    const generateReport = async (period) => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('generateTopicReport', { period });
            setReport(response.data);
            toast.success(lang === 'pt' ? 'Relatório gerado com sucesso!' : 'Report generated successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar relatório' : 'Error generating report');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadReport = () => {
        if (!report) return;
        
        const dataStr = JSON.stringify(report, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `topic_report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'Relatório baixado!' : 'Report downloaded!');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Lightbulb className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.desc}</CardDescription>
                    </div>
                    {report && (
                        <Button variant="outline" size="sm" onClick={downloadReport}>
                            <Download className="w-4 h-4 mr-2" />
                            {t.download}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <TabsList>
                            <TabsTrigger value="weekly">{t.weekly}</TabsTrigger>
                            <TabsTrigger value="monthly">{t.monthly}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button 
                        onClick={() => generateReport(selectedPeriod)}
                        disabled={isLoading}
                        className="w-full bg-[#002D62]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.generating}
                            </>
                        ) : (
                            t.generate
                        )}
                    </Button>

                    {report && (
                        <div className="space-y-4 mt-6">
                            {/* Overview */}
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="text-sm">{t.overview}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-700 leading-relaxed">{report.overview}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-500">{lang === 'pt' ? 'Total de Tópicos' : 'Total Topics'}</p>
                                            <p className="text-2xl font-bold text-[#002D62]">{report.total_topics}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">{lang === 'pt' ? 'Conversas' : 'Conversations'}</p>
                                            <p className="text-2xl font-bold text-[#002D62]">{report.total_conversations}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recommendations */}
                            {report.recommendations && report.recommendations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4 text-amber-500" />
                                            {t.recommendations}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {report.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Top Topics */}
                            <div>
                                <h3 className="text-sm font-semibold text-[#002D62] mb-3">{t.topTopics}</h3>
                                <div className="space-y-4">
                                    {report.top_topics.map((topic, idx) => {
                                        const TrendIcon = trendIcons[topic.trend] || Minus;
                                        return (
                                            <Card key={idx}>
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-base">{topic.topic}</CardTitle>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="gap-1">
                                                                <MessageSquare className="w-3 h-3" />
                                                                {topic.count} {t.discussions}
                                                            </Badge>
                                                            <Badge variant="outline" className="gap-1">
                                                                <TrendIcon className="w-3 h-3" />
                                                                {topic.trend}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {topic.summary}
                                                    </p>

                                                    {topic.key_points && topic.key_points.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-[#002D62] mb-2">
                                                                {t.keyPoints}
                                                            </h4>
                                                            <ul className="space-y-1">
                                                                {topic.key_points.map((point, i) => (
                                                                    <li key={i} className="flex items-start gap-2">
                                                                        <span className="w-1 h-1 rounded-full bg-[#00654A] mt-1.5 flex-shrink-0" />
                                                                        <span className="text-xs text-gray-600">{point}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {topic.excerpts && topic.excerpts.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-[#002D62] mb-2">
                                                                {t.excerpts}
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {topic.excerpts.map((excerpt, i) => (
                                                                    <div key={i} className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                                        <p className="text-xs text-gray-700 italic">
                                                                            "{excerpt.content}"
                                                                        </p>
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            <Calendar className="w-3 h-3 inline mr-1" />
                                                                            {new Date(excerpt.timestamp).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {!report && !isLoading && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            {lang === 'pt' 
                                ? 'Selecione um período e gere seu relatório de análise de tópicos'
                                : 'Select a period and generate your topic analysis report'}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}