import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, FileText } from 'lucide-react';

const translations = {
    pt: {
        title: 'Conteúdo Relacionado',
        subtitle: 'Artigos e eventos que podem interessar',
        readMore: 'Ler mais'
    },
    en: {
        title: 'Related Content',
        subtitle: 'Articles and events you might find interesting',
        readMore: 'Read more'
    }
};

export default function RelatedContent({ currentArticle, lang = 'pt' }) {
    const [related, setRelated] = useState([]);
    const t = translations[lang];

    useEffect(() => {
        if (currentArticle) {
            loadRelatedContent();
        }
    }, [currentArticle]);

    const loadRelatedContent = async () => {
        try {
            const [articles, events] = await Promise.all([
                base44.entities.Article.filter({ status: 'publicado' }),
                base44.entities.TimelineEvent.list('-start_date', 20)
            ]);

            // Score and rank related content
            const scored = [];

            // Add articles
            articles
                .filter(a => a.id !== currentArticle.id)
                .forEach(article => {
                    let score = 0;
                    
                    // Tag overlap
                    const commonTags = (article.tags || []).filter(tag => 
                        (currentArticle.tags || []).includes(tag)
                    );
                    score += commonTags.length * 3;

                    // Persona target overlap
                    const commonPersonas = (article.persona_target || []).filter(p =>
                        (currentArticle.persona_target || []).includes(p)
                    );
                    score += commonPersonas.length * 2;

                    // Same type
                    if (article.type === currentArticle.type) {
                        score += 1;
                    }

                    if (score > 0) {
                        scored.push({ ...article, score, contentType: 'article' });
                    }
                });

            // Sort by score and take top 4
            scored.sort((a, b) => b.score - a.score);
            setRelated(scored.slice(0, 4));

        } catch (error) {
            console.error('Error loading related content:', error);
        }
    };

    if (related.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-[#002D62] flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {related.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => window.location.href = createPageUrl('ArticleView') + `?id=${item.id}`}
                        className="block p-3 rounded-lg border border-gray-100 hover:border-[#002D62]/20 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <h4 className="font-medium text-sm text-[#002D62] mb-1 line-clamp-2">
                                    {item.title}
                                </h4>
                                {item.summary && (
                                    <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                                        {item.summary}
                                    </p>
                                )}
                                <div className="flex flex-wrap gap-1">
                                    {(item.tags || []).slice(0, 3).map((tag, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}