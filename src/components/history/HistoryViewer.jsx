import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    History, 
    Sparkles, 
    MessageCircle, 
    FileText, 
    FileCheck, 
    Star, 
    Trash2, 
    Eye,
    Search,
    Loader2,
    RotateCcw,
    FileDown,
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function HistoryViewer({ lang = 'pt', onReuse }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [summaries, setSummaries] = useState({});
    const [summarizing, setSummarizing] = useState({});
    const [visualizing, setVisualizing] = useState({});

    const translations = {
        pt: {
            title: 'Histórico de Interações',
            description: 'Gerencie e revise suas interações anteriores com as funções de IA',
            search: 'Buscar...',
            all: 'Todos',
            favorite: 'Favoritar',
            unfavorite: 'Desfavoritar',
            delete: 'Excluir',
            view: 'Visualizar',
            reuse: 'Reutilizar',
            summarize: 'Resumir',
            visualize: 'Visualizar',
            noHistory: 'Nenhum histórico encontrado',
            inputs: 'Entradas',
            outputs: 'Saídas',
            documentsUsed: 'Documentos Usados',
            types: {
                metaphors: 'Metáforas',
                interview: 'Entrevista',
                article: 'Artigo',
                assessment: 'Avaliação'
            }
        },
        en: {
            title: 'Interaction History',
            description: 'Manage and review your previous interactions with AI functions',
            search: 'Search...',
            all: 'All',
            favorite: 'Favorite',
            unfavorite: 'Unfavorite',
            delete: 'Delete',
            view: 'View',
            reuse: 'Reuse',
            summarize: 'Summarize',
            visualize: 'Visualize',
            noHistory: 'No history found',
            inputs: 'Inputs',
            outputs: 'Outputs',
            documentsUsed: 'Documents Used',
            types: {
                metaphors: 'Metaphors',
                interview: 'Interview',
                article: 'Article',
                assessment: 'Assessment'
            }
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const items = await base44.entities.AIHistory.list('-created_date', 100);
            setHistory(items || []);
        } catch (error) {
            console.error('Error loading history:', error);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (item) => {
        try {
            await base44.entities.AIHistory.update(item.id, {
                favorited: !item.favorited
            });
            loadHistory();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const deleteItem = async (item) => {
        if (!confirm(lang === 'pt' ? 'Excluir este item?' : 'Delete this item?')) return;
        try {
            await base44.entities.AIHistory.delete(item.id);
            loadHistory();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const generateSummary = async (item) => {
        setSummarizing(prev => ({ ...prev, [item.id]: true }));
        try {
            const response = await base44.functions.invoke('summarizeContent', {
                content: {
                    inputs: item.inputs,
                    outputs: item.outputs
                },
                type: 'interaction',
                max_length: 'medium'
            });
            setSummaries(prev => ({ ...prev, [item.id]: response.data.summary }));
        } catch (error) {
            console.error('Error generating summary:', error);
        } finally {
            setSummarizing(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const generateVisualization = async (item) => {
        setVisualizing(prev => ({ ...prev, [item.id]: true }));
        try {
            const response = await base44.functions.invoke('generateDataVisualization', {
                data_context: JSON.stringify({ inputs: item.inputs, outputs: item.outputs }),
                visualization_type: 'bar',
                title: item.title
            });
            // Store visualization data
            setSummaries(prev => ({ 
                ...prev, 
                [`viz_${item.id}`]: response.data 
            }));
        } catch (error) {
            console.error('Error generating visualization:', error);
        } finally {
            setVisualizing(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const getIcon = (type) => {
        const icons = {
            metaphors: Sparkles,
            interview: MessageCircle,
            article: FileText,
            assessment: FileCheck
        };
        return icons[type] || FileText;
    };

    const filteredHistory = history.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || item.function_type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.search}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filterType === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilterType('all')}
                        size="sm"
                    >
                        {t.all}
                    </Button>
                    {Object.entries(t.types).map(([key, label]) => (
                        <Button
                            key={key}
                            variant={filterType === key ? 'default' : 'outline'}
                            onClick={() => setFilterType(key)}
                            size="sm"
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <History className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">{t.noHistory}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {filteredHistory.map((item, index) => {
                            const Icon = getIcon(item.function_type);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-[#002D62] text-lg">
                                                            {item.title}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline">
                                                                {t.types[item.function_type]}
                                                            </Badge>
                                                            <span className="text-xs">
                                                                {new Date(item.created_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                                            </span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleFavorite(item)}
                                                        className={item.favorited ? 'text-yellow-500' : ''}
                                                    >
                                                        <Star className={`w-4 h-4 ${item.favorited ? 'fill-current' : ''}`} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedItem(item)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => generateSummary(item)}
                                                        disabled={summarizing[item.id]}
                                                    >
                                                        {summarizing[item.id] ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <FileDown className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => generateVisualization(item)}
                                                        disabled={visualizing[item.id]}
                                                    >
                                                        {visualizing[item.id] ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <BarChart3 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    {onReuse && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onReuse(item)}
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteItem(item)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        {summaries[item.id] && (
                                            <CardContent>
                                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                                    <p className="text-sm text-[#333F48]">{summaries[item.id]}</p>
                                                </div>
                                            </CardContent>
                                        )}
                                        {summaries[`viz_${item.id}`] && (
                                            <CardContent>
                                                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                                    <h5 className="font-semibold text-sm mb-2">{summaries[`viz_${item.id}`].title}</h5>
                                                    <p className="text-xs text-gray-600 mb-2">{summaries[`viz_${item.id}`].insights}</p>
                                                    <div className="text-xs">
                                                        <strong>Data points:</strong> {summaries[`viz_${item.id}`].chart_data?.length || 0}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#002D62]">{selectedItem?.title}</DialogTitle>
                        <DialogDescription>
                            {selectedItem && t.types[selectedItem.function_type]} • {selectedItem && new Date(selectedItem.created_date).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-[#002D62] mb-3">{t.inputs}</h3>
                                <div className="grid gap-3">
                                    {Object.entries(selectedItem.inputs).map(([key, value]) => (
                                        <Card key={key}>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm text-[#002D62] uppercase">
                                                    {key.replace(/_/g, ' ')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {typeof value === 'object' ? (
                                                    <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200">
                                                        {JSON.stringify(value, null, 2)}
                                                    </pre>
                                                ) : (
                                                    <p className="text-sm text-[#333F48] leading-relaxed whitespace-pre-wrap">
                                                        {value}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {selectedItem.documents_used && selectedItem.documents_used.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[#002D62] mb-3">{t.documentsUsed}</h3>
                                    <div className="space-y-2">
                                        {selectedItem.documents_used.map((doc, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                                <FileText className="w-4 h-4 text-[#002D62]" />
                                                <span className="text-sm">{doc.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-[#002D62] mb-3">{t.outputs}</h3>
                                <div className="grid gap-3">
                                    {typeof selectedItem.outputs === 'object' && selectedItem.outputs !== null ? (
                                        Object.entries(selectedItem.outputs).map(([key, value]) => (
                                            <Card key={key} className="border-green-200 bg-green-50/30">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm text-[#002D62] uppercase flex items-center gap-2">
                                                        {key.replace(/_/g, ' ')}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {typeof value === 'string' && value.startsWith('[') ? (
                                                        <div className="space-y-2">
                                                            {(() => {
                                                                try {
                                                                    const items = JSON.parse(value);
                                                                    return Array.isArray(items) ? items.map((item, i) => (
                                                                        <Card key={i} className="bg-white">
                                                                            <CardContent className="p-3">
                                                                                {typeof item === 'object' ? (
                                                                                    <div className="space-y-2">
                                                                                        {Object.entries(item).map(([k, v]) => (
                                                                                            <div key={k}>
                                                                                                <p className="text-xs font-semibold text-[#002D62] mb-1">
                                                                                                    {k.replace(/_/g, ' ')}:
                                                                                                </p>
                                                                                                <p className="text-sm text-[#333F48] leading-relaxed">
                                                                                                    {typeof v === 'object' ? JSON.stringify(v) : v}
                                                                                                </p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-sm text-[#333F48]">{item}</p>
                                                                                )}
                                                                            </CardContent>
                                                                        </Card>
                                                                    )) : <pre className="bg-white p-3 rounded-lg text-xs overflow-x-auto border">{value}</pre>;
                                                                } catch {
                                                                    return <pre className="bg-white p-3 rounded-lg text-xs overflow-x-auto border">{value}</pre>;
                                                                }
                                                            })()}
                                                        </div>
                                                    ) : typeof value === 'object' ? (
                                                        <div className="space-y-2">
                                                            {Object.entries(value).map(([k, v]) => (
                                                                <div key={k} className="bg-white rounded-lg p-3 border">
                                                                    <p className="text-xs font-semibold text-[#002D62] mb-1">
                                                                        {k.replace(/_/g, ' ')}:
                                                                    </p>
                                                                    <p className="text-sm text-[#333F48] leading-relaxed whitespace-pre-wrap">
                                                                        {typeof v === 'object' ? JSON.stringify(v, null, 2) : v}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white rounded-lg p-4 border">
                                                            <p className="text-sm text-[#333F48] leading-relaxed whitespace-pre-wrap">
                                                                {value}
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card className="border-green-200 bg-green-50/30">
                                            <CardContent className="p-4">
                                                <p className="text-sm text-[#333F48] leading-relaxed whitespace-pre-wrap">
                                                    {String(selectedItem.outputs)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}