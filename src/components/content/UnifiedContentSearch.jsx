import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
    Search, Filter, Tag, Calendar, BookOpen, FileText, 
    Database, Award, Mic, File, Loader2, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const contentTypeIcons = {
    article: FileText,
    document: File,
    fact: Database,
    publication: BookOpen,
    book: Award,
    interview: Mic
};

const contentTypeColors = {
    article: '#002D62',
    document: '#00654A',
    fact: '#D4AF37',
    publication: '#8B1538',
    book: '#00D4FF',
    interview: '#C7A763'
};

export default function UnifiedContentSearch({ lang = 'pt', onResultSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState(['all']);
    const [selectedTags, setSelectedTags] = useState([]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const t = {
        pt: {
            title: 'Busca Unificada',
            placeholder: 'Buscar em todos os conteúdos...',
            search: 'Buscar',
            filters: 'Filtros',
            contentTypes: 'Tipos de Conteúdo',
            tags: 'Tags',
            dateRange: 'Período',
            from: 'De',
            to: 'Até',
            results: 'Resultados',
            noResults: 'Nenhum resultado encontrado',
            clearFilters: 'Limpar Filtros',
            types: {
                all: 'Todos',
                article: 'Artigos',
                document: 'Documentos',
                fact: 'Fatos Estratégicos',
                publication: 'Publicações',
                book: 'Livros',
                interview: 'Entrevistas'
            }
        },
        en: {
            title: 'Unified Search',
            placeholder: 'Search across all content...',
            search: 'Search',
            filters: 'Filters',
            contentTypes: 'Content Types',
            tags: 'Tags',
            dateRange: 'Date Range',
            from: 'From',
            to: 'To',
            results: 'Results',
            noResults: 'No results found',
            clearFilters: 'Clear Filters',
            types: {
                all: 'All',
                article: 'Articles',
                document: 'Documents',
                fact: 'Strategic Facts',
                publication: 'Publications',
                book: 'Books',
                interview: 'Interviews'
            }
        }
    }[lang];

    const performSearch = async () => {
        if (!query && selectedTags.length === 0) {
            toast.error(lang === 'pt' ? 'Digite algo para buscar' : 'Enter search query');
            return;
        }

        setLoading(true);
        try {
            const response = await base44.functions.invoke('unifiedContentSearch', {
                query,
                content_types: selectedTypes,
                tags: selectedTags,
                date_from: dateFrom,
                date_to: dateTo,
                limit: 50
            });
            setResults(response.data);
        } catch (error) {
            console.error('Search error:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleType = (type) => {
        if (type === 'all') {
            setSelectedTypes(['all']);
        } else {
            const newTypes = selectedTypes.filter(t => t !== 'all');
            if (newTypes.includes(type)) {
                setSelectedTypes(newTypes.filter(t => t !== type));
            } else {
                setSelectedTypes([...newTypes, type]);
            }
        }
    };

    const clearFilters = () => {
        setSelectedTypes(['all']);
        setSelectedTags([]);
        setDateFrom('');
        setDateTo('');
    };

    const renderResultItem = (item, type) => {
        const Icon = contentTypeIcons[type];
        const color = contentTypeColors[type];

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => onResultSelect?.(item, type)}
            >
                <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-1 flex-shrink-0" style={{ color }} />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-gray-900">
                                {item.title || item.name || item.summary || item.topic_label}
                            </h4>
                            <Badge style={{ backgroundColor: color, color: 'white' }} className="text-xs flex-shrink-0">
                                {t.types[type]}
                            </Badge>
                        </div>
                        {(item.description || item.detail || item.content) && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {item.description || item.detail || item.content?.substring(0, 150)}
                            </p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {item.tags.slice(0, 3).map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Search className="w-5 h-5" />
                    {t.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-2">
                    <Input
                        placeholder={t.placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                        className="flex-1"
                    />
                    <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                        <Filter className="w-4 h-4" />
                    </Button>
                    <Button onClick={performSearch} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-gray-50 rounded-lg space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{t.filters}</h4>
                            <Button onClick={clearFilters} variant="ghost" size="sm">
                                <X className="w-4 h-4 mr-1" />
                                {t.clearFilters}
                            </Button>
                        </div>

                        {/* Content Types */}
                        <div>
                            <Label className="text-xs font-semibold mb-2 block">{t.contentTypes}</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {Object.keys(t.types).map((type) => (
                                    <div key={type} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedTypes.includes(type)}
                                            onCheckedChange={() => toggleType(type)}
                                        />
                                        <Label className="text-xs cursor-pointer">{t.types[type]}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Date Range */}
                        <div>
                            <Label className="text-xs font-semibold mb-2 block">{t.dateRange}</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-gray-600">{t.from}</Label>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-600">{t.to}</Label>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Available Tags */}
                        {results?.available_tags && results.available_tags.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <Label className="text-xs font-semibold mb-2 block">{t.tags}</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {results.available_tags.slice(0, 20).map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                                                className="cursor-pointer text-xs"
                                                onClick={() => {
                                                    if (selectedTags.includes(tag)) {
                                                        setSelectedTags(selectedTags.filter(t => t !== tag));
                                                    } else {
                                                        setSelectedTags([...selectedTags, tag]);
                                                    }
                                                }}
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Results */}
                {results && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">
                                {t.results}: {results.statistics.total_results}
                            </h3>
                            <div className="flex gap-2 text-xs">
                                {Object.entries(results.statistics.by_type).map(([type, count]) => (
                                    count > 0 && (
                                        <Badge key={type} variant="secondary">
                                            {t.types[type]}: {count}
                                        </Badge>
                                    )
                                ))}
                            </div>
                        </div>

                        {results.statistics.total_results === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">{t.noResults}</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {Object.entries(results.results).map(([type, items]) => (
                                    items.length > 0 && items.map((item) => (
                                        <React.Fragment key={`${type}-${item.id}`}>
                                            {renderResultItem(item, type)}
                                        </React.Fragment>
                                    ))
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}