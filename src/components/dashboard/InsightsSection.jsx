import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Link2, Target, Loader2, RefreshCw } from 'lucide-react';

const categoryIcons = {
    pattern: TrendingUp,
    trend: Sparkles,
    connection: Link2,
    recommendation: Target
};

const categoryColors = {
    pattern: 'bg-blue-50 text-blue-700 border-blue-200',
    trend: 'bg-purple-50 text-purple-700 border-purple-200',
    connection: 'bg-green-50 text-green-700 border-green-200',
    recommendation: 'bg-amber-50 text-amber-700 border-amber-200'
};

const translations = {
    pt: {
        title: "Insights de IA",
        desc: "Análise automática de padrões nas suas conversas",
        generate: "Gerar Novos Insights",
        generating: "Analisando conversas...",
        noInsights: "Nenhum insight gerado ainda",
        noInsightsDesc: "Clique no botão para analisar suas conversas e gerar insights personalizados",
        categories: {
            pattern: "Padrão",
            trend: "Tendência",
            connection: "Conexão",
            recommendation: "Recomendação"
        },
        lastGenerated: "Último insight gerado em",
        error: "Erro ao gerar insights"
    },
    en: {
        title: "AI Insights",
        desc: "Automatic pattern analysis from your conversations",
        generate: "Generate New Insights",
        generating: "Analyzing conversations...",
        noInsights: "No insights generated yet",
        noInsightsDesc: "Click the button to analyze your conversations and generate personalized insights",
        categories: {
            pattern: "Pattern",
            trend: "Trend",
            connection: "Connection",
            recommendation: "Recommendation"
        },
        lastGenerated: "Last insight generated on",
        error: "Error generating insights"
    }
};

export default function InsightsSection({ lang = 'pt' }) {
    const t = translations[lang];
    const [insights, setInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        setIsLoading(true);
        try {
            const data = await base44.entities.Insight.list('-created_date', 5);
            setInsights(data || []);
        } catch (error) {
            console.error('Error loading insights:', error);
            setInsights([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateInsights = async () => {
        setIsGenerating(true);
        try {
            await base44.functions.invoke('generateInsights', {});
            await loadInsights();
        } catch (error) {
            console.error('Error generating insights:', error);
            alert(t.error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Sparkles className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.desc}</CardDescription>
                    </div>
                    <Button
                        onClick={handleGenerateInsights}
                        disabled={isGenerating}
                        size="sm"
                        className="bg-[#002D62] hover:bg-[#001d42]"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.generating}
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {t.generate}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {insights.length === 0 ? (
                    <div className="text-center py-6">
                        <Sparkles className="w-12 h-12 text-[#333F48]/20 mx-auto mb-3" />
                        <p className="text-sm text-[#333F48]/60 mb-1">{t.noInsights}</p>
                        <p className="text-xs text-[#333F48]/40">{t.noInsightsDesc}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {insights.map((insight, index) => {
                                const Icon = categoryIcons[insight.category] || Sparkles;
                                const colorClass = categoryColors[insight.category] || categoryColors.pattern;
                                
                                return (
                                    <motion.div
                                        key={insight.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-4 rounded-lg border border-gray-100 hover:border-[#002D62]/20 hover:shadow-sm transition-all bg-gradient-to-br from-white to-gray-50/30"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${colorClass} border flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="font-semibold text-sm text-[#002D62]">
                                                        {insight.title}
                                                    </h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {t.categories[insight.category]}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-[#333F48] leading-relaxed mb-2">
                                                    {insight.content}
                                                </p>
                                                {insight.topics && insight.topics.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {insight.topics.map((topic, idx) => (
                                                            <Badge 
                                                                key={idx} 
                                                                variant="secondary" 
                                                                className="text-xs px-2 py-0.5"
                                                            >
                                                                {topic}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-xs text-[#333F48]/40 mt-2">
                                                    {t.lastGenerated} {new Date(insight.created_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}