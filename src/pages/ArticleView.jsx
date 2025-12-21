import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Calendar, Clock, Eye, User, Share2, Download, Stamp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import ArticleRevisionPanel from '@/components/editorial/ArticleRevisionPanel';
import AdminReviewPanel from '@/components/editorial/AdminReviewPanel';
import QualityBadge from '@/components/editorial/QualityBadge';
import RelatedContent from '@/components/content/RelatedContent';
import SEOHead from '@/components/seo/SEOHead';
import { HelmetProvider } from 'react-helmet-async';

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
        <HelmetProvider>
            <SEOHead
                title={article.seo_title || article.title}
                description={article.seo_description || article.summary}
                keywords={article.seo_keywords || article.tags}
                author={article.authors?.[0] || 'Marcos Troyjo'}
                type="article"
                url={window.location.href}
                publishedTime={article.publication_date}
                modifiedTime={article.updated_date}
                section={article.type}
                tags={article.tags}
                structuredData={article.structured_data}
            />
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
                {/* Admin Review Panel (Twin→Human) */}
                <div className="mb-6">
                    <AdminReviewPanel article={article} onReviewComplete={() => loadArticle(article.id)} />
                </div>

                {/* Troyjo Revision Panel (Human→Troyjo) */}
                <div className="mb-6">
                    <ArticleRevisionPanel article={article} onRevisionComplete={() => loadArticle(article.id)} />
                </div>

                {/* Quality Badge at top */}
                {article.quality_tier && (
                    <div className="mb-4">
                        <QualityBadge tier={article.quality_tier} lang={lang} />
                    </div>
                )}

                <div className="mb-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Badge>
                            {article.type}
                        </Badge>
                        {article.tags?.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className={tag === 'to be approved' ? 'border-amber-500 text-amber-700 bg-amber-50' : ''}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
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

                    <div className="pb-6 border-b space-y-3">
                        {article.authors && article.authors.length > 0 && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[#333F48]/60" />
                                <span className="text-sm text-[#333F48]">
                                    {article.authors.join(', ')}
                                </span>
                            </div>
                        )}
                        {article.verified_by && article.quality_tier === 'curator_approved' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                                <span className="text-sm text-green-800">
                                    {lang === 'pt' ? '✓ Verificado por curador CAIO/TSI' : '✓ Verified by CAIO/TSI curator'}
                                </span>
                                {article.verification_date && (
                                    <span className="text-xs text-green-600 ml-auto">
                                        {new Date(article.verification_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        )}
                        {article.revised_by && article.quality_tier === 'troyjo_certified' && (
                            <div className="flex items-center gap-2 px-4 py-3 bg-[#B8860B]/10 rounded-lg border-2 border-[#B8860B]">
                                <Stamp className="w-5 h-5 text-[#B8860B]" />
                                <span className="text-base font-bold text-[#B8860B]">
                                    © {lang === 'pt' ? 'Certificado por Marcos Troyjo' : 'Certified by Marcos Troyjo'}
                                </span>
                                {article.revision_date && (
                                    <span className="text-xs text-[#B8860B]/70 ml-auto">
                                        {new Date(article.revision_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="prose prose-lg prose-slate max-w-none prose-headings:text-[#002D62] prose-a:text-[#8B1538] prose-strong:text-[#002D62] prose-p:text-[#2D2D2D] prose-p:leading-relaxed prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8 prose-h3:mt-6 prose-blockquote:border-l-4 prose-blockquote:border-[#8B1538] prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-table:border-collapse prose-table:w-full prose-th:bg-[#002D62] prose-th:text-white prose-th:p-3 prose-td:border prose-td:border-gray-300 prose-td:p-3">
                    <ReactMarkdown
                        components={{
                            table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-6">
                                    <table className="min-w-full border border-gray-300 shadow-sm rounded-lg" {...props} />
                                </div>
                            ),
                            blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-4 border-[#8B1538] bg-gray-50 p-4 my-6 italic" {...props} />
                            ),
                            h2: ({node, ...props}) => (
                                <h2 className="text-2xl font-bold text-[#002D62] border-b-2 border-gray-200 pb-2 mt-8 mb-4" {...props} />
                            ),
                            h3: ({node, ...props}) => (
                                <h3 className="text-xl font-semibold text-[#002D62] mt-6 mb-3" {...props} />
                            )
                        }}
                    >
                        {article.body}
                    </ReactMarkdown>
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

                {/* Related Content */}
                <div className="mt-8">
                    <RelatedContent currentArticle={article} lang={lang} />
                </div>

            </article>
            </div>
        </HelmetProvider>
    );
}