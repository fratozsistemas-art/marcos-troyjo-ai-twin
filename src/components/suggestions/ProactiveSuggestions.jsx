import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Loader2, TrendingUp, Lightbulb, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { generateProactiveSuggestion } from '@/components/intelligence/TopicTracker';

export default function ProactiveSuggestions({ lang = 'pt' }) {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [proactiveSuggestion, setProactiveSuggestion] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    const translations = {
        pt: {
            title: 'Sugestões Inteligentes',
            description: 'Baseadas no seu histórico e interesses',
            topics: 'Tópicos Relevantes',
            documents: 'Documentos Sugeridos',
            functions: 'Funções Recomendadas',
            insights: 'Análise de Uso',
            loading: 'Analisando...',
            refresh: 'Atualizar'
        },
        en: {
            title: 'Smart Suggestions',
            description: 'Based on your history and interests',
            topics: 'Relevant Topics',
            documents: 'Suggested Documents',
            functions: 'Recommended Functions',
            insights: 'Usage Analysis',
            loading: 'Analyzing...',
            refresh: 'Refresh'
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadSuggestions();
        loadProactiveSuggestion();
    }, []);

    const loadProactiveSuggestion = async () => {
        try {
            const user = await base44.auth.me();
            const suggestion = await generateProactiveSuggestion(user.email, lang);
            setProactiveSuggestion(suggestion);
        } catch (error) {
            console.error('Error loading proactive suggestion:', error);
        }
    };

    const loadSuggestions = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('generateProactiveSuggestions', {});
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error loading suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const functionRoutes = {
        metaphors: 'MetaphorsGenerator',
        interview: 'InterviewPrep',
        article: 'ArticleGenerator',
        assessment: 'DocumentAssessment'
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    <span className="ml-2 text-sm">{t.loading}</span>
                </CardContent>
            </Card>
        );
    }

    if (!suggestions) return null;

    return (
        <>
            {/* Proactive Suggestion Banner */}
            {proactiveSuggestion && !dismissed && (
                <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Lightbulb className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-[#002D62] mb-1">
                                        {lang === 'pt' ? '💡 Sugestão Inteligente' : '💡 Smart Suggestion'}
                                    </h4>
                                    <p className="text-sm text-gray-700 mb-3">{proactiveSuggestion}</p>
                                    <Link to={createPageUrl('Consultation')}>
                                        <Button size="sm" className="bg-[#002D62]">
                                            {lang === 'pt' ? 'Explorar agora' : 'Explore now'}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDismissed(true)}
                                className="ml-2"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Sparkles className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Button onClick={loadSuggestions} variant="outline" size="sm">
                        {t.refresh}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Topics */}
                {suggestions.suggested_topics?.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm text-[#002D62] mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            {t.topics}
                        </h4>
                        <div className="space-y-2">
                            {suggestions.suggested_topics.map((topic, i) => (
                                <div key={i} className="p-3 rounded-lg border border-gray-100 hover:border-[#002D62]/20 transition-colors">
                                    <h5 className="font-medium text-sm text-[#333F48] mb-1">{topic.title}</h5>
                                    <p className="text-xs text-gray-600 mb-2">{topic.description}</p>
                                    <Badge variant="outline" className="text-xs">
                                        {topic.relevance_reason}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Documents */}
                {suggestions.suggested_documents?.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm text-[#002D62] mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {t.documents}
                        </h4>
                        <div className="space-y-2">
                            {suggestions.suggested_documents.map((doc, i) => (
                                <div key={i} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                    <h5 className="font-medium text-sm text-[#333F48] mb-1">{doc.title}</h5>
                                    <p className="text-xs text-gray-600">{doc.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Functions */}
                {suggestions.recommended_functions?.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm text-[#002D62] mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            {t.functions}
                        </h4>
                        <div className="grid gap-2">
                            {suggestions.recommended_functions.map((func, i) => (
                                <Link key={i} to={createPageUrl(functionRoutes[func.function_type])}>
                                    <div className="p-3 rounded-lg border border-gray-200 hover:border-[#002D62] hover:bg-gray-50 transition-colors cursor-pointer">
                                        <p className="text-sm text-[#333F48]">{func.use_case}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Insights */}
                {suggestions.usage_insights && (
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                        <p className="text-sm text-[#333F48] leading-relaxed">
                            {suggestions.usage_insights}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
        </>
    );
}