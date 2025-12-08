import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Calendar, Clock, Eye, User, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function ArticleView() {
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (articleId) {
            loadArticle(articleId);
        } else {
            navigate(createPageUrl('LandingPage'));
        }
    }, []);

    const loadArticle = async (id) => {
        setIsLoading(true);
        try {
            const articles = await base44.entities.Article.filter({ id });
            if (articles.length > 0) {
                const article = articles[0];
                setArticle(article);
                
                // Increment view count
                await base44.entities.Article.update(id, {
                    views: (article.views || 0) + 1
                });
            }
        } catch (error) {
            console.error('Error loading article:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
        toast.success(lang === 'pt' ? 'Link copiado!' : 'Link copied!');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <p className="text-[#333F48]/60">
                    {lang === 'pt' ? 'Carregando...' : 'Loading...'}
                </p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#333F48]/60 mb-4">
                        {lang === 'pt' ? 'Artigo não encontrado' : 'Article not found'}
                    </p>
                    <Link to={createPageUrl('LandingPage')}>
                        <Button variant="outline">
                            {lang === 'pt' ? 'Voltar' : 'Go Back'}
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link to={createPageUrl('LandingPage')}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {lang === 'pt' ? 'Voltar' : 'Back'}
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                            <Share2 className="w-4 h-4" />
                            {lang === 'pt' ? 'Compartilhar' : 'Share'}
                        </Button>
                    </div>
                </div>
            </header>

            <article className="max-w-4xl mx-auto px-4 md:px-6 py-12">
                <div className="mb-8">
                    <Badge className="mb-4">
                        {article.type}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#002D62] mb-4">
                        {article.title}
                    </h1>
                    {article.subtitle && (
                        <p className="text-xl text-[#333F48]/80 mb-6">{article.subtitle}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#333F48]/60 mb-6">
                        {article.publication_date && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(article.publication_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                            </div>
                        )}
                        {article.reading_time && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {article.reading_time} min
                            </div>
                        )}
                        {article.views > 0 && (
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.views} {lang === 'pt' ? 'visualizações' : 'views'}
                            </div>
                        )}
                    </div>

                    {article.authors && article.authors.length > 0 && (
                        <div className="flex items-center gap-2 pb-6 border-b">
                            <User className="w-4 h-4 text-[#333F48]/60" />
                            <span className="text-sm text-[#333F48]">
                                {article.authors.join(', ')}
                            </span>
                        </div>
                    )}
                </div>

                <div className="prose prose-lg max-w-none">
                    <ReactMarkdown>{article.body}</ReactMarkdown>
                </div>

                {article.persona_target && article.persona_target.length > 0 && (
                    <div className="mt-8 pt-8 border-t">
                        <p className="text-sm text-[#333F48]/60 mb-2">
                            {lang === 'pt' ? 'Público-alvo:' : 'Target audience:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {article.persona_target.map((persona, idx) => (
                                <Badge key={idx} variant="outline">{persona}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}