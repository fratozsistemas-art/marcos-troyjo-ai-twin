import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Tag, Link2, Download, Users, Building2, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        analyze: 'Análise Completa',
        analyzing: 'Analisando...',
        summary: 'Resumo Automático',
        sentiment: 'Sentimento',
        keyTakeaways: 'Principais Conclusões',
        entities: 'Entidades Extraídas',
        suggestedTags: 'Tags Sugeridas',
        relatedArticles: 'Artigos Relacionados',
        noSummary: 'Clique em "Analisar" para gerar resumo',
        applyTags: 'Aplicar Tags',
        applied: 'Aplicado!',
        exportJson: 'Exportar JSON',
        positive: 'Positivo',
        neutral: 'Neutro',
        negative: 'Negativo',
        people: 'Pessoas',
        organizations: 'Organizações',
        locations: 'Locais'
    },
    en: {
        analyze: 'Full Analysis',
        analyzing: 'Analyzing...',
        summary: 'Auto Summary',
        sentiment: 'Sentiment',
        keyTakeaways: 'Key Takeaways',
        entities: 'Extracted Entities',
        suggestedTags: 'Suggested Tags',
        relatedArticles: 'Related Articles',
        noSummary: 'Click "Analyze" to generate summary',
        applyTags: 'Apply Tags',
        applied: 'Applied!',
        exportJson: 'Export JSON',
        positive: 'Positive',
        neutral: 'Neutral',
        negative: 'Negative',
        people: 'People',
        organizations: 'Organizations',
        locations: 'Locations'
    }
};

export default function ArticleAnalyzer({ articleId, article, lang = 'pt', onUpdate }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [summary, setSummary] = useState(null);
    const [sentiment, setSentiment] = useState(null);
    const [sentimentScore, setSentimentScore] = useState(null);
    const [keyTakeaways, setKeyTakeaways] = useState([]);
    const [extractedEntities, setExtractedEntities] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [applyingTags, setApplyingTags] = useState(false);
    const t = translations[lang];

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            // Enhanced analysis with sentiment, entities, and key takeaways
            const analysisResult = await base44.integrations.Core.InvokeLLM({
                prompt: `Analise profundamente o seguinte artigo e forneça:

1. Um resumo executivo de 2-3 linhas
2. Análise de sentimento (positive/neutral/negative) e um score de -1.0 a 1.0
3. 3-5 principais conclusões (key takeaways) - pontos essenciais do artigo
4. Entidades extraídas:
   - PERSON: pessoas mencionadas (nome completo)
   - ORGANIZATION: organizações, empresas, instituições
   - LOCATION: países, cidades, regiões
   Para cada entidade, conte quantas vezes aparece
5. 5-8 tags relevantes (palavras-chave)
6. Conceitos principais abordados

Artigo:
Título: ${article.title}
Conteúdo: ${article.body}`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        summary: { type: 'string' },
                        sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
                        sentiment_score: { type: 'number' },
                        key_takeaways: { type: 'array', items: { type: 'string' } },
                        extracted_entities: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    type: { type: 'string' },
                                    name: { type: 'string' },
                                    mentions: { type: 'integer' }
                                }
                            }
                        },
                        tags: { type: 'array', items: { type: 'string' } },
                        concepts: { type: 'array', items: { type: 'string' } }
                    }
                }
            });

            setSummary(analysisResult.summary);
            setSentiment(analysisResult.sentiment);
            setSentimentScore(analysisResult.sentiment_score);
            setKeyTakeaways(analysisResult.key_takeaways || []);
            setExtractedEntities(analysisResult.extracted_entities || []);
            setSuggestedTags(analysisResult.tags || []);

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
                summary: summary || article.summary,
                sentiment: sentiment,
                sentiment_score: sentimentScore,
                key_takeaways: keyTakeaways,
                extracted_entities: extractedEntities,
                analysis_metadata: {
                    analyzed_at: new Date().toISOString(),
                    model_version: 'grok-beta'
                }
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

    const handleExportJson = () => {
        const exportData = {
            article_id: articleId,
            title: article.title,
            analysis: {
                summary,
                sentiment,
                sentiment_score: sentimentScore,
                key_takeaways: keyTakeaways,
                extracted_entities: extractedEntities,
                suggested_tags: suggestedTags,
                related_articles: relatedArticles.map(a => ({
                    id: a.id,
                    title: a.title,
                    summary: a.summary
                }))
            },
            analyzed_at: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `article-analysis-${articleId}.json`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'JSON exportado!' : 'JSON exported!');
    };

    const getSentimentIcon = () => {
        if (sentiment === 'positive') return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (sentiment === 'negative') return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-gray-600" />;
    };

    const getSentimentColor = () => {
        if (sentiment === 'positive') return 'bg-green-100 text-green-800 border-green-200';
        if (sentiment === 'negative') return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getEntityIcon = (type) => {
        if (type === 'PERSON') return <Users className="w-4 h-4" />;
        if (type === 'ORGANIZATION') return <Building2 className="w-4 h-4" />;
        if (type === 'LOCATION') return <MapPin className="w-4 h-4" />;
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Button 
                    onClick={handleAnalyze} 
                    disabled={analyzing}
                    className="flex-1 gap-2"
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
                    <Button 
                        onClick={handleExportJson}
                        variant="outline"
                        className="gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {t.exportJson}
                    </Button>
                )}
            </div>

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

            {sentiment && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t.sentiment}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getSentimentColor()}`}>
                            {getSentimentIcon()}
                            <span className="font-medium">{t[sentiment]}</span>
                            {sentimentScore !== null && (
                                <span className="text-xs opacity-75">
                                    ({sentimentScore > 0 ? '+' : ''}{sentimentScore.toFixed(2)})
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {keyTakeaways.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t.keyTakeaways}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {keyTakeaways.map((takeaway, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm text-gray-700">{takeaway}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {extractedEntities.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t.entities}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['PERSON', 'ORGANIZATION', 'LOCATION'].map(entityType => {
                                const entities = extractedEntities.filter(e => e.type === entityType);
                                if (entities.length === 0) return null;
                                
                                return (
                                    <div key={entityType}>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-2">
                                            {getEntityIcon(entityType)}
                                            <span>
                                                {entityType === 'PERSON' ? t.people : 
                                                 entityType === 'ORGANIZATION' ? t.organizations : t.locations}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {entities.map((entity, idx) => (
                                                <Badge key={idx} variant="outline" className="gap-1">
                                                    {entity.name}
                                                    <span className="text-xs opacity-60">({entity.mentions})</span>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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