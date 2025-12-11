import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, RefreshCw, Loader2, Book, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ProactiveKnowledgeBase({ lang = 'pt' }) {
    const [articles, setArticles] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadKnowledgeBase();
    }, []);

    const loadKnowledgeBase = async () => {
        setLoading(true);
        try {
            const kb = await base44.entities.Article.filter({
                tags: { $in: ['knowledge-base'] }
            }, '-created_date', 20);
            setArticles(kb);
        } catch (error) {
            console.error('Error loading knowledge base:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateArticles = async () => {
        setGenerating(true);
        try {
            const response = await base44.functions.invoke('generateKnowledgeArticles', {});
            if (response.data.success) {
                toast.success(`${response.data.generated_articles} artigos gerados!`);
                await loadKnowledgeBase();
            }
        } catch (error) {
            console.error('Error generating:', error);
            toast.error('Erro ao gerar artigos');
        } finally {
            setGenerating(false);
        }
    };

    const t = {
        pt: {
            title: 'Base de Conhecimento Proativa',
            generate: 'Gerar Artigos',
            generating: 'Gerando...',
            noArticles: 'Nenhum artigo ainda',
            themes: 'Temas Emergentes',
            insights: 'Insights-Chave',
            faqs: 'FAQs'
        },
        en: {
            title: 'Proactive Knowledge Base',
            generate: 'Generate Articles',
            generating: 'Generating...',
            noArticles: 'No articles yet',
            themes: 'Emerging Themes',
            insights: 'Key Insights',
            faqs: 'FAQs'
        }
    };

    const text = t[lang];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <Brain className="w-5 h-5" />
                        {text.title}
                    </CardTitle>
                    <div className="flex gap-2">
                        <Link to={createPageUrl('KnowledgeBase')}>
                            <Button size="sm" variant="outline">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver Tudo
                            </Button>
                        </Link>
                        <Button
                            onClick={generateArticles}
                            disabled={generating}
                            size="sm"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {text.generating}
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {text.generate}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {text.noArticles}
                    </div>
                ) : (
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                            {articles.map((article, idx) => (
                                <Card key={idx} className="border-blue-100">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-sm">{article.title}</h4>
                                            <Badge variant="secondary" className="text-xs">
                                                AI Generated
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3">{article.summary}</p>
                                        {article.tags && (
                                            <div className="flex gap-1 flex-wrap">
                                                {article.tags.filter(t => t !== 'knowledge-base' && t !== 'ai-generated').map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}