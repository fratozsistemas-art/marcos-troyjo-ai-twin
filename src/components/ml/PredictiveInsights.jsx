import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, AlertTriangle, FileText, Target, 
    Loader2, RefreshCw, ChevronRight, Sparkles,
    BarChart3, Activity, Clock, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import XAIExplainer from './XAIExplainer';

const CATEGORY_CONFIG = {
    market_trends: {
        icon: TrendingUp,
        color: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        label: { pt: 'Tendências de Mercado', en: 'Market Trends' }
    },
    geopolitical_risk: {
        icon: AlertTriangle,
        color: 'from-red-500 to-orange-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        label: { pt: 'Riscos Geopolíticos', en: 'Geopolitical Risks' }
    },
    policy_impact: {
        icon: FileText,
        color: 'from-purple-500 to-pink-500',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        label: { pt: 'Impacto de Políticas', en: 'Policy Impact' }
    },
    opportunity: {
        icon: Target,
        color: 'from-green-500 to-emerald-500',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        label: { pt: 'Oportunidades', en: 'Opportunities' }
    }
};

export default function PredictiveInsights({ lang = 'pt' }) {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [expanded, setExpanded] = useState(null);

    const t = {
        pt: {
            title: 'Insights Preditivos',
            subtitle: 'Previsões baseadas em Machine Learning',
            generate: 'Gerar Novas Previsões',
            generating: 'Gerando...',
            confidence: 'Confiança',
            impact: 'Impacto',
            timeframe: 'Prazo',
            indicators: 'Indicadores-Chave',
            actions: 'Ações Recomendadas',
            noPredictions: 'Nenhuma previsão disponível',
            generateFirst: 'Gere previsões para começar',
            high: 'Alto',
            medium: 'Médio',
            low: 'Baixo',
            lastGenerated: 'Última atualização',
            poweredBy: 'Powered by AI'
        },
        en: {
            title: 'Predictive Insights',
            subtitle: 'ML-powered forecasts',
            generate: 'Generate New Predictions',
            generating: 'Generating...',
            confidence: 'Confidence',
            impact: 'Impact',
            timeframe: 'Timeframe',
            indicators: 'Key Indicators',
            actions: 'Recommended Actions',
            noPredictions: 'No predictions available',
            generateFirst: 'Generate predictions to start',
            high: 'High',
            medium: 'Medium',
            low: 'Low',
            lastGenerated: 'Last updated',
            poweredBy: 'Powered by AI'
        }
    }[lang];

    useEffect(() => {
        loadPredictions();
    }, []);

    const loadPredictions = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const recs = await base44.entities.PredictiveRecommendation.filter({
                user_email: user.email,
                status: 'pending'
            });
            
            // Sort by priority and created date
            const sorted = (recs || []).sort((a, b) => {
                if (b.priority !== a.priority) return b.priority - a.priority;
                return new Date(b.created_date) - new Date(a.created_date);
            });
            
            setPredictions(sorted);
        } catch (error) {
            console.error('Error loading predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePredictions = async () => {
        setGenerating(true);
        try {
            const response = await base44.functions.invoke('generatePredictiveInsights', {
                context_type: 'comprehensive',
                timeframe: '30_days'
            });

            if (response.data.success) {
                toast.success(lang === 'pt' 
                    ? `${response.data.predictions.length} previsões geradas!` 
                    : `${response.data.predictions.length} predictions generated!`
                );
                loadPredictions();
            }
        } catch (error) {
            console.error('Error generating predictions:', error);
            toast.error(error.message);
        } finally {
            setGenerating(false);
        }
    };

    const getConfidenceColor = (score) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.5) return 'text-yellow-600';
        return 'text-orange-600';
    };

    const getConfidenceLabel = (score) => {
        if (score >= 0.8) return t.high;
        if (score >= 0.5) return t.medium;
        return t.low;
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <CardTitle className="text-white">{t.title}</CardTitle>
                            <CardDescription className="text-white/80 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                {t.subtitle}
                            </CardDescription>
                        </div>
                    </div>
                    <Button
                        onClick={handleGeneratePredictions}
                        disabled={generating}
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t.generating}
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                {t.generate}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : predictions.length === 0 ? (
                    <div className="text-center py-12">
                        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">{t.noPredictions}</p>
                        <p className="text-sm text-gray-500 mb-4">{t.generateFirst}</p>
                        <Button onClick={handleGeneratePredictions} disabled={generating}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {t.generate}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {predictions.slice(0, 5).map((prediction, index) => {
                                const category = prediction.recommendation_type || 'opportunity';
                                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.opportunity;
                                const Icon = config.icon;
                                const isExpanded = expanded === prediction.id;

                                return (
                                    <motion.div
                                        key={prediction.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`rounded-lg border-2 ${config.border} ${config.bg} p-4 hover:shadow-md transition-all cursor-pointer`}
                                        onClick={() => setExpanded(isExpanded ? null : prediction.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <Badge variant="outline" className="mb-2 text-xs">
                                                            {config.label[lang]}
                                                        </Badge>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                            {prediction.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {prediction.description}
                                                        </p>
                                                    </div>
                                                    <ChevronRight 
                                                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                                                    />
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                                    <div className="flex items-center gap-1">
                                                        <Activity className="w-3 h-3" />
                                                        <span className={getConfidenceColor(prediction.confidence_score)}>
                                                            {t.confidence}: {getConfidenceLabel(prediction.confidence_score)}
                                                        </span>
                                                    </div>
                                                    {prediction.metadata?.potential_impact && (
                                                        <div className="flex items-center gap-1">
                                                            <BarChart3 className="w-3 h-3" />
                                                            <span>{t.impact}: {prediction.metadata.potential_impact}/10</span>
                                                        </div>
                                                    )}
                                                    {prediction.metadata?.timeframe && (
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{prediction.metadata.timeframe}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3"
                                                        >
                                                            {/* XAI Explainer */}
                                                            <XAIExplainer 
                                                                prediction={prediction}
                                                                explanation={prediction.reasoning}
                                                                featureImportance={prediction.relevance_factors?.map((f, i) => ({
                                                                    name: f,
                                                                    importance: 0.9 - (i * 0.1)
                                                                })) || []}
                                                                lang={lang}
                                                            />

                                                            {prediction.relevance_factors?.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                                        {t.indicators}:
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {prediction.relevance_factors.map((factor, i) => (
                                                                            <Badge key={i} variant="secondary" className="text-xs">
                                                                                {factor}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {prediction.metadata?.recommended_actions && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                                        {t.actions}:
                                                                    </p>
                                                                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                                        {Array.isArray(prediction.metadata.recommended_actions) 
                                                                            ? prediction.metadata.recommended_actions.map((action, i) => (
                                                                                <li key={i}>{action}</li>
                                                                            ))
                                                                            : <li>{prediction.metadata.recommended_actions}</li>
                                                                        }
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
                                                                <span className="flex items-center gap-1">
                                                                    <Sparkles className="w-3 h-3" />
                                                                    {t.poweredBy}
                                                                </span>
                                                                <span>
                                                                    {new Date(prediction.created_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
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