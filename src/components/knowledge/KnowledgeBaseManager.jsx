import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Save, X, Loader2, Calendar, Tag, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function KnowledgeBaseManager({ lang = 'pt' }) {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewingEntry, setViewingEntry] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        body: '',
        tags: [],
        category: 'outro',
        source_url: '',
        author: '',
        keywords: []
    });
    const [newTag, setNewTag] = useState('');
    const [newKeyword, setNewKeyword] = useState('');

    const t = {
        pt: {
            title: 'Base de Conhecimento',
            desc: 'Gerencie entradas da base de conhecimento',
            addEntry: 'Adicionar Entrada',
            editEntry: 'Editar Entrada',
            search: 'Buscar por título, resumo ou palavras-chave...',
            filterByCategory: 'Filtrar por Categoria',
            allCategories: 'Todas',
            noEntries: 'Nenhuma entrada encontrada',
            titleLabel: 'Título',
            dateLabel: 'Data',
            summaryLabel: 'Resumo',
            bodyLabel: 'Conteúdo (Markdown)',
            tagsLabel: 'Tags',
            addTag: 'Adicionar tag',
            categoryLabel: 'Categoria',
            sourceLabel: 'URL da Fonte',
            authorLabel: 'Autor',
            keywordsLabel: 'Palavras-chave',
            addKeyword: 'Adicionar palavra-chave',
            save: 'Salvar',
            saving: 'Salvando...',
            cancel: 'Cancelar',
            delete: 'Excluir',
            view: 'Visualizar',
            edit: 'Editar',
            deleteConfirm: 'Tem certeza que deseja excluir esta entrada?',
            categories: {
                discurso: 'Discurso',
                artigo: 'Artigo',
                entrevista: 'Entrevista',
                conceito: 'Conceito',
                analise: 'Análise',
                nota: 'Nota',
                outro: 'Outro'
            }
        },
        en: {
            title: 'Knowledge Base',
            desc: 'Manage knowledge base entries',
            addEntry: 'Add Entry',
            editEntry: 'Edit Entry',
            search: 'Search by title, summary or keywords...',
            filterByCategory: 'Filter by Category',
            allCategories: 'All',
            noEntries: 'No entries found',
            titleLabel: 'Title',
            dateLabel: 'Date',
            summaryLabel: 'Summary',
            bodyLabel: 'Content (Markdown)',
            tagsLabel: 'Tags',
            addTag: 'Add tag',
            categoryLabel: 'Category',
            sourceLabel: 'Source URL',
            authorLabel: 'Author',
            keywordsLabel: 'Keywords',
            addKeyword: 'Add keyword',
            save: 'Save',
            saving: 'Saving...',
            cancel: 'Cancel',
            delete: 'Delete',
            view: 'View',
            edit: 'Edit',
            deleteConfirm: 'Are you sure you want to delete this entry?',
            categories: {
                discurso: 'Speech',
                artigo: 'Article',
                entrevista: 'Interview',
                conceito: 'Concept',
                analise: 'Analysis',
                nota: 'Note',
                outro: 'Other'
            }
        }
    }[lang];

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        setIsLoading(true);
        try {
            const allEntries = await base44.entities.KnowledgeEntry.list('-date');
            setEntries(allEntries);
        } catch (error) {
            console.error('Error loading entries:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar entradas' : 'Error loading entries');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = !searchQuery || 
            entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
        
        const matchesTags = selectedTags.length === 0 || 
            selectedTags.every(tag => entry.tags?.includes(tag));

        return matchesSearch && matchesCategory && matchesTags;
    });

    const allTags = [...new Set(entries.flatMap(e => e.tags || []))];

    const openDialog = (entry = null) => {
        if (entry) {
            setEditingEntry(entry);
            setFormData({
                title: entry.title || '',
                date: entry.date || new Date().toISOString().split('T')[0],
                summary: entry.summary || '',
                body: entry.body || '',
                tags: entry.tags || [],
                category: entry.category || 'outro',
                source_url: entry.source_url || '',
                author: entry.author || '',
                keywords: entry.keywords || []
            });
        } else {
            setEditingEntry(null);
            setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                summary: '',
                body: '',
                tags: [],
                category: 'outro',
                source_url: '',
                author: '',
                keywords: []
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.body) {
            toast.error(lang === 'pt' ? 'Título e conteúdo são obrigatórios' : 'Title and content are required');
            return;
        }

        setIsSaving(true);
        try {
            if (editingEntry) {
                await base44.entities.KnowledgeEntry.update(editingEntry.id, formData);
                toast.success(lang === 'pt' ? 'Entrada atualizada' : 'Entry updated');
            } else {
                await base44.entities.KnowledgeEntry.create(formData);
                toast.success(lang === 'pt' ? 'Entrada criada' : 'Entry created');
            }
            setIsDialogOpen(false);
            loadEntries();
        } catch (error) {
            console.error('Error saving entry:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (entryId) => {
        if (!confirm(t.deleteConfirm)) return;

        try {
            await base44.entities.KnowledgeEntry.delete(entryId);
            toast.success(lang === 'pt' ? 'Entrada excluída' : 'Entry deleted');
            loadEntries();
        } catch (error) {
            console.error('Error deleting entry:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            setNewTag('');
        }
    };

    const removeTag = (tag) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const addKeyword = () => {
        if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
            setFormData({ ...formData, keywords: [...formData.keywords, newKeyword.trim()] });
            setNewKeyword('');
        }
    };

    const removeKeyword = (keyword) => {
        setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-[#002D62]">{t.title}</CardTitle>
                        <CardDescription>{t.desc}</CardDescription>
                    </div>
                    <Button onClick={() => openDialog()} className="bg-[#002D62]">
                        <Plus className="w-4 h-4 mr-2" />
                        {t.addEntry}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.search}
                            className="pl-10"
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder={t.filterByCategory} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.allCategories}</SelectItem>
                            {Object.keys(t.categories).map(cat => (
                                <SelectItem key={cat} value={cat}>{t.categories[cat]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <Badge
                                key={tag}
                                variant={selectedTags.includes(tag) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => setSelectedTags(prev =>
                                    prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                )}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Entries List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{t.noEntries}</div>
                ) : (
                    <div className="space-y-3">
                        {filteredEntries.map(entry => (
                            <div key={entry.id} className="p-4 rounded-lg border border-gray-200 hover:border-[#002D62]/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-[#333F48]">{entry.title}</h3>
                                            <Badge variant="secondary">{t.categories[entry.category]}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{entry.summary}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            {entry.date && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(entry.date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                                </div>
                                            )}
                                            {entry.author && <span>Por {entry.author}</span>}
                                        </div>
                                        {entry.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {entry.tags.map(tag => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        <Tag className="w-3 h-3 mr-1" />
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setViewingEntry(entry)}
                                        >
                                            {t.view}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDialog(entry)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(entry.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? t.editEntry : t.addEntry}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>{t.titleLabel}</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t.dateLabel}</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>{t.categoryLabel}</Label>
                                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(t.categories).map(cat => (
                                            <SelectItem key={cat} value={cat}>{t.categories[cat]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>{t.summaryLabel}</Label>
                            <Textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>{t.bodyLabel}</Label>
                            <Textarea
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                rows={8}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t.authorLabel}</Label>
                                <Input
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>{t.sourceLabel}</Label>
                                <Input
                                    value={formData.source_url}
                                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>{t.tagsLabel}</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder={t.addTag}
                                />
                                <Button onClick={addTag} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map(tag => (
                                    <Badge key={tag} className="pr-1">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="ml-2">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>{t.keywordsLabel}</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                                    placeholder={t.addKeyword}
                                />
                                <Button onClick={addKeyword} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.keywords.map(keyword => (
                                    <Badge key={keyword} variant="secondary" className="pr-1">
                                        {keyword}
                                        <button onClick={() => removeKeyword(keyword)} className="ml-2">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                {t.cancel}
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving} className="bg-[#002D62]">
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.saving}</>
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" />{t.save}</>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewingEntry !== null} onOpenChange={() => setViewingEntry(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {viewingEntry && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{viewingEntry.title}</DialogTitle>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    {viewingEntry.date && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(viewingEntry.date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                        </div>
                                    )}
                                    {viewingEntry.author && <span>Por {viewingEntry.author}</span>}
                                    <Badge>{t.categories[viewingEntry.category]}</Badge>
                                </div>
                            </DialogHeader>
                            <div className="space-y-4">
                                {viewingEntry.summary && (
                                    <p className="text-lg text-gray-700 italic border-l-4 border-[#002D62] pl-4">
                                        {viewingEntry.summary}
                                    </p>
                                )}
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{viewingEntry.body}</ReactMarkdown>
                                </div>
                                {viewingEntry.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                                        {viewingEntry.tags.map(tag => (
                                            <Badge key={tag} variant="outline">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                {viewingEntry.source_url && (
                                    <a
                                        href={viewingEntry.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 hover:underline"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Fonte Original
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}