import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, BookOpen, FileText, Lightbulb, TrendingUp, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PersonalizedRecommendations({ lang = 'pt' }) {
    const [recommendations, setRecommendations] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const t = {
        pt: {
            title: 'Recomendações Personalizadas',
            description: 'Baseado no seu histórico de navegação',
            books: 'Livros Recomendados',
            publications: 'Artigos & Publicações',
            concepts: 'Conceitos para Explorar',
            learningPath: 'Caminho de Aprendizado',
            themes: 'Seus Temas de Interesse',
            why: 'Por que?',
            relevance: 'Relevância',
            view: 'Ver',
            noRecommendations: 'Continue explorando para receber recomendações'
        },
        en: {
            title: 'Personalized Recommendations',
            description: 'Based on your browsing history',
            books: 'Recommended Books',
            publications: 'Articles & Publications',
            concepts: 'Concepts to Explore',
            learningPath: 'Learning Path',
            themes: 'Your Interest Themes',
            why: 'Why?',
            relevance: 'Relevance',
            view: 'View',
            noRecommendations: 'Keep exploring to receive recommendations'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('generatePersonalizedRecommendations');
            setRecommendations(response.data);
        } catch (error) {
            console.error('Error loading recommendations:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar' : 'Error loading');
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

    if (!recommendations || recommendations.interaction_summary.total_interactions === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                        {text.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{text.noRecommendations}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                        {recommendations.interaction_summary.total_interactions} {lang === 'pt' ? 'interações' : 'interactions'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Learning Path */}
                {recommendations.learning_path && (
                    <div className="p-4 bg-gradient-to-r from-[#002D62]/5 to-[#00654A]/5 rounded-lg border border-[#002D62]/10">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-[#002D62] mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-[#002D62] mb-2">{text.learningPath}</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">{recommendations.learning_path}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Thematic Focus */}
                {recommendations.thematic_focus && recommendations.thematic_focus.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-[#002D62] mb-2 text-sm">{text.themes}</h4>
                        <div className="flex flex-wrap gap-2">
                            {recommendations.thematic_focus.map((theme, idx) => (
                                <Badge key={idx} variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                                    {theme}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Books */}
                {recommendations.recommendations.books.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-[#002D62] mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {text.books}
                        </h4>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {recommendations.recommendations.books.map((rec, idx) => (
                                    <motion.div
                                        key={rec.content.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-3 border rounded-lg hover:border-[#002D62] transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-[#002D62] mb-1">{rec.content.title}</h5>
                                                <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>
                                                <Badge variant="secondary" className="text-xs">
                                                    {text.relevance}: {(rec.relevance_score * 100).toFixed(0)}%
                                                </Badge>
                                            </div>
                                            {rec.content.purchase_link && (
                                                <a href={rec.content.purchase_link} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" variant="outline">
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Publications */}
                {recommendations.recommendations.publications.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-[#002D62] mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {text.publications}
                        </h4>
                        <div className="space-y-3">
                            {recommendations.recommendations.publications.map((rec, idx) => (
                                <motion.div
                                    key={rec.content.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-3 border rounded-lg hover:border-[#00654A] transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <h5 className="font-medium text-[#002D62] mb-1">{rec.content.title}</h5>
                                            <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-[#00654A] text-white text-xs">
                                                    {rec.content.type}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                    {text.relevance}: {(rec.relevance_score * 100).toFixed(0)}%
                                                </Badge>
                                            </div>
                                        </div>
                                        {rec.content.url && (
                                            <a href={rec.content.url} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline">
                                                    <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Concepts */}
                {recommendations.recommendations.concepts.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-[#002D62] mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            {text.concepts}
                        </h4>
                        <div className="space-y-3">
                            {recommendations.recommendations.concepts.map((rec, idx) => (
                                <motion.div
                                    key={rec.content.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="p-3 border rounded-lg hover:border-[#8B1538] transition-colors"
                                >
                                    <h5 className="font-medium text-[#002D62] mb-1">
                                        {rec.content.term || rec.content.concept_name}
                                    </h5>
                                    <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>
                                    <Badge variant="secondary" className="text-xs">
                                        {text.relevance}: {(rec.relevance_score * 100).toFixed(0)}%
                                    </Badge>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}