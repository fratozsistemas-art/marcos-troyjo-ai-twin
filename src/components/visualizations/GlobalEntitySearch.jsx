import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Database } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SEARCHABLE_ENTITIES = [
    'Forum', 'Event', 'KeyActor', 'Document', 'Publication', 
    'Book', 'Award', 'Vocabulary', 'ConceptEvolution'
];

export default function GlobalEntitySearch({ isOpen, onClose, onSelect, lang = 'pt' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({});
    const [isSearching, setIsSearching] = useState(false);

    const t = {
        pt: {
            title: 'Busca Global de Dados',
            placeholder: 'Digite para buscar em todas as entidades...',
            searching: 'Buscando...',
            noResults: 'Nenhum resultado encontrado',
            results: 'resultados'
        },
        en: {
            title: 'Global Data Search',
            placeholder: 'Type to search across all entities...',
            searching: 'Searching...',
            noResults: 'No results found',
            results: 'results'
        }
    };

    useEffect(() => {
        if (query.length >= 2) {
            const debounce = setTimeout(performSearch, 300);
            return () => clearTimeout(debounce);
        } else {
            setResults({});
        }
    }, [query]);

    const performSearch = async () => {
        setIsSearching(true);
        const searchResults = {};

        try {
            await Promise.all(
                SEARCHABLE_ENTITIES.map(async (entity) => {
                    try {
                        const data = await base44.entities[entity].list();
                        const filtered = data.filter(item => {
                            const searchStr = JSON.stringify(item).toLowerCase();
                            return searchStr.includes(query.toLowerCase());
                        }).slice(0, 5);

                        if (filtered.length > 0) {
                            searchResults[entity] = filtered;
                        }
                    } catch (error) {
                        console.error(`Error searching ${entity}:`, error);
                    }
                })
            );

            setResults(searchResults);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelect = (entity, record) => {
        onSelect(entity, record);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{t[lang].title}</DialogTitle>
                </DialogHeader>

                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t[lang].placeholder}
                        className="pl-10"
                        autoFocus
                    />
                </div>

                <div className="space-y-4 overflow-auto max-h-[50vh]">
                    {isSearching ? (
                        <div className="py-8 text-center">
                            <Loader2 className="w-6 h-6 animate-spin text-[#002D62] mx-auto mb-2" />
                            <p className="text-sm text-gray-500">{t[lang].searching}</p>
                        </div>
                    ) : Object.keys(results).length === 0 && query.length >= 2 ? (
                        <div className="py-8 text-center text-gray-400">
                            <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>{t[lang].noResults}</p>
                        </div>
                    ) : (
                        Object.entries(results).map(([entity, items]) => (
                            <div key={entity}>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-sm text-[#002D62]">{entity}</h3>
                                    <Badge variant="outline" className="text-xs">
                                        {items.length} {t[lang].results}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {items.map((item, idx) => (
                                        <button
                                            key={item.id || idx}
                                            onClick={() => handleSelect(entity, item)}
                                            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-[#002D62] hover:bg-gray-50 transition-all"
                                        >
                                            <div className="font-medium text-sm text-gray-800">
                                                {item.name || item.title || item.term || item.id}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                {item.description || item.definition || JSON.stringify(item).slice(0, 100)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}