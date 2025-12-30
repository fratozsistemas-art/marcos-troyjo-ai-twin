import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AITagSuggestions({ 
    contentType = 'article',
    title,
    content,
    description,
    existingTags = [],
    onTagsSelected,
    lang = 'pt' 
}) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedTags, setSelectedTags] = useState(new Set());
    const [expanded, setExpanded] = useState(false);

    const t = {
        pt: {
            title: 'Sugestões de Tags por IA',
            suggest: 'Sugerir Tags',
            suggesting: 'Analisando...',
            apply: 'Aplicar Selecionadas',
            selectAll: 'Selecionar Todas',
            confidence: 'Confiança',
            new: 'Nova',
            reasoning: 'Análise'
        },
        en: {
            title: 'AI Tag Suggestions',
            suggest: 'Suggest Tags',
            suggesting: 'Analyzing...',
            apply: 'Apply Selected',
            selectAll: 'Select All',
            confidence: 'Confidence',
            new: 'New',
            reasoning: 'Analysis'
        }
    }[lang];

    const handleSuggest = async () => {
        if (!title || !content) {
            toast.error(lang === 'pt' ? 'Título e conteúdo são necessários' : 'Title and content required');
            return;
        }

        setLoading(true);
        try {
            const response = await base44.functions.invoke('suggestContentTags', {
                content_type: contentType,
                title,
                content,
                description,
                existing_tags: existingTags,
                max_tags: 10
            });

            if (response.data.success) {
                setSuggestions(response.data.suggested_tags);
                setExpanded(true);
                toast.success(
                    lang === 'pt' 
                        ? `${response.data.suggested_tags.length} tags sugeridas!` 
                        : `${response.data.suggested_tags.length} tags suggested!`
                );
            }
        } catch (error) {
            console.error('Error suggesting tags:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tag) => {
        const newSelected = new Set(selectedTags);
        if (newSelected.has(tag)) {
            newSelected.delete(tag);
        } else {
            newSelected.add(tag);
        }
        setSelectedTags(newSelected);
    };

    const handleApply = () => {
        const tagsToAdd = Array.from(selectedTags);
        if (tagsToAdd.length === 0) {
            toast.error(lang === 'pt' ? 'Selecione pelo menos uma tag' : 'Select at least one tag');
            return;
        }
        
        onTagsSelected(tagsToAdd);
        toast.success(
            lang === 'pt' 
                ? `${tagsToAdd.length} tags aplicadas!` 
                : `${tagsToAdd.length} tags applied!`
        );
        setSuggestions([]);
        setSelectedTags(new Set());
        setExpanded(false);
    };

    const handleSelectAll = () => {
        const allTags = suggestions.filter(s => s.is_new).map(s => s.tag);
        setSelectedTags(new Set(allTags));
    };

    return (
        <Card className="border-2 border-purple-100">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-purple-600 text-sm">
                        <Sparkles className="w-4 h-4" />
                        {t.title}
                    </CardTitle>
                    <Button
                        onClick={handleSuggest}
                        disabled={loading || !title || !content}
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
                            <div className="flex items-center justify-between">
                                <Button
                                    onClick={handleSelectAll}
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs"
                                >
                                    {t.selectAll}
                                </Button>
                                <Button
                                    onClick={handleApply}
                                    size="sm"
                                    disabled={selectedTags.size === 0}
                                    className="gap-2"
                                >
                                    <Check className="w-3 h-3" />
                                    {t.apply} ({selectedTags.size})
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, idx) => {
                                    const isSelected = selectedTags.has(suggestion.tag);
                                    const isNew = suggestion.is_new;
                                    
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <Badge
                                                onClick={() => isNew && toggleTag(suggestion.tag)}
                                                className={`cursor-pointer transition-all ${
                                                    isSelected 
                                                        ? 'bg-purple-600 text-white' 
                                                        : isNew
                                                        ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 mr-1" />}
                                                {suggestion.tag}
                                                {isNew && (
                                                    <span className="ml-1 text-xs opacity-60">
                                                        ({Math.round(suggestion.confidence * 100)}%)
                                                    </span>
                                                )}
                                                {!isNew && (
                                                    <span className="ml-1 text-xs">✓</span>
                                                )}
                                            </Badge>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {suggestions.length > 0 && (
                                <div className="text-xs text-gray-500 pt-2 border-t">
                                    <span className="font-semibold">{t.new}:</span> {suggestions.filter(s => s.is_new).length} | 
                                    <span className="ml-2 font-semibold">{lang === 'pt' ? 'Existentes' : 'Existing'}:</span> {suggestions.filter(s => !s.is_new).length}
                                </div>
                            )}
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}