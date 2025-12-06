import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Search, Filter, Clock, TrendingUp, Loader2, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VocabularyManager({ lang = 'pt' }) {
    const [vocabulary, setVocabulary] = useState([]);
    const [filteredVocab, setFilteredVocab] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showNewTerm, setShowNewTerm] = useState(false);
    const [newTerm, setNewTerm] = useState({
        term: '',
        category: 'conceito_tecnico',
        definition: '',
        simple_explanation: '',
        technical_explanation: '',
        context_of_use: '',
        example_usage: '',
        related_terms: [],
        frequency: 'media',
        audience_level: 'geral'
    });

    const translations = {
        pt: {
            title: "Glossário Técnico Troyjano",
            desc: "Vocabulário, termos e neologismos",
            newTerm: "Novo Termo",
            search: "Buscar termo...",
            category: "Categoria",
            all: "Todas",
            definition: "Definição",
            simpleExpl: "Explicação Simples",
            technicalExpl: "Explicação Técnica",
            context: "Contexto de Uso",
            example: "Exemplo de Uso",
            relatedTerms: "Termos Relacionados",
            frequency: "Frequência",
            audienceLevel: "Nível de Audiência",
            create: "Criar Termo",
            cancel: "Cancelar",
            noTerms: "Nenhum termo cadastrado",
            categories: {
                economia_internacional: "Economia Internacional",
                diplomacia: "Diplomacia",
                competitividade: "Competitividade",
                geopolitica: "Geopolítica",
                neologismo_troyjo: "Neologismo Troyjo",
                metafora: "Metáfora",
                conceito_tecnico: "Conceito Técnico"
            },
            frequencyLevels: {
                muito_alta: "Muito Alta",
                alta: "Alta",
                media: "Média",
                baixa: "Baixa",
                ocasional: "Ocasional"
            },
            audienceLevels: {
                geral: "Público Geral",
                intermediario: "Intermediário",
                tecnico: "Técnico",
                academico: "Acadêmico"
            }
        },
        en: {
            title: "Troyjan Technical Glossary",
            desc: "Vocabulary, terms and neologisms",
            newTerm: "New Term",
            search: "Search term...",
            category: "Category",
            all: "All",
            definition: "Definition",
            simpleExpl: "Simple Explanation",
            technicalExpl: "Technical Explanation",
            context: "Context of Use",
            example: "Usage Example",
            relatedTerms: "Related Terms",
            frequency: "Frequency",
            audienceLevel: "Audience Level",
            create: "Create Term",
            cancel: "Cancel",
            noTerms: "No terms registered",
            categories: {
                economia_internacional: "International Economics",
                diplomacia: "Diplomacy",
                competitividade: "Competitiveness",
                geopolitica: "Geopolitics",
                neologismo_troyjo: "Troyjo Neologism",
                metafora: "Metaphor",
                conceito_tecnico: "Technical Concept"
            },
            frequencyLevels: {
                muito_alta: "Very High",
                alta: "High",
                media: "Medium",
                baixa: "Low",
                ocasional: "Occasional"
            },
            audienceLevels: {
                geral: "General Public",
                intermediario: "Intermediate",
                tecnico: "Technical",
                academico: "Academic"
            }
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadVocabulary();
    }, []);

    useEffect(() => {
        filterVocabulary();
    }, [vocabulary, searchTerm, categoryFilter]);

    const loadVocabulary = async () => {
        setIsLoading(true);
        try {
            const vocabList = await base44.entities.Vocabulary.list('-frequency', 200);
            setVocabulary(vocabList || []);
        } catch (error) {
            console.error('Error loading vocabulary:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterVocabulary = () => {
        let filtered = vocabulary;

        if (searchTerm.trim()) {
            filtered = filtered.filter(term => 
                term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                term.definition.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(term => term.category === categoryFilter);
        }

        setFilteredVocab(filtered);
    };

    const createTerm = async () => {
        if (!newTerm.term.trim() || !newTerm.definition.trim()) return;

        try {
            const created = await base44.entities.Vocabulary.create(newTerm);
            setVocabulary(prev => [created, ...prev]);
            setNewTerm({
                term: '',
                category: 'conceito_tecnico',
                definition: '',
                simple_explanation: '',
                technical_explanation: '',
                context_of_use: '',
                example_usage: '',
                related_terms: [],
                frequency: 'media',
                audience_level: 'geral'
            });
            setShowNewTerm(false);
        } catch (error) {
            console.error('Error creating term:', error);
        }
    };

    const deleteTerm = async (termId) => {
        if (!confirm(lang === 'pt' ? 'Excluir este termo?' : 'Delete this term?')) return;

        try {
            await base44.entities.Vocabulary.delete(termId);
            setVocabulary(prev => prev.filter(t => t.id !== termId));
        } catch (error) {
            console.error('Error deleting term:', error);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            economia_internacional: 'bg-blue-100 text-blue-800',
            diplomacia: 'bg-indigo-100 text-indigo-800',
            competitividade: 'bg-green-100 text-green-800',
            geopolitica: 'bg-purple-100 text-purple-800',
            neologismo_troyjo: 'bg-amber-100 text-amber-800',
            metafora: 'bg-pink-100 text-pink-800',
            conceito_tecnico: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getFrequencyColor = (frequency) => {
        const colors = {
            muito_alta: 'bg-red-500',
            alta: 'bg-orange-500',
            media: 'bg-yellow-500',
            baixa: 'bg-blue-500',
            ocasional: 'bg-gray-500'
        };
        return colors[frequency] || 'bg-gray-500';
    };

    return (
        <Card className="border-2 border-[#002D62]">
            <CardHeader className="bg-gradient-to-r from-[#002D62] to-[#00654A] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription className="text-gray-100">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {/* Search and Filters */}
                <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder={t.search}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.all}</SelectItem>
                            {Object.keys(t.categories).map(cat => (
                                <SelectItem key={cat} value={cat}>
                                    {t.categories[cat]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={showNewTerm} onOpenChange={setShowNewTerm}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#00654A] hover:bg-[#004d38]">
                                <Plus className="w-4 h-4 mr-2" />
                                {t.newTerm}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{t.newTerm}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Termo"
                                    value={newTerm.term}
                                    onChange={(e) => setNewTerm(prev => ({ ...prev, term: e.target.value }))}
                                />
                                <Select
                                    value={newTerm.category}
                                    onValueChange={(value) => setNewTerm(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(t.categories).map(cat => (
                                            <SelectItem key={cat} value={cat}>
                                                {t.categories[cat]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Textarea
                                    placeholder={t.definition}
                                    value={newTerm.definition}
                                    onChange={(e) => setNewTerm(prev => ({ ...prev, definition: e.target.value }))}
                                    rows={3}
                                />
                                <Textarea
                                    placeholder={t.simpleExpl}
                                    value={newTerm.simple_explanation}
                                    onChange={(e) => setNewTerm(prev => ({ ...prev, simple_explanation: e.target.value }))}
                                    rows={2}
                                />
                                <Textarea
                                    placeholder={t.technicalExpl}
                                    value={newTerm.technical_explanation}
                                    onChange={(e) => setNewTerm(prev => ({ ...prev, technical_explanation: e.target.value }))}
                                    rows={3}
                                />
                                <Textarea
                                    placeholder={t.context}
                                    value={newTerm.context_of_use}
                                    onChange={(e) => setNewTerm(prev => ({ ...prev, context_of_use: e.target.value }))}
                                    rows={2}
                                />
                                <Textarea
                                    placeholder={t.example}
                                    value={newTerm.example_usage}
                                    onChange={(e) => setNewTerm(prev => ({ ...prev, example_usage: e.target.value }))}
                                    rows={2}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Select
                                        value={newTerm.frequency}
                                        onValueChange={(value) => setNewTerm(prev => ({ ...prev, frequency: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t.frequency} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(t.frequencyLevels).map(freq => (
                                                <SelectItem key={freq} value={freq}>
                                                    {t.frequencyLevels[freq]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={newTerm.audience_level}
                                        onValueChange={(value) => setNewTerm(prev => ({ ...prev, audience_level: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t.audienceLevel} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(t.audienceLevels).map(level => (
                                                <SelectItem key={level} value={level}>
                                                    {t.audienceLevels[level]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={createTerm}
                                        disabled={!newTerm.term.trim() || !newTerm.definition.trim()}
                                        className="flex-1 bg-[#00654A] hover:bg-[#004d38]"
                                    >
                                        {t.create}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowNewTerm(false)}
                                    >
                                        {t.cancel}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : filteredVocab.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{t.noTerms}</p>
                    </div>
                ) : (
                    <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                        <AnimatePresence>
                            {filteredVocab.map((term) => (
                                <motion.div
                                    key={term.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Card className="bg-white hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-[#002D62] text-lg">
                                                            {term.term}
                                                        </h4>
                                                        <Badge className={getCategoryColor(term.category)}>
                                                            {t.categories[term.category]}
                                                        </Badge>
                                                        <div className="flex items-center gap-1">
                                                            <div 
                                                                className={`w-2 h-2 rounded-full ${getFrequencyColor(term.frequency)}`}
                                                            />
                                                            <span className="text-xs text-gray-500">
                                                                {t.frequencyLevels[term.frequency]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        <strong>{t.definition}:</strong> {term.definition}
                                                    </p>
                                                    {term.simple_explanation && (
                                                        <p className="text-sm text-gray-600 mb-2 bg-blue-50 p-2 rounded">
                                                            <strong className="text-blue-800">💡 {t.simpleExpl}:</strong> {term.simple_explanation}
                                                        </p>
                                                    )}
                                                    {term.technical_explanation && (
                                                        <p className="text-sm text-gray-600 mb-2 bg-purple-50 p-2 rounded">
                                                            <strong className="text-purple-800">🎓 {t.technicalExpl}:</strong> {term.technical_explanation}
                                                        </p>
                                                    )}
                                                    {term.example_usage && (
                                                        <p className="text-sm text-gray-600 italic border-l-2 border-[#B8860B] pl-3">
                                                            "{term.example_usage}"
                                                        </p>
                                                    )}
                                                    {term.related_terms && term.related_terms.length > 0 && (
                                                        <div className="flex gap-1 flex-wrap mt-2">
                                                            {term.related_terms.map((rt, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">
                                                                    {rt}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteTerm(term.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}