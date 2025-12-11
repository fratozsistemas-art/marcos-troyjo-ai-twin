import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, BookOpen, TrendingUp, ThumbsUp, ThumbsDown, Edit, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import KnowledgeArticleEditor from '@/components/knowledge/KnowledgeArticleEditor';
import ArticleRating from '@/components/knowledge/ArticleRating';

export default function KnowledgeBase() {
    const [articles, setArticles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const kb = await base44.entities.Article.filter({
                tags: { $in: ['knowledge-base'] }
            }, '-created_date', 100);
            setArticles(kb);
        } catch (error) {
            console.error('Error loading:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredArticles = articles.filter(a =>
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const topRated = [...filteredArticles].sort((a, b) => 
        (b.user_rating || 0) - (a.user_rating || 0)
    ).slice(0, 5);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#002D62] flex items-center gap-3">
                            <BookOpen className="w-8 h-8" />
                            Base de Conhecimento
                        </h1>
                        <p className="text-gray-600 mt-2">Explore artigos e insights gerados por IA</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="outline">Voltar</Button>
                        </Link>
                        <Button onClick={() => { setSelectedArticle(null); setEditorOpen(true); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Artigo
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder="Buscar por título, tema ou tag..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <Tabs defaultValue="all" className="mb-6">
                    <TabsList>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="top">Mais Avaliados</TabsTrigger>
                        <TabsTrigger value="recent">Recentes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredArticles.map(article => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    onEdit={() => { setSelectedArticle(article); setEditorOpen(true); }}
                                    onRated={loadArticles}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="top">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topRated.map(article => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    onEdit={() => { setSelectedArticle(article); setEditorOpen(true); }}
                                    onRated={loadArticles}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="recent">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredArticles.slice(0, 12).map(article => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    onEdit={() => { setSelectedArticle(article); setEditorOpen(true); }}
                                    onRated={loadArticles}
                                />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <KnowledgeArticleEditor
                article={selectedArticle}
                open={editorOpen}
                onClose={() => { setEditorOpen(false); setSelectedArticle(null); }}
                onSaved={loadArticles}
            />
        </div>
    );
}

function ArticleCard({ article, onEdit, onRated }) {
    const relatedCount = article.related_articles?.length || 0;
    
    return (
        <Card className="hover:shadow-lg transition-all">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <Button size="sm" variant="ghost" onClick={onEdit}>
                        <Edit className="w-4 h-4" />
                    </Button>
                </div>
                {article.tags && (
                    <div className="flex gap-1 flex-wrap mt-2">
                        {article.tags.filter(t => t !== 'knowledge-base').slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">{article.summary}</p>
                
                {relatedCount > 0 && (
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                        <LinkIcon className="w-3 h-3" />
                        {relatedCount} artigos relacionados
                    </div>
                )}
                
                <ArticleRating articleId={article.id} onRated={onRated} />
            </CardContent>
        </Card>
    );
}