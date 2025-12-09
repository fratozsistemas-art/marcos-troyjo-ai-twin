import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X, Calendar, Eye, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const translations = {
    pt: {
        search: 'Buscar artigos, publicações e eventos...',
        filters: 'Filtros',
        clearFilters: 'Limpar',
        type: 'Tipo',
        tags: 'Tags',
        sortBy: 'Ordenar por',
        results: 'resultados',
        noResults: 'Nenhum resultado encontrado'
    },
    en: {
        search: 'Search articles, publications, and events...',
        filters: 'Filters',
        clearFilters: 'Clear',
        type: 'Type',
        tags: 'Tags',
        sortBy: 'Sort by',
        results: 'results',
        noResults: 'No results found'
    }
};

export default function AdvancedSearch({ lang = 'pt' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [allContent, setAllContent] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [sortBy, setSortBy] = useState('relevance');
    const t = translations[lang];

    useEffect(() => {
        loadAllContent();
    }, []);

    useEffect(() => {
        performSearch();
    }, [query, selectedTypes, selectedTags, sortBy, allContent]);

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

        // Filter by search query
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(item => {
                const searchableText = [
                    item.title,
                    item.name,
                    item.summary,
                    item.body,
                    item.description,
                    ...(item.tags || []),
                    ...(item.topics || [])
                ].filter(Boolean).join(' ').toLowerCase();
                
                return searchableText.includes(lowerQuery);
            });
        }

        // Filter by type
        if (selectedTypes.length > 0) {
            filtered = filtered.filter(item => selectedTypes.includes(item.contentType));
        }

        // Filter by tags
        if (selectedTags.length > 0) {
            filtered = filtered.filter(item => {
                const itemTags = item.tags || item.topics || [];
                return selectedTags.some(tag => itemTags.includes(tag));
            });
        }

        // Sort results
        if (sortBy === 'date') {
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
        setQuery('');
    };

    const allTags = [...new Set(allContent.flatMap(item => item.tags || item.topics || []))];

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
                {(selectedTypes.length > 0 || selectedTags.length > 0 || query) && (
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