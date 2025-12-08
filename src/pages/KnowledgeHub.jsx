import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    Search, Filter, Calendar, TrendingUp, Database,
    FileText, Lightbulb, BookOpen, Brain, MessageSquare,
    ArrowLeft, Loader2, Download, Star, BarChart3, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const translations = {
    pt: {
        title: 'Hub de Conhecimento Automatizado',
        subtitle: 'Seu assistente de pesquisa pessoal',
        back: 'Voltar',
        search: 'Buscar conhecimento...',
        filters: 'Filtros',
        allTypes: 'Todos os Tipos',
        minConfidence: 'Confiança Mínima',
        dateRange: 'Período',
        topics: 'Tópicos',
        results: 'resultados',
        loading: 'Carregando conhecimento...',
        stats: 'Estatísticas',
        total: 'Total de Itens',
        avgConfidence: 'Confiança Média',
        topTopics: 'Principais Tópicos',
        export: 'Exportar',
        noResults: 'Nenhum resultado encontrado',
        types: {
            insight: 'Insight',
            document: 'Documento',
            position: 'Posição',
            concept: 'Conceito',
            vocabulary: 'Vocabulário',
            ai_history: 'Histórico IA'
        }
    },
    en: {
        title: 'Automated Knowledge Hub',
        subtitle: 'Your personal research assistant',
        back: 'Back',
        search: 'Search knowledge...',
        filters: 'Filters',
        allTypes: 'All Types',
        minConfidence: 'Min Confidence',
        dateRange: 'Date Range',
        topics: 'Topics',
        results: 'results',
        loading: 'Loading knowledge...',
        stats: 'Statistics',
        total: 'Total Items',
        avgConfidence: 'Avg Confidence',
        topTopics: 'Top Topics',
        export: 'Export',
        noResults: 'No results found',
        types: {
            insight: 'Insight',
            document: 'Document',
            position: 'Position',
            concept: 'Concept',
            vocabulary: 'Vocabulary',
            ai_history: 'AI History'
        }
    }
};

const typeIcons = {
    insight: Lightbulb,
    document: FileText,
    position: Target,
    concept: Brain,
    vocabulary: BookOpen,
    ai_history: MessageSquare
};

const typeColors = {
    insight: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    document: 'bg-blue-100 text-blue-800 border-blue-200',
    position: 'bg-green-100 text-green-800 border-green-200',
    concept: 'bg-purple-100 text-purple-800 border-purple-200',
    vocabulary: 'bg-orange-100 text-orange-800 border-orange-200',
    ai_history: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function KnowledgeHub() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const t = translations[lang];

    const [knowledge, setKnowledge] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        minConfidence: 50,
        dateFrom: '',
        dateTo: '',
        topics: []
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadKnowledge();
    }, [filters]);

    const loadKnowledge = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('aggregateKnowledge', { filters });
            setKnowledge(response.data.items || []);
            setStats(response.data.stats || null);
        } catch (error) {
            console.error('Error loading knowledge:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar conhecimento' : 'Error loading knowledge');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const exportKnowledge = () => {
        const dataStr = JSON.stringify(knowledge, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-hub-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'Conhecimento exportado!' : 'Knowledge exported!');
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return 'text-green-600 bg-green-50';
        if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{t.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{t.subtitle}</p>
                        </div>
                    </div>
                    <Button onClick={exportKnowledge} variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        {t.export}
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid md:grid-cols-4 gap-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#333F48]/60">{t.total}</p>
                                            <p className="text-2xl font-bold text-[#002D62]">{stats.total}</p>
                                        </div>
                                        <Database className="w-8 h-8 text-[#002D62]/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#333F48]/60">{t.avgConfidence}</p>
                                            <p className="text-2xl font-bold text-[#002D62]">{stats.avgConfidence}%</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-green-500/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#333F48]/60">{t.results}</p>
                                            <p className="text-2xl font-bold text-[#002D62]">{stats.filtered}</p>
                                        </div>
                                        <Filter className="w-8 h-8 text-[#002D62]/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-[#333F48]/60">{t.topTopics}</p>
                                            <p className="text-2xl font-bold text-[#002D62]">{stats.topTopics?.length || 0}</p>
                                        </div>
                                        <BarChart3 className="w-8 h-8 text-[#002D62]/20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#333F48]/40" />
                                <Input
                                    placeholder={t.search}
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                variant={showFilters ? 'default' : 'outline'}
                                onClick={() => setShowFilters(!showFilters)}
                                className="gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                {t.filters}
                            </Button>
                        </div>

                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid md:grid-cols-3 gap-4 pt-4 border-t"
                            >
                                <div>
                                    <label className="text-sm font-medium mb-2 block">{t.allTypes}</label>
                                    <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t.allTypes}</SelectItem>
                                            {Object.keys(t.types).map(type => (
                                                <SelectItem key={type} value={type}>{t.types[type]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">
                                        {t.minConfidence}: {filters.minConfidence}%
                                    </label>
                                    <Slider
                                        value={[filters.minConfidence]}
                                        onValueChange={(v) => handleFilterChange('minConfidence', v[0])}
                                        min={0}
                                        max={100}
                                        step={10}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">{t.dateRange}</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        />
                                        <Input
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Topics */}
                {stats?.topTopics && stats.topTopics.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                {t.topTopics}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {stats.topTopics.map((item, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-[#002D62] hover:text-white transition-colors"
                                        onClick={() => handleFilterChange('search', item.topic)}
                                    >
                                        {item.topic} ({item.count})
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                        <span className="ml-3 text-[#333F48]">{t.loading}</span>
                    </div>
                ) : knowledge.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Database className="w-16 h-16 text-[#333F48]/20 mx-auto mb-4" />
                            <p className="text-[#333F48]/60">{t.noResults}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {knowledge.map((item, index) => {
                            const Icon = typeIcons[item.type] || FileText;
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-lg ${typeColors[item.type]} border flex items-center justify-center flex-shrink-0`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h3 className="font-semibold text-[#002D62] text-lg">{item.title}</h3>
                                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                                                            {item.confidence}%
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-[#333F48] mb-3 line-clamp-2">
                                                        {item.content}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="outline" className={typeColors[item.type]}>
                                                            {t.types[item.type]}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {new Date(item.created_date).toLocaleDateString()}
                                                        </Badge>
                                                        {item.source && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.source}
                                                            </Badge>
                                                        )}
                                                        {item.topics.slice(0, 3).map((topic, i) => (
                                                            <Badge key={i} variant="secondary" className="text-xs">
                                                                {topic}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}