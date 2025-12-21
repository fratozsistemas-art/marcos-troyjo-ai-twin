import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { 
    ArrowLeft, Clock, ThumbsUp, ThumbsDown, Eye, 
    Calendar, User, Loader2, Share2
} from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        back: 'Voltar para Base de Conhecimento',
        wasHelpful: 'Este artigo foi útil?',
        yes: 'Sim',
        no: 'Não',
        thanksForFeedback: 'Obrigado pelo feedback!',
        relatedArticles: 'Artigos Relacionados',
        share: 'Compartilhar',
        copied: 'Link copiado!',
        readTime: 'min de leitura',
        views: 'visualizações',
        lastReviewed: 'Última revisão',
        author: 'Autor'
    },
    en: {
        back: 'Back to Knowledge Base',
        wasHelpful: 'Was this article helpful?',
        yes: 'Yes',
        no: 'No',
        thanksForFeedback: 'Thanks for your feedback!',
        relatedArticles: 'Related Articles',
        share: 'Share',
        copied: 'Link copied!',
        readTime: 'min read',
        views: 'views',
        lastReviewed: 'Last reviewed',
        author: 'Author'
    }
};

export default function KnowledgeArticle() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [entry, setEntry] = useState(null);
    const [relatedEntries, setRelatedEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadArticle();
    }, []);

    const loadArticle = async () => {
        setLoading(true);
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');

            if (!id) {
                window.location.href = createPageUrl('KnowledgeBase');
                return;
            }

            const entries = await base44.entities.KnowledgeEntry.filter({ id });
            
            if (entries.length === 0) {
                window.location.href = createPageUrl('KnowledgeBase');
                return;
            }

            const article = entries[0];
            setEntry(article);

            // Increment views
            await base44.entities.KnowledgeEntry.update(id, {
                views: (article.views || 0) + 1
            });

            // Load related entries
            if (article.related_entries?.length > 0) {
                const related = await Promise.all(
                    article.related_entries.slice(0, 3).map(relId =>
                        base44.entities.KnowledgeEntry.filter({ id: relId })
                    )
                );
                setRelatedEntries(related.flat().filter(e => e));
            }

        } catch (error) {
            console.error('Error loading article:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar artigo' : 'Error loading article');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (helpful) => {
        if (voted) return;
        
        try {
            await base44.entities.KnowledgeEntry.update(entry.id, {
                helpful_votes: helpful ? (entry.helpful_votes || 0) + 1 : entry.helpful_votes,
                unhelpful_votes: !helpful ? (entry.unhelpful_votes || 0) + 1 : entry.unhelpful_votes
            });
            setVoted(true);
            toast.success(t.thanksForFeedback);
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success(t.copied);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
            </div>
        );
    }

    if (!entry) return null;

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
                    <Link to={createPageUrl('KnowledgeBase')}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {t.back}
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 md:px-6 py-8">
                <article>
                    {/* Article Header */}
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="outline">{entry.category}</Badge>
                            <Badge>{entry.difficulty_level}</Badge>
                            {entry.tags?.map((tag, idx) => (
                                <Badge key={idx} variant="outline">{tag}</Badge>
                            ))}
                        </div>
                        
                        <h1 className="text-4xl font-bold text-[#002D62] mb-4">{entry.title}</h1>
                        
                        {entry.summary && (
                            <p className="text-xl text-gray-600 mb-6">{entry.summary}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {entry.author && (
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {entry.author}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {entry.estimated_reading_time || 5} {t.readTime}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {entry.views || 0} {t.views}
                            </span>
                            {entry.last_reviewed_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {t.lastReviewed}: {new Date(entry.last_reviewed_date).toLocaleDateString()}
                                </span>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                                <Share2 className="w-4 h-4 mr-2" />
                                {t.share}
                            </Button>
                        </div>
                    </div>

                    {/* Article Content */}
                    <Card className="mb-8">
                        <CardContent className="prose prose-lg max-w-none p-8">
                            <ReactMarkdown>{entry.body}</ReactMarkdown>
                        </CardContent>
                    </Card>

                    {/* Feedback */}
                    <Card className="mb-8">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">{t.wasHelpful}</h3>
                            <div className="flex gap-3">
                                <Button
                                    variant={voted ? "outline" : "default"}
                                    onClick={() => handleVote(true)}
                                    disabled={voted}
                                    className="gap-2"
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                    {t.yes}
                                </Button>
                                <Button
                                    variant={voted ? "outline" : "default"}
                                    onClick={() => handleVote(false)}
                                    disabled={voted}
                                    className="gap-2"
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                    {t.no}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Articles */}
                    {relatedEntries.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-[#002D62] mb-4">{t.relatedArticles}</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {relatedEntries.map((related) => (
                                    <Link key={related.id} to={createPageUrl('KnowledgeArticle') + `?id=${related.id}`}>
                                        <Card className="h-full hover:shadow-lg transition-shadow">
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-[#002D62] mb-2 line-clamp-2">
                                                    {related.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {related.summary}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </main>
        </div>
    );
}