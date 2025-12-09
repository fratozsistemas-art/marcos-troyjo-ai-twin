import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, Calendar, Eye, Tag, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

const translations = {
    pt: {
        search: 'Buscar artigos, publicações e eventos...',
        filters: 'Filtros',
        clearFilters: 'Limpar',
        type: 'Tipo',
        tags: 'Tags',
        sortBy: 'Ordenar por',
        results: 'resultados',
        noResults: 'Nenhum resultado encontrado',
        dateRange: 'Período',
        author: 'Autor',
        category: 'Categoria',
        sortRelevance: 'Relevância',
        sortDate: 'Data',
        sortViews: 'Visualizações',
        from: 'De',
        to: 'Até',
        allAuthors: 'Todos os autores',
        allCategories: 'Todas'
    },
    en: {
        search: 'Search articles, publications, and events...',
        filters: 'Filters',
        clearFilters: 'Clear',
        type: 'Type',
        tags: 'Tags',
        sortBy: 'Sort by',
        results: 'results',
        noResults: 'No results found',
        dateRange: 'Date Range',
        author: 'Author',
        category: 'Category',
        sortRelevance: 'Relevance',
        sortDate: 'Date',
        sortViews: 'Views',
        from: 'From',
        to: 'To',
        allAuthors: 'All authors',
        allCategories: 'All'
    }
};

export default function AdvancedSearch({ lang = 'pt' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [allContent, setAllContent] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedAuthor, setSelectedAuthor] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadAllContent();
    }, []);

    useEffect(() => {
        performSearch();
    }, [query, selectedTypes, selectedTags, selectedAuthor, selectedCategory, dateFrom, dateTo, sortBy, allContent]);

    const loadAllContent = async () => {
        try {
            const [articles, publications, events] = await Promise.all([
                base44.entities.Article.filter({ status: 'publicado' }),
                base44.entities.Publication.list('-publication_date', 100),
                base44.entities.TimelineEvent.list('-start_date', 100)
            ]);

            const combined = [
                ...articles.map(a => ({ ...a, contentType: 'article' })),
                ...publications.map(p => ({ ...p, contentType: 'publication' })),
                ...events.map(e => ({ ...e, contentType: 'event' }))
            ];

            setAllContent(combined);
        } catch (error) {
            console.error('Error loading content:', error);
        }
    };

    const performSearch = () => {
        let filtered = allContent;

        // Filter by search query with relevance scoring
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.map(item => {
                const searchableText = [
                    item.title,
                    item.name,
                    item.summary,
                    item.body,
                    item.description,
                    ...(item.tags || []),
                    ...(item.topics || [])
                ].filter(Boolean).join(' ').toLowerCase();
                
                if (!searchableText.includes(lowerQuery)) {
                    return null;
                }

                // Calculate relevance score
                let relevanceScore = 0;
                const titleText = (item.title || item.name || '').toLowerCase();
                const summaryText = (item.summary || item.description || '').toLowerCase();
                
                if (titleText.includes(lowerQuery)) relevanceScore += 5;
                if (summaryText.includes(lowerQuery)) relevanceScore += 3;
                if ((item.tags || []).some(tag => tag.toLowerCase().includes(lowerQuery))) relevanceScore += 2;
                
                return { ...item, relevanceScore };
            }).filter(Boolean);
        }

        // Filter by type
        if (selectedTypes.length > 0) {
            filtered = filtered.filter(item => selectedTypes.includes(item.contentType));
        }

        // Filter by author
        if (selectedAuthor !== 'all') {
            filtered = filtered.filter(item => 
                item.authors?.includes(selectedAuthor) || item.created_by === selectedAuthor
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => 
                item.type === selectedCategory || item.category === selectedCategory
            );
        }

        // Filter by date range
        if (dateFrom) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.publication_date || item.start_date || item.created_date);
                return itemDate >= new Date(dateFrom);
            });
        }
        if (dateTo) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.publication_date || item.start_date || item.created_date);
                return itemDate <= new Date(dateTo);
            });
        }

        // Filter by tags
        if (selectedTags.length > 0) {
            filtered = filtered.filter(item => {
                const itemTags = item.tags || item.topics || [];
                return selectedTags.some(tag => itemTags.includes(tag));
            });
        }

        // Sort results
        if (sortBy === 'relevance') {
            filtered.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        } else if (sortBy === 'date') {
            filtered.sort((a, b) => {
                const dateA = new Date(a.publication_date || a.start_date || a.created_date);
                const dateB = new Date(b.publication_date || b.start_date || b.created_date);
                return dateB - dateA;
            });
        } else if (sortBy === 'views') {
            filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        }

        setResults(filtered);
    };

    const toggleType = (type) => {
        setSelectedTypes(prev => 
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSelectedTypes([]);
        setSelectedTags([]);
        setSelectedAuthor('all');
        setSelectedCategory('all');
        setDateFrom('');
        setDateTo('');
        setQuery('');
    };

    const allTags = [...new Set(allContent.flatMap(item => item.tags || item.topics || []))];
    const allAuthors = [...new Set(allContent.flatMap(item => item.authors || [item.created_by]).filter(Boolean))];
    const allCategories = [...new Set(allContent.map(item => item.type || item.category).filter(Boolean))];

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t.search}
                        className="pl-10"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    {t.filters}
                </Button>
                {(selectedTypes.length > 0 || selectedTags.length > 0 || query || selectedAuthor !== 'all' || selectedCategory !== 'all' || dateFrom || dateTo) && (
                    <Button variant="outline" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-2" />
                        {t.clearFilters}
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
                <Filter className="w-4 h-4 text-gray-500" />
                <Badge
                    variant={selectedTypes.includes('article') ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleType('article')}
                >
                    Articles
                </Badge>
                <Badge
                    variant={selectedTypes.includes('publication') ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleType('publication')}
                >
                    Publications
                </Badge>
                <Badge
                    variant={selectedTypes.includes('event') ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleType('event')}
                >
                    Events
                </Badge>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <Card className="border-[#002D62]/20">
                    <CardContent className="p-4 space-y-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-2 block">{t.author}</label>
                                <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t.allAuthors}</SelectItem>
                                        {allAuthors.map(author => (
                                            <SelectItem key={author} value={author}>{author}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-2 block">{t.category}</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t.allCategories}</SelectItem>
                                        {allCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-2 block">{t.from}</label>
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-2 block">{t.to}</label>
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-2 block">{t.sortBy}</label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relevance">{t.sortRelevance}</SelectItem>
                                    <SelectItem value="date">{t.sortDate}</SelectItem>
                                    <SelectItem value="views">{t.sortViews}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="text-sm text-gray-600">
                {results.length} {t.results}
            </div>

            <div className="space-y-3">
                {results.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-8 text-gray-500">
                            {t.noResults}
                        </CardContent>
                    </Card>
                ) : (
                    results.map((item, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="text-xs">
                                                {item.contentType}
                                            </Badge>
                                            {item.type && (
                                                <Badge variant="outline" className="text-xs">
                                                    {item.type}
                                                </Badge>
                                            )}
                                        </div>
                                        <Link 
                                            to={item.contentType === 'article' 
                                                ? createPageUrl('ArticleView') + `?id=${item.id}`
                                                : '#'}
                                            className="block"
                                        >
                                            <h3 className="font-semibold text-[#002D62] hover:text-[#8B1538] mb-1">
                                                {item.title || item.name}
                                            </h3>
                                        </Link>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {item.summary || item.description}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            {(item.publication_date || item.start_date) && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.publication_date || item.start_date).toLocaleDateString()}
                                                </span>
                                            )}
                                            {item.views > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {item.views}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}