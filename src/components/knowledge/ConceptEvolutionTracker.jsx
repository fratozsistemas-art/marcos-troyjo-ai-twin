import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Plus, GitBranch, Calendar, Award, Loader2, Trash2, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ConceptEvolutionTracker({ lang = 'pt' }) {
    const [concepts, setConcepts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showNewConcept, setShowNewConcept] = useState(false);
    const [typeFilter, setTypeFilter] = useState('all');
    const [newConcept, setNewConcept] = useState({
        concept_name: '',
        type: 'heuristica',
        version: 'v1.0',
        content: '',
        impact_phrases: [],
        related_concepts: [],
        thematic_tags: [],
        status: 'ativo'
    });
    const [newPhrase, setNewPhrase] = useState('');

    const translations = {
        pt: {
            title: "Evolução Conceitual",
            desc: "Rastreamento de heurísticas e frameworks",
            newConcept: "Novo Conceito",
            conceptName: "Nome do Conceito",
            type: "Tipo",
            version: "Versão",
            content: "Conteúdo",
            impactPhrases: "Frases de Impacto",
            addPhrase: "Adicionar Frase",
            relatedConcepts: "Conceitos Relacionados",
            tags: "Tags Temáticas",
            status: "Status",
            huaScore: "Validação HUA",
            create: "Criar Conceito",
            cancel: "Cancelar",
            noConcepts: "Nenhum conceito registrado",
            evolution: "Evolução",
            sources: "Fontes",
            types: {
                heuristica: "Heurística",
                metafora: "Metáfora",
                framework: "Framework",
                lente_cognitiva: "Lente Cognitiva",
                principio: "Princípio",
                frase_impacto: "Frase de Impacto"
            },
            statuses: {
                ativo: "Ativo",
                evoluindo: "Evoluindo",
                consolidado: "Consolidado",
                deprecated: "Deprecated",
                em_validacao: "Em Validação"
            }
        },
        en: {
            title: "Conceptual Evolution",
            desc: "Tracking heuristics and frameworks",
            newConcept: "New Concept",
            conceptName: "Concept Name",
            type: "Type",
            version: "Version",
            content: "Content",
            impactPhrases: "Impact Phrases",
            addPhrase: "Add Phrase",
            relatedConcepts: "Related Concepts",
            tags: "Thematic Tags",
            status: "Status",
            huaScore: "HUA Validation",
            create: "Create Concept",
            cancel: "Cancel",
            noConcepts: "No concepts registered",
            evolution: "Evolution",
            sources: "Sources",
            types: {
                heuristica: "Heuristic",
                metafora: "Metaphor",
                framework: "Framework",
                lente_cognitiva: "Cognitive Lens",
                principio: "Principle",
                frase_impacto: "Impact Phrase"
            },
            statuses: {
                ativo: "Active",
                evoluindo: "Evolving",
                consolidado: "Consolidated",
                deprecated: "Deprecated",
                em_validacao: "Under Validation"
            }
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadConcepts();
    }, []);

    const loadConcepts = async () => {
        setIsLoading(true);
        try {
            const conceptList = await base44.entities.ConceptEvolution.list('-created_date', 100);
            setConcepts(conceptList || []);
        } catch (error) {
            console.error('Error loading concepts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createConcept = async () => {
        if (!newConcept.concept_name.trim() || !newConcept.content.trim()) return;

        try {
            const created = await base44.entities.ConceptEvolution.create({
                ...newConcept,
                evolution_history: [{
                    date: new Date().toISOString().split('T')[0],
                    version: newConcept.version,
                    changes: 'Criação inicial',
                    source: 'Manual input'
                }]
            });
            setConcepts(prev => [created, ...prev]);
            setNewConcept({
                concept_name: '',
                type: 'heuristica',
                version: 'v1.0',
                content: '',
                impact_phrases: [],
                related_concepts: [],
                thematic_tags: [],
                status: 'ativo'
            });
            setShowNewConcept(false);
        } catch (error) {
            console.error('Error creating concept:', error);
        }
    };

    const deleteConcept = async (conceptId) => {
        if (!confirm(lang === 'pt' ? 'Excluir este conceito?' : 'Delete this concept?')) return;

        try {
            await base44.entities.ConceptEvolution.delete(conceptId);
            setConcepts(prev => prev.filter(c => c.id !== conceptId));
        } catch (error) {
            console.error('Error deleting concept:', error);
        }
    };

    const addPhrase = () => {
        if (newPhrase.trim()) {
            setNewConcept(prev => ({
                ...prev,
                impact_phrases: [...(prev.impact_phrases || []), newPhrase.trim()]
            }));
            setNewPhrase('');
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            heuristica: 'bg-blue-100 text-blue-800',
            metafora: 'bg-pink-100 text-pink-800',
            framework: 'bg-purple-100 text-purple-800',
            lente_cognitiva: 'bg-indigo-100 text-indigo-800',
            principio: 'bg-green-100 text-green-800',
            frase_impacto: 'bg-amber-100 text-amber-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status) => {
        const colors = {
            ativo: 'bg-green-500',
            evoluindo: 'bg-blue-500',
            consolidado: 'bg-purple-500',
            deprecated: 'bg-gray-500',
            em_validacao: 'bg-yellow-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const filteredConcepts = typeFilter === 'all' 
        ? concepts 
        : concepts.filter(c => c.type === typeFilter);

    return (
        <Card className="border-2 border-[#00654A]">
            <CardHeader className="bg-gradient-to-r from-[#00654A] to-[#B8860B] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription className="text-gray-100">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {/* Filters */}
                <div className="flex gap-3 justify-between">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Tipos</SelectItem>
                            {Object.keys(t.types).map(type => (
                                <SelectItem key={type} value={type}>
                                    {t.types[type]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={showNewConcept} onOpenChange={setShowNewConcept}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#B8860B] hover:bg-[#9a7009]">
                                <Plus className="w-4 h-4 mr-2" />
                                {t.newConcept}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{t.newConcept}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder={t.conceptName}
                                    value={newConcept.concept_name}
                                    onChange={(e) => setNewConcept(prev => ({ ...prev, concept_name: e.target.value }))}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Select
                                        value={newConcept.type}
                                        onValueChange={(value) => setNewConcept(prev => ({ ...prev, type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(t.types).map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {t.types[type]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        placeholder={t.version}
                                        value={newConcept.version}
                                        onChange={(e) => setNewConcept(prev => ({ ...prev, version: e.target.value }))}
                                    />
                                </div>
                                <Textarea
                                    placeholder={t.content}
                                    value={newConcept.content}
                                    onChange={(e) => setNewConcept(prev => ({ ...prev, content: e.target.value }))}
                                    rows={5}
                                />
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        {t.impactPhrases}
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            placeholder="Ex: 'O Brasil só muda depois de um colapso'"
                                            value={newPhrase}
                                            onChange={(e) => setNewPhrase(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addPhrase()}
                                        />
                                        <Button onClick={addPhrase} size="sm">
                                            {t.addPhrase}
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                        {newConcept.impact_phrases?.map((phrase, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-amber-50 rounded text-sm">
                                                <span className="text-amber-900 italic">"{phrase}"</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setNewConcept(prev => ({
                                                        ...prev,
                                                        impact_phrases: prev.impact_phrases.filter((_, i) => i !== idx)
                                                    }))}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Select
                                    value={newConcept.status}
                                    onValueChange={(value) => setNewConcept(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t.status} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(t.statuses).map(status => (
                                            <SelectItem key={status} value={status}>
                                                {t.statuses[status]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={createConcept}
                                        disabled={!newConcept.concept_name.trim() || !newConcept.content.trim()}
                                        className="flex-1 bg-[#B8860B] hover:bg-[#9a7009]"
                                    >
                                        {t.create}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowNewConcept(false)}>
                                        {t.cancel}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Concepts Timeline */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00654A]" />
                    </div>
                ) : filteredConcepts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{t.noConcepts}</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        <AnimatePresence>
                            {filteredConcepts.map((concept) => (
                                <motion.div
                                    key={concept.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Card className="bg-white border-l-4" 
                                        style={{ borderLeftColor: concept.type === 'heuristica' ? '#00654A' : '#B8860B' }}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <h4 className="font-bold text-[#002D62] text-lg">
                                                            {concept.concept_name}
                                                        </h4>
                                                        <Badge className={getTypeColor(concept.type)}>
                                                            {t.types[concept.type]}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {concept.version}
                                                        </Badge>
                                                        <div className="flex items-center gap-1">
                                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(concept.status)}`} />
                                                            <span className="text-xs text-gray-500">
                                                                {t.statuses[concept.status]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-3">
                                                        {concept.content}
                                                    </p>
                                                    
                                                    {concept.impact_phrases && concept.impact_phrases.length > 0 && (
                                                        <div className="mb-3">
                                                            <div className="text-xs font-semibold text-[#B8860B] mb-1">
                                                                {t.impactPhrases}:
                                                            </div>
                                                            <div className="space-y-1">
                                                                {concept.impact_phrases.map((phrase, idx) => (
                                                                    <p key={idx} className="text-sm text-gray-600 italic border-l-2 border-[#B8860B] pl-3 py-1">
                                                                        "{phrase}"
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {concept.hua_score && (
                                                        <div className="flex gap-2 mb-3">
                                                            <Badge variant="outline" className="text-xs">
                                                                H: {concept.hua_score.hierarchy || 0}/100
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                U: {concept.hua_score.utility || 0}/100
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                A: {concept.hua_score.adherence || 0}/100
                                                            </Badge>
                                                        </div>
                                                    )}

                                                    {concept.thematic_tags && concept.thematic_tags.length > 0 && (
                                                        <div className="flex gap-1 flex-wrap">
                                                            {concept.thematic_tags.map((tag, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                                                                    #{tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {concept.evolution_history && concept.evolution_history.length > 1 && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                                <GitBranch className="w-3 h-3" />
                                                                <span>{t.evolution}: {concept.evolution_history.length} versões</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                {concept.evolution_history.slice(-3).map((ev, idx) => (
                                                                    <div key={idx} className="text-xs text-gray-600 pl-4 border-l-2 border-gray-200">
                                                                        <span className="font-semibold">{ev.version}</span> - {ev.date}
                                                                        {ev.changes && <span className="block text-gray-500">{ev.changes}</span>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteConcept(concept.id)}
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