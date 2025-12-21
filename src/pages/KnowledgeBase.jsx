import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BookOpen, Search, ArrowLeft, Clock, ThumbsUp, Eye, 
    Star, Filter, TrendingUp, HelpCircle, FileText, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Base de Conhecimento',
        subtitle: 'Encontre respostas, tutoriais e guias',
        search: 'Buscar na base de conhecimento...',
        searching: 'Buscando...',
        back: 'Voltar',
        all: 'Todos',
        tutorial: 'Tutoriais',
        faq: 'FAQs',
        artigo: 'Artigos',
        guia: 'Guias',
        referencia: 'Referência',
        conceito: 'Conceitos',
        troubleshooting: 'Solução de Problemas',
        featured: 'Em Destaque',
        popular: 'Mais Populares',
        recent: 'Recentes',
        noResults: 'Nenhum resultado encontrado',
        tryDifferent: 'Tente pesquisar com palavras diferentes',
        views: 'visualizações',
        helpful: 'útil',
        readTime: 'min de leitura',
        beginner: 'Iniciante',
        intermediate: 'Intermediário',
        advanced: 'Avançado'
    },
    en: {
        title: 'Knowledge Base',
        subtitle: 'Find answers, tutorials and guides',
        search: 'Search knowledge base...',
        searching: 'Searching...',
        back: 'Back',
        all: 'All',
        tutorial: 'Tutorials',
        faq: 'FAQs',
        artigo: 'Articles',
        guia: 'Guides',
        referencia: 'Reference',
        conceito: 'Concepts',
        troubleshooting: 'Troubleshooting',
        featured: 'Featured',
        popular: 'Most Popular',
        recent: 'Recent',
        noResults: 'No results found',
        tryDifferent: 'Try searching with different keywords',
        views: 'views',
        helpful: 'helpful',
        readTime: 'min read',
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
    }
};

const categoryIcons = {
    tutorial: BookOpen,
    faq: HelpCircle,
    artigo: FileText,
    guia: BookOpen,
    referencia: BookOpen,
    conceito: BookOpen,
    troubleshooting: HelpCircle
};

export default function KnowledgeBase() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadEntries();
    }, [category]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                handleSearch();
            } else {
                loadEntries();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadEntries = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('searchKnowledgeBase', {
                category: category,
                limit: 50
            });

            setEntries(response.data.results || []);
        } catch (error) {
            console.error('Error loading entries:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar' : 'Error loading');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setSearching(true);
        try {
            const response = await base44.functions.invoke('searchKnowledgeBase', {
                query: searchQuery,
                category: category,
                limit: 50
            });

            setEntries(response.data.results || []);
        } catch (error) {
            console.error('Error searching:', error);
            toast.error(lang === 'pt' ? 'Erro na busca' : 'Search error');
        } finally {
            setSearching(false);
        }
    };

    const handleVote = async (entryId, helpful) => {
        try {
            const entry = entries.find(e => e.id === entryId);
            await base44.entities.KnowledgeEntry.update(entryId, {
                helpful_votes: helpful ? (entry.helpful_votes || 0) + 1 : entry.helpful_votes,
                unhelpful_votes: !helpful ? (entry.unhelpful_votes || 0) + 1 : entry.unhelpful_votes
            });
            toast.success(lang === 'pt' ? 'Obrigado pelo feedback!' : 'Thanks for feedback!');
            loadEntries();
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const incrementViews = async (entryId) => {
        try {
            const entry = entries.find(e => e.id === entryId);
            await base44.entities.KnowledgeEntry.update(entryId, {
                views: (entry.views || 0) + 1
            });
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    };

    const categories = [
        { id: 'all', label: t.all },
        { id: 'tutorial', label: t.tutorial },
        { id: 'faq', label: t.faq },
        { id: 'artigo', label: t.artigo },
        { id: 'guia', label: t.guia },
        { id: 'referencia', label: t.referencia },
        { id: 'conceito', label: t.conceito },
        { id: 'troubleshooting', label: t.troubleshooting }
    ];

    const getDifficultyColor = (level) => {
        switch (level) {
            case 'iniciante': return 'bg-green-100 text-green-800';
            case 'intermediario': return 'bg-yellow-100 text-yellow-800';
            case 'avancado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Dashboard')}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    {t.back}
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-[#002D62]">{t.title}</h1>
                                <p className="text-sm text-gray-600">{t.subtitle}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 h-12"
                        />
                        {searching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Category Tabs */}
                <Tabs value={category} onValueChange={setCategory} className="mb-8">
                    <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent">
                        {categories.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="data-[state=active]:bg-[#002D62] data-[state=active]:text-white"
                            >
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Results */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                    </div>
                ) : entries.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noResults}</h3>
                            <p className="text-gray-500">{t.tryDifferent}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entries.map((entry) => {
                            const Icon = categoryIcons[entry.category] || BookOpen;
                            return (
                                <Link
                                    key={entry.id}
                                    to={createPageUrl('KnowledgeArticle') + `?id=${entry.id}`}
                                    onClick={() => incrementViews(entry.id)}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <Icon className="w-6 h-6 text-[#002D62]" />
                                                {entry.featured && (
                                                    <Badge className="bg-[#B8860B] text-white">
                                                        <Star className="w-3 h-3 mr-1" />
                                                        {t.featured}
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg line-clamp-2">{entry.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">
                                                {entry.summary}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <Badge variant="outline">{t[entry.category]}</Badge>
                                                <Badge className={getDifficultyColor(entry.difficulty_level)}>
                                                    {t[entry.difficulty_level] || entry.difficulty_level}
                                                </Badge>
                                                {entry.tags?.slice(0, 2).map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {entry.estimated_reading_time || 5} {t.readTime}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {entry.views || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    {entry.helpful_votes || 0}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}