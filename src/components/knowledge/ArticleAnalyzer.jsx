import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Tag, Link2 } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        analyze: 'Analisar Artigo',
        analyzing: 'Analisando...',
        summary: 'Resumo Automático',
        suggestedTags: 'Tags Sugeridas',
        relatedArticles: 'Artigos Relacionados',
        noSummary: 'Clique em "Analisar" para gerar resumo',
        applyTags: 'Aplicar Tags',
        applied: 'Aplicado!'
    },
    en: {
        analyze: 'Analyze Article',
        analyzing: 'Analyzing...',
        summary: 'Auto Summary',
        suggestedTags: 'Suggested Tags',
        relatedArticles: 'Related Articles',
        noSummary: 'Click "Analyze" to generate summary',
        applyTags: 'Apply Tags',
        applied: 'Applied!'
    }
};

export default function ArticleAnalyzer({ articleId, article, lang = 'pt', onUpdate }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [summary, setSummary] = useState(null);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [applyingTags, setApplyingTags] = useState(false);
    const t = translations[lang];

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            // Generate summary
            const summaryResult = await base44.integrations.Core.InvokeLLM({
                prompt: `Analise o seguinte artigo e forneça:
1. Um resumo executivo de 2-3 linhas
2. 5-8 tags relevantes (palavras-chave)
3. Conceitos principais abordados

Artigo:
Título: ${article.title}
Conteúdo: ${article.body}`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        summary: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        concepts: { type: 'array', items: { type: 'string' } }
                    }
                }
            });

            setSummary(summaryResult.summary);
            setSuggestedTags(summaryResult.tags || []);

            // Find related articles
            const allArticles = await base44.entities.Article.filter({
                status: 'publicado'
            });
            
            const relatedPrompt = `Compare este artigo com a lista e identifique os 3 mais relacionados:

Artigo atual: ${article.title}
Tags: ${summaryResult.tags?.join(', ')}
Conceitos: ${summaryResult.concepts?.join(', ')}

Outros artigos:
${allArticles.filter(a => a.id !== articleId).map(a => `ID: ${a.id}, Título: ${a.title}, Tags: ${a.tags?.join(', ')}`).join('\n')}

Retorne apenas os IDs dos 3 artigos mais relacionados.`;

            const relatedResult = await base44.integrations.Core.InvokeLLM({
                prompt: relatedPrompt,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        related_ids: { type: 'array', items: { type: 'string' } }
                    }
                }
            });

            const related = allArticles.filter(a => relatedResult.related_ids?.includes(a.id));
            setRelatedArticles(related);

            toast.success(lang === 'pt' ? 'Análise completa!' : 'Analysis complete!');
        } catch (error) {
            console.error('Error analyzing:', error);
            toast.error('Error analyzing article');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleApplyTags = async () => {
        setApplyingTags(true);
        try {
            const currentTags = article.tags || [];
            const newTags = [...new Set([...currentTags, ...suggestedTags])];
            
            await base44.entities.Article.update(articleId, {
                tags: newTags,
                summary: summary || article.summary
            });

            // Create bidirectional links with related articles
            for (const relatedArticle of relatedArticles) {
                const currentLinks = relatedArticle.related_articles || [];
                if (!currentLinks.includes(articleId)) {
                    await base44.entities.Article.update(relatedArticle.id, {
                        related_articles: [...currentLinks, articleId]
                    });
                }
            }

            const currentLinks = article.related_articles || [];
            const newLinks = [...new Set([...currentLinks, ...relatedArticles.map(a => a.id)])];
            await base44.entities.Article.update(articleId, {
                related_articles: newLinks
            });

            toast.success(t.applied);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error applying tags:', error);
            toast.error('Error');
        } finally {
            setApplyingTags(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="w-full gap-2"
            >
                {analyzing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.analyzing}
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        {t.analyze}
                    </>
                )}
            </Button>

            {summary && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t.summary}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-700">{summary}</p>
                    </CardContent>
                </Card>
            )}

            {suggestedTags.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                {t.suggestedTags}
                            </CardTitle>
                            <Button 
                                size="sm" 
                                onClick={handleApplyTags}
                                disabled={applyingTags}
                            >
                                {applyingTags ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    t.applyTags
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {suggestedTags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {relatedArticles.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Link2 className="w-4 h-4" />
                            {t.relatedArticles}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {relatedArticles.map(relArticle => (
                                <div key={relArticle.id} className="p-2 border rounded hover:bg-gray-50">
                                    <p className="text-sm font-medium">{relArticle.title}</p>
                                    {relArticle.summary && (
                                        <p className="text-xs text-gray-500 mt-1">{relArticle.summary}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}