import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Compass, BookOpen, FileText, Lightbulb, ArrowRight, Clock, Star, Zap, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Discover() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [curatedContent, setCuratedContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [insights, setInsights] = useState(null);

    const t = {
        pt: {
            title: 'Descobrir',
            subtitle: 'Conteúdo curado por IA baseado no seu perfil',
            hero: 'Recomendação Destaque',
            learningPath: 'Seu Caminho de Aprendizado',
            serendipity: 'Descobertas Inesperadas',
            trending: 'Em Alta para Você',
            deepDive: 'Mergulho Profundo',
            curatorNote: 'Nota do Curador',
            readTime: 'min de leitura',
            confidence: 'Confiança',
            why: 'Por que agora?',
            explore: 'Explorar',
            refresh: 'Atualizar Recomendações',
            noContent: 'Continue explorando para receber recomendações',
            patterns: 'Seus Padrões de Leitura',
            engagement: 'Engajamento',
            interests: 'Interesses Emergentes'
        },
        en: {
            title: 'Discover',
            subtitle: 'AI-curated content based on your profile',
            hero: 'Featured Recommendation',
            learningPath: 'Your Learning Path',
            serendipity: 'Unexpected Discoveries',
            trending: 'Trending for You',
            deepDive: 'Deep Dive',
            curatorNote: 'Curator\'s Note',
            readTime: 'min read',
            confidence: 'Confidence',
            why: 'Why now?',
            explore: 'Explore',
            refresh: 'Refresh Recommendations',
            noContent: 'Keep exploring to receive recommendations',
            patterns: 'Your Reading Patterns',
            engagement: 'Engagement',
            interests: 'Emerging Interests'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadCuratedContent();
    }, []);

    const loadCuratedContent = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('curateDiscoverContent');
            setCuratedContent(response.data.curated_content);
            setInsights(response.data.pattern_insights);
        } catch (error) {
            console.error('Error loading curated content:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar' : 'Error loading');
        } finally {
            setIsLoading(false);
        }
    };

    const getContentIcon = (type) => {
        const icons = {
            book: BookOpen,
            publication: FileText,
            article: FileText,
            neologism: Lightbulb,
            concept: Lightbulb
        };
        return icons[type] || FileText;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#002D62] mx-auto mb-4" />
                    <p className="text-gray-600">{lang === 'pt' ? 'Curando conteúdo...' : 'Curating content...'}</p>
                </div>
            </div>
        );
    }

    if (!curatedContent) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
                <div className="max-w-7xl mx-auto text-center py-20">
                    <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">{text.noContent}</h2>
                    <Link to={createPageUrl('Dashboard')}>
                        <Button className="mt-4 bg-[#002D62]">
                            {lang === 'pt' ? 'Voltar ao Dashboard' : 'Back to Dashboard'}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#002D62] flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                            {text.title}
                        </h1>
                        <p className="text-sm text-gray-600">{text.subtitle}</p>
                    </div>
                    <Button onClick={loadCuratedContent} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {text.refresh}
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Insights Bar */}
                {insights && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-gradient-to-r from-[#002D62]/5 to-[#00654A]/5 border-[#002D62]/20">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-[#002D62]" />
                                        <span className="font-medium">{text.engagement}:</span>
                                        <Badge variant="secondary">{insights.engagementLevel}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#002D62]" />
                                        <span className="font-medium">{insights.avgSessionDuration} min/sessão</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                                        <span className="font-medium">{text.interests}:</span>
                                        {insights.emergingInterests.map((interest, idx) => (
                                            <Badge key={idx} className="bg-[#D4AF37] text-white">{interest}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Hero Recommendation */}
                {curatedContent.hero && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="overflow-hidden border-2 border-[#D4AF37] shadow-xl">
                            <div className="bg-gradient-to-r from-[#002D62] to-[#00654A] p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-5 h-5 text-[#D4AF37]" />
                                    <h2 className="text-xl font-bold text-white">{text.hero}</h2>
                                </div>
                                <Badge className="bg-[#D4AF37] text-[#002D62]">
                                    {text.confidence}: {(curatedContent.hero.confidence_score * 100).toFixed(0)}%
                                </Badge>
                            </div>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {React.createElement(getContentIcon(curatedContent.hero.content_type), { className: "w-5 h-5 text-[#002D62]" })}
                                            <Badge variant="outline">{curatedContent.hero.content_type}</Badge>
                                        </div>
                                        <h3 className="text-2xl font-bold text-[#002D62] mb-3">
                                            {curatedContent.hero.content.title || curatedContent.hero.content.term}
                                        </h3>
                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                            {curatedContent.hero.content.description || curatedContent.hero.content.definition}
                                        </p>
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                                            <p className="text-sm font-semibold text-blue-900 mb-1">{text.why}</p>
                                            <p className="text-sm text-blue-800">{curatedContent.hero.curation_reason}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {curatedContent.hero.consumption_time && (
                                                <Badge variant="secondary">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {curatedContent.hero.consumption_time} {text.readTime}
                                                </Badge>
                                            )}
                                            {curatedContent.hero.themes?.map((theme, idx) => (
                                                <Badge key={idx} className="bg-[#00654A] text-white">{theme}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <Button size="lg" className="bg-[#D4AF37] hover:bg-[#C19B2A] text-[#002D62]">
                                        {text.explore}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Curator's Note */}
                {curatedContent.curator_note && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-purple-900 mb-1">{text.curatorNote}</p>
                                        <p className="text-sm text-purple-800 leading-relaxed">{curatedContent.curator_note}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Learning Path */}
                {curatedContent.learning_path?.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-[#002D62] mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            {text.learningPath}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {curatedContent.learning_path.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="hover:shadow-lg transition-all border-l-4 border-[#002D62]">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge className="bg-[#002D62] text-white">Step {item.sequence_order}</Badge>
                                                        {React.createElement(getContentIcon(item.content_type), { className: "w-4 h-4" })}
                                                    </div>
                                                    <CardTitle className="text-base">
                                                        {item.content.title || item.content.term}
                                                    </CardTitle>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-3">{item.curation_reason}</p>
                                            <Button size="sm" variant="outline" className="w-full">
                                                {text.explore}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Serendipity & Trending Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Serendipity */}
                    {curatedContent.serendipity?.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-[#002D62] mb-4 flex items-center gap-2">
                                <Compass className="w-5 h-5" />
                                {text.serendipity}
                            </h2>
                            <div className="space-y-3">
                                {curatedContent.serendipity.map((item, idx) => (
                                    <Card key={idx} className="hover:border-[#8B1538] transition-all">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold text-[#002D62] mb-2">
                                                {item.content.title || item.content.term}
                                            </h4>
                                            <p className="text-xs text-gray-600 mb-2">{item.curation_reason}</p>
                                            <Badge variant="secondary" className="text-xs">{item.surprise_factor}</Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Trending */}
                    {curatedContent.trending?.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-[#002D62] mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                {text.trending}
                            </h2>
                            <div className="space-y-3">
                                {curatedContent.trending.map((item, idx) => (
                                    <Card key={idx} className="hover:border-[#00654A] transition-all">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-[#002D62]">
                                                    {item.content.title || item.content.term}
                                                </h4>
                                                <Badge className="bg-[#00654A] text-white">
                                                    {(item.popularity_score * 100).toFixed(0)}%
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Deep Dive */}
                {curatedContent.deep_dive?.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-[#002D62] mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            {text.deepDive}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {curatedContent.deep_dive.map((item, idx) => (
                                <Card key={idx} className="border-2 border-[#8B1538]/20 hover:border-[#8B1538] transition-all">
                                    <CardContent className="p-6">
                                        <Badge className="bg-[#8B1538] text-white mb-3">{item.complexity_level}</Badge>
                                        <h4 className="font-bold text-[#002D62] mb-2">
                                            {item.content.title || item.content.term}
                                        </h4>
                                        <Button variant="outline" className="w-full mt-4">
                                            {text.explore}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}