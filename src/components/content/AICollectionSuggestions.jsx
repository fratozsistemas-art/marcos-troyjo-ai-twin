import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AICollectionSuggestions({ 
    contentType = 'article',
    title,
    tags = [],
    description,
    onCollectionsSelected,
    lang = 'pt' 
}) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState(new Set());
    const [expanded, setExpanded] = useState(false);

    const t = {
        pt: {
            title: 'Sugestões de Coleções por IA',
            suggest: 'Sugerir Coleções',
            suggesting: 'Analisando...',
            add: 'Adicionar às Selecionadas',
            confidence: 'Confiança',
            reasoning: 'Motivo',
            noSuggestions: 'Nenhuma coleção compatível encontrada',
            assessment: 'Análise Geral'
        },
        en: {
            title: 'AI Collection Suggestions',
            suggest: 'Suggest Collections',
            suggesting: 'Analyzing...',
            add: 'Add to Selected',
            confidence: 'Confidence',
            reasoning: 'Reasoning',
            noSuggestions: 'No matching collections found',
            assessment: 'Overall Assessment'
        }
    }[lang];

    const handleSuggest = async () => {
        if (!title) {
            toast.error(lang === 'pt' ? 'Título é necessário' : 'Title required');
            return;
        }

        setLoading(true);
        try {
            const response = await base44.functions.invoke('suggestCollections', {
                content_type: contentType,
                title,
                tags,
                description
            });

            if (response.data.success) {
                setSuggestions(response.data.suggested_collections);
                setExpanded(true);
                
                if (response.data.suggested_collections.length === 0) {
                    toast.info(t.noSuggestions);
                } else {
                    toast.success(
                        lang === 'pt' 
                            ? `${response.data.suggested_collections.length} coleções sugeridas!` 
                            : `${response.data.suggested_collections.length} collections suggested!`
                    );
                }
            }
        } catch (error) {
            console.error('Error suggesting collections:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleCollection = (collectionId) => {
        const newSelected = new Set(selectedCollections);
        if (newSelected.has(collectionId)) {
            newSelected.delete(collectionId);
        } else {
            newSelected.add(collectionId);
        }
        setSelectedCollections(newSelected);
    };

    const handleAdd = () => {
        const collectionsToAdd = Array.from(selectedCollections);
        if (collectionsToAdd.length === 0) {
            toast.error(lang === 'pt' ? 'Selecione pelo menos uma coleção' : 'Select at least one collection');
            return;
        }
        
        onCollectionsSelected(collectionsToAdd);
        toast.success(
            lang === 'pt' 
                ? `Adicionado a ${collectionsToAdd.length} coleções!` 
                : `Added to ${collectionsToAdd.length} collections!`
        );
        setSuggestions([]);
        setSelectedCollections(new Set());
        setExpanded(false);
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-orange-600';
    };

    return (
        <Card className="border-2 border-blue-100">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-600 text-sm">
                        <FolderPlus className="w-4 h-4" />
                        {t.title}
                    </CardTitle>
                    <Button
                        onClick={handleSuggest}
                        disabled={loading || !title}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {t.suggesting}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3 h-3" />
                                {t.suggest}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>

            <AnimatePresence>
                {expanded && suggestions.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <CardContent className="space-y-3">
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleAdd}
                                    size="sm"
                                    disabled={selectedCollections.size === 0}
                                    className="gap-2"
                                >
                                    <Check className="w-3 h-3" />
                                    {t.add} ({selectedCollections.size})
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {suggestions.map((suggestion, idx) => {
                                    const isSelected = selectedCollections.has(suggestion.collection_id);
                                    
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => toggleCollection(suggestion.collection_id)}
                                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                isSelected 
                                                    ? 'border-blue-500 bg-blue-50' 
                                                    : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                            style={{
                                                borderLeftWidth: '4px',
                                                borderLeftColor: suggestion.collection_color || '#002D62'
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-2 flex-1">
                                                    {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                                                    <h4 className="font-semibold text-sm text-gray-900">
                                                        {suggestion.collection_name}
                                                    </h4>
                                                </div>
                                                <Badge 
                                                    variant="outline" 
                                                    className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                                                >
                                                    {Math.round(suggestion.confidence * 100)}%
                                                </Badge>
                                            </div>
                                            
                                            <p className="text-xs text-gray-600 mb-2">
                                                {suggestion.reasoning}
                                            </p>

                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Badge variant="secondary" className="text-xs">
                                                    {suggestion.current_item_count} {lang === 'pt' ? 'itens' : 'items'}
                                                </Badge>
                                                {suggestion.collection_type && (
                                                    <span className="opacity-60">
                                                        {suggestion.collection_type}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}