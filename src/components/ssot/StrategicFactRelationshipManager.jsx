import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Link2, Unlink, Sparkles, Loader2, Search, 
    ExternalLink, Tag, Calendar, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function StrategicFactRelationshipManager({ fact, onUpdate, lang = 'pt' }) {
    const [linkedFacts, setLinkedFacts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingLinked, setIsLoadingLinked] = useState(false);
    const [aiReasoning, setAiReasoning] = useState('');

    const t = {
        pt: {
            title: 'Fatos Relacionados',
            description: 'Gerencie conexões entre fatos estratégicos',
            linked: 'Vinculados',
            suggestions: 'Sugestões de IA',
            search: 'Buscar Fatos',
            searchPlaceholder: 'Buscar por ID, tópico ou tags...',
            loadingSuggestions: 'Carregando sugestões...',
            noLinked: 'Nenhum fato vinculado',
            noSuggestions: 'Nenhuma sugestão disponível',
            noResults: 'Nenhum resultado encontrado',
            link: 'Vincular',
            unlink: 'Desvincular',
            getSuggestions: 'Obter Sugestões de IA',
            aiReasoning: 'Raciocínio da IA',
            confidence: 'Relevância'
        },
        en: {
            title: 'Related Facts',
            description: 'Manage connections between strategic facts',
            linked: 'Linked',
            suggestions: 'AI Suggestions',
            search: 'Search Facts',
            searchPlaceholder: 'Search by ID, topic, or tags...',
            loadingSuggestions: 'Loading suggestions...',
            noLinked: 'No linked facts',
            noSuggestions: 'No suggestions available',
            noResults: 'No results found',
            link: 'Link',
            unlink: 'Unlink',
            getSuggestions: 'Get AI Suggestions',
            aiReasoning: 'AI Reasoning',
            confidence: 'Relevance'
        }
    };

    const text = t[lang];

    useEffect(() => {
        if (fact?.related_fact_ids?.length > 0) {
            loadLinkedFacts();
        }
    }, [fact?.related_fact_ids]);

    const loadLinkedFacts = async () => {
        setIsLoadingLinked(true);
        try {
            const allFacts = await base44.entities.StrategicFact.list();
            const linked = allFacts.filter(f => 
                fact.related_fact_ids.includes(f.fact_id)
            );
            setLinkedFacts(linked);
        } catch (error) {
            console.error('Error loading linked facts:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar fatos vinculados' : 'Error loading linked facts');
        } finally {
            setIsLoadingLinked(false);
        }
    };

    const loadSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const response = await base44.functions.invoke('suggestRelatedStrategicFacts', {
                fact_id: fact.fact_id
            });
            setSuggestions(response.data.suggestions || []);
            setAiReasoning(response.data.ai_reasoning || '');
            toast.success(lang === 'pt' 
                ? `${response.data.suggestions.length} sugestões encontradas` 
                : `${response.data.suggestions.length} suggestions found`
            );
        } catch (error) {
            console.error('Error loading suggestions:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar sugestões' : 'Error loading suggestions');
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleLink = async (targetFactId) => {
        try {
            await base44.functions.invoke('linkStrategicFacts', {
                source_fact_id: fact.fact_id,
                target_fact_id: targetFactId,
                action: 'add'
            });
            toast.success(lang === 'pt' ? 'Fato vinculado com sucesso' : 'Fact linked successfully');
            if (onUpdate) onUpdate();
            loadLinkedFacts();
            
            // Remove from suggestions
            setSuggestions(prev => prev.filter(s => s.fact_id !== targetFactId));
        } catch (error) {
            console.error('Error linking fact:', error);
            toast.error(lang === 'pt' ? 'Erro ao vincular fato' : 'Error linking fact');
        }
    };

    const handleUnlink = async (targetFactId) => {
        try {
            await base44.functions.invoke('linkStrategicFacts', {
                source_fact_id: fact.fact_id,
                target_fact_id: targetFactId,
                action: 'remove'
            });
            toast.success(lang === 'pt' ? 'Vínculo removido com sucesso' : 'Link removed successfully');
            if (onUpdate) onUpdate();
            loadLinkedFacts();
        } catch (error) {
            console.error('Error unlinking fact:', error);
            toast.error(lang === 'pt' ? 'Erro ao remover vínculo' : 'Error removing link');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const allFacts = await base44.entities.StrategicFact.list();
            const results = allFacts.filter(f => {
                if (f.fact_id === fact.fact_id) return false;
                const query = searchQuery.toLowerCase();
                return (
                    f.fact_id.toLowerCase().includes(query) ||
                    f.topic_id.toLowerCase().includes(query) ||
                    f.topic_label.toLowerCase().includes(query) ||
                    f.summary.toLowerCase().includes(query) ||
                    (f.tags || []).some(tag => tag.toLowerCase().includes(query))
                );
            });
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching facts:', error);
            toast.error(lang === 'pt' ? 'Erro ao buscar fatos' : 'Error searching facts');
        }
    };

    const FactCard = ({ fact: f, isLinked, onLink, onUnlink, showRelevance }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 border rounded-lg hover:border-[#002D62] transition-colors"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                            {f.fact_id}
                        </Badge>
                        {showRelevance && f.relevance_score && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                                {text.confidence}: {(f.relevance_score * 100).toFixed(0)}%
                            </Badge>
                        )}
                    </div>
                    <h4 className="font-semibold text-sm text-[#002D62] mb-1">
                        {f.topic_label}
                    </h4>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {f.summary}
                    </p>
                    {showRelevance && f.match_reason && (
                        <p className="text-xs text-gray-500 italic mb-2">
                            {f.match_reason}
                        </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                        {(f.tags || []).slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                        {f.start_date && (
                            <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {f.start_date}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    {isLinked ? (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onUnlink(f.fact_id)}
                        >
                            <Unlink className="w-4 h-4 mr-1" />
                            {text.unlink}
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => onLink(f.fact_id)}
                        >
                            <Link2 className="w-4 h-4 mr-1" />
                            {text.link}
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-[#002D62]" />
                    {text.title}
                </CardTitle>
                <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="linked" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="linked">
                            {text.linked} ({linkedFacts.length})
                        </TabsTrigger>
                        <TabsTrigger value="suggestions">
                            <Sparkles className="w-4 h-4 mr-1" />
                            {text.suggestions} ({suggestions.length})
                        </TabsTrigger>
                        <TabsTrigger value="search">
                            <Search className="w-4 h-4 mr-1" />
                            {text.search}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="linked" className="space-y-4">
                        {isLoadingLinked ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                            </div>
                        ) : linkedFacts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Link2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>{text.noLinked}</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-96">
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {linkedFacts.map(f => (
                                            <FactCard
                                                key={f.fact_id}
                                                fact={f}
                                                isLinked={true}
                                                onUnlink={handleUnlink}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>

                    <TabsContent value="suggestions" className="space-y-4">
                        <Button
                            onClick={loadSuggestions}
                            disabled={isLoadingSuggestions}
                            className="w-full"
                        >
                            {isLoadingSuggestions ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {text.loadingSuggestions}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    {text.getSuggestions}
                                </>
                            )}
                        </Button>

                        {aiReasoning && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs font-semibold text-blue-900 mb-1">
                                    {text.aiReasoning}:
                                </p>
                                <p className="text-xs text-blue-800">{aiReasoning}</p>
                            </div>
                        )}

                        {suggestions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>{text.noSuggestions}</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-96">
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {suggestions.map(f => (
                                            <FactCard
                                                key={f.fact_id}
                                                fact={f}
                                                isLinked={false}
                                                onLink={handleLink}
                                                showRelevance={true}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>

                    <TabsContent value="search" className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder={text.searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch}>
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>

                        {searchResults.length === 0 && searchQuery ? (
                            <div className="text-center py-8 text-gray-500">
                                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>{text.noResults}</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-96">
                                <div className="space-y-3">
                                    <AnimatePresence>
                                        {searchResults.map(f => (
                                            <FactCard
                                                key={f.fact_id}
                                                fact={f}
                                                isLinked={linkedFacts.some(lf => lf.fact_id === f.fact_id)}
                                                onLink={handleLink}
                                                onUnlink={handleUnlink}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}