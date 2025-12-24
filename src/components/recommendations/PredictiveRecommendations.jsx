import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, BookOpen, FileText, Search, RefreshCw, X, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PredictiveRecommendations = ({ lang = 'pt' }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const navigate = useNavigate();

    const t = {
        pt: {
            title: 'Recomendações Preditivas',
            description: 'Sugestões personalizadas baseadas no seu histórico e perfil',
            generate: 'Gerar Novas Recomendações',
            generating: 'Gerando...',
            noRecommendations: 'Nenhuma recomendação disponível',
            generateFirst: 'Clique em "Gerar" para receber recomendações personalizadas',
            confidence: 'Confiança',
            reasoning: 'Por que isso é relevante',
            dismiss: 'Dispensar',
            accept: 'Aceitar',
            view: 'Visualizar',
            types: {
                consultation_topic: 'Tópico de Consulta',
                article: 'Artigo',
                study_module: 'Módulo de Estudo',
                document: 'Documento',
                research_area: 'Área de Pesquisa'
            }
        },
        en: {
            title: 'Predictive Recommendations',
            description: 'Personalized suggestions based on your history and profile',
            generate: 'Generate New Recommendations',
            generating: 'Generating...',
            noRecommendations: 'No recommendations available',
            generateFirst: 'Click "Generate" to receive personalized recommendations',
            confidence: 'Confidence',
            reasoning: 'Why this is relevant',
            dismiss: 'Dismiss',
            accept: 'Accept',
            view: 'View',
            types: {
                consultation_topic: 'Consultation Topic',
                article: 'Article',
                study_module: 'Study Module',
                document: 'Document',
                research_area: 'Research Area'
            }
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const recs = await base44.entities.PredictiveRecommendation.filter(
                { user_email: user.email, status: 'pending' },
                '-priority',
                10
            );
            setRecommendations(recs);
        } catch (error) {
            console.error('Error loading recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await base44.functions.invoke('generatePredictiveRecommendations', {});
            toast.success(lang === 'pt' ? 'Recomendações geradas com sucesso!' : 'Recommendations generated successfully!');
            await loadRecommendations();
        } catch (error) {
            console.error('Error generating recommendations:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar recomendações' : 'Error generating recommendations');
        } finally {
            setGenerating(false);
        }
    };

    const handleDismiss = async (recId) => {
        try {
            await base44.entities.PredictiveRecommendation.update(recId, { status: 'dismissed' });
            setRecommendations(recommendations.filter(r => r.id !== recId));
            toast.success(lang === 'pt' ? 'Recomendação dispensada' : 'Recommendation dismissed');
        } catch (error) {
            console.error('Error dismissing recommendation:', error);
        }
    };

    const handleAccept = async (rec) => {
        try {
            await base44.entities.PredictiveRecommendation.update(rec.id, { 
                status: 'accepted',
                action_taken: 'clicked'
            });
            
            // Navegar para o conteúdo apropriado
            if (rec.recommendation_type === 'consultation_topic') {
                navigate(createPageUrl('Consultation') + `?topic=${encodeURIComponent(rec.title)}`);
            } else if (rec.recommendation_type === 'study_module') {
                navigate(createPageUrl('StudyMode'));
            }
            
            setRecommendations(recommendations.filter(r => r.id !== rec.id));
        } catch (error) {
            console.error('Error accepting recommendation:', error);
        }
    };

    const getTypeIcon = (type) => {
        const icons = {
            consultation_topic: <Sparkles className="w-4 h-4" />,
            article: <FileText className="w-4 h-4" />,
            study_module: <BookOpen className="w-4 h-4" />,
            document: <FileText className="w-4 h-4" />,
            research_area: <Search className="w-4 h-4" />
        };
        return icons[type] || <TrendingUp className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
                    <p className="text-gray-500">{lang === 'pt' ? 'Carregando...' : 'Loading...'}</p>
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
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.description}</CardDescription>
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                    >
                        {generating ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                {text.generating}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {text.generate}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {recommendations.length === 0 ? (
                    <div className="text-center py-12">
                        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">{text.noRecommendations}</p>
                        <p className="text-sm text-gray-400">{text.generateFirst}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((rec, idx) => (
                            <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="mt-1">
                                                    {getTypeIcon(rec.recommendation_type)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-1">
                                                        {rec.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {rec.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <Badge variant="outline" className="text-xs">
                                                            {text.types[rec.recommendation_type]}
                                                        </Badge>
                                                        <Badge 
                                                            className="text-xs"
                                                            style={{
                                                                backgroundColor: rec.confidence_score > 0.8 ? '#10b981' : 
                                                                                rec.confidence_score > 0.6 ? '#f59e0b' : '#6b7280'
                                                            }}
                                                        >
                                                            {text.confidence}: {Math.round(rec.confidence_score * 100)}%
                                                        </Badge>
                                                    </div>
                                                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                                        <p className="text-xs font-medium text-blue-900 mb-1">
                                                            {text.reasoning}:
                                                        </p>
                                                        <p className="text-xs text-blue-800">
                                                            {rec.reasoning}
                                                        </p>
                                                    </div>
                                                    {rec.relevance_factors && rec.relevance_factors.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {rec.relevance_factors.map((factor, i) => (
                                                                <Badge key={i} variant="secondary" className="text-xs">
                                                                    {factor}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDismiss(rec.id)}
                                                className="gap-2"
                                            >
                                                <X className="w-3 h-3" />
                                                {text.dismiss}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAccept(rec)}
                                                className="gap-2 bg-blue-500 hover:bg-blue-600"
                                            >
                                                <Check className="w-3 h-3" />
                                                {text.accept}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PredictiveRecommendations;