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
import { Plus, Search, Edit, Trash2, Save, X, Loader2, Calendar, Tag, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, CheckSquare, Square, Upload, FolderOpen, Sparkles, Wand2, RefreshCw, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Checkbox } from '@/components/ui/checkbox';

export default function KnowledgeBaseManager({ lang = 'pt' }) {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewingEntry, setViewingEntry] = useState(null);
    const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
    const [suggestionText, setSuggestionText] = useState('');
    const [feedbackMap, setFeedbackMap] = useState({});
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [bulkOperation, setBulkOperation] = useState('');
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const fileInputRef = React.useRef(null);
    const [aiAssistOpen, setAiAssistOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiLength, setAiLength] = useState('medium');
    const [suggestedTitles, setSuggestedTitles] = useState([]);
    const [generatedDraft, setGeneratedDraft] = useState(null);
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
            dateFrom: 'Data inicial',
            dateTo: 'Data final',
            suggestTopic: 'Sugerir Tema',
            suggestTopicTitle: 'Sugira um novo artigo ou tema',
            suggestionPlaceholder: 'Descreva o tema ou artigo que gostaria de ver...',
            sendSuggestion: 'Enviar Sugestão',
            suggestionSent: 'Sugestão enviada com sucesso!',
            helpful: 'Útil',
            notHelpful: 'Não útil',
            selectAll: 'Selecionar todos',
            selected: 'selecionado(s)',
            bulkActions: 'Ações em Massa',
            bulkDelete: 'Excluir Selecionados',
            bulkAddTags: 'Adicionar Tags',
            bulkChangeCategory: 'Mudar Categoria',
            bulkChangeStatus: 'Mudar Status',
            uploadFiles: 'Importar Arquivos',
            uploadFilesDesc: 'Faça upload de PDFs, DOCX ou TXT para importar como conhecimento',
            processing: 'Processando...',
            aiAssist: 'Assistente IA',
            generateDraft: 'Gerar Rascunho',
            suggestTitle: 'Sugerir Título',
            generateSummary: 'Gerar Resumo',
            autoTags: 'Auto Tags/Keywords',
            enhanceContent: 'Aprimorar Conteúdo',
            topicPlaceholder: 'Digite o tema do artigo...',
            generating: 'Gerando...',
            selectLength: 'Extensão',
            short: 'Curto (400-600)',
            medium: 'Médio (800-1000)',
            long: 'Longo (1200-1600)',
            applyDraft: 'Aplicar Rascunho',
            selectTitle: 'Selecionar',
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
            dateFrom: 'From date',
            dateTo: 'To date',
            suggestTopic: 'Suggest Topic',
            suggestTopicTitle: 'Suggest a new article or theme',
            suggestionPlaceholder: 'Describe the theme or article you would like to see...',
            sendSuggestion: 'Send Suggestion',
            suggestionSent: 'Suggestion sent successfully!',
            helpful: 'Helpful',
            notHelpful: 'Not helpful',
            selectAll: 'Select all',
            selected: 'selected',
            bulkActions: 'Bulk Actions',
            bulkDelete: 'Delete Selected',
            bulkAddTags: 'Add Tags',
            bulkChangeCategory: 'Change Category',
            bulkChangeStatus: 'Change Status',
            uploadFiles: 'Import Files',
            uploadFilesDesc: 'Upload PDFs, DOCX or TXT to import as knowledge',
            processing: 'Processing...',
            aiAssist: 'AI Assistant',
            generateDraft: 'Generate Draft',
            suggestTitle: 'Suggest Title',
            generateSummary: 'Generate Summary',
            autoTags: 'Auto Tags/Keywords',
            enhanceContent: 'Enhance Content',
            topicPlaceholder: 'Enter article topic...',
            generating: 'Generating...',
            selectLength: 'Length',
            short: 'Short (400-600)',
            medium: 'Medium (800-1000)',
            long: 'Long (1200-1600)',
            applyDraft: 'Apply Draft',
            selectTitle: 'Select',
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

        const matchesDateFrom = !dateFrom || !entry.date || new Date(entry.date) >= new Date(dateFrom);
        const matchesDateTo = !dateTo || !entry.date || new Date(entry.date) <= new Date(dateTo);

        return matchesSearch && matchesCategory && matchesTags && matchesDateFrom && matchesDateTo;
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

    const handleFeedback = async (entryId, isHelpful) => {
        try {
            const entry = entries.find(e => e.id === entryId);
            if (!entry) return;

            const currentFeedback = feedbackMap[entryId];
            let helpful = entry.helpful_votes || 0;
            let unhelpful = entry.unhelpful_votes || 0;

            if (currentFeedback === isHelpful) {
                // Remove feedback
                isHelpful ? helpful-- : unhelpful--;
                setFeedbackMap({ ...feedbackMap, [entryId]: null });
            } else {
                // Add or change feedback
                if (currentFeedback !== null && currentFeedback !== undefined) {
                    currentFeedback ? helpful-- : unhelpful--;
                }
                isHelpful ? helpful++ : unhelpful++;
                setFeedbackMap({ ...feedbackMap, [entryId]: isHelpful });
            }

            await base44.entities.KnowledgeEntry.update(entryId, {
                helpful_votes: Math.max(0, helpful),
                unhelpful_votes: Math.max(0, unhelpful)
            });

            loadEntries();
        } catch (error) {
            console.error('Error sending feedback:', error);
            toast.error(lang === 'pt' ? 'Erro ao enviar feedback' : 'Error sending feedback');
        }
    };

    const handleSuggestTopic = async () => {
        if (!suggestionText.trim()) {
            toast.error(lang === 'pt' ? 'Digite uma sugestão' : 'Enter a suggestion');
            return;
        }

        try {
            const user = await base44.auth.me();
            await base44.entities.Feedback.create({
                user_email: user.email,
                type: 'knowledge_suggestion',
                message: suggestionText,
                metadata: { category: 'knowledge_base' }
            });

            toast.success(t.suggestionSent);
            setSuggestionDialogOpen(false);
            setSuggestionText('');
        } catch (error) {
            console.error('Error sending suggestion:', error);
            toast.error(lang === 'pt' ? 'Erro ao enviar sugestão' : 'Error sending suggestion');
        }
    };

    const toggleSelectAll = () => {
        if (selectedEntries.length === filteredEntries.length) {
            setSelectedEntries([]);
        } else {
            setSelectedEntries(filteredEntries.map(e => e.id));
        }
    };

    const toggleSelectEntry = (id) => {
        setSelectedEntries(prev =>
            prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!confirm(lang === 'pt' 
            ? `Excluir ${selectedEntries.length} entrada(s)?` 
            : `Delete ${selectedEntries.length} entry(ies)?`)) return;

        try {
            const response = await base44.functions.invoke('bulkKnowledgeOperations', {
                operation: 'bulk_delete',
                entry_ids: selectedEntries
            });

            toast.success(
                lang === 'pt'
                    ? `${response.data.success} entrada(s) excluída(s)`
                    : `${response.data.success} entry(ies) deleted`
            );
            setSelectedEntries([]);
            loadEntries();
        } catch (error) {
            console.error('Error bulk deleting:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const handleBulkOperation = async (operation, data) => {
        try {
            const response = await base44.functions.invoke('bulkKnowledgeOperations', {
                operation,
                entry_ids: selectedEntries,
                data
            });

            toast.success(
                lang === 'pt'
                    ? `${response.data.success} entrada(s) atualizada(s)`
                    : `${response.data.success} entry(ies) updated`
            );
            setSelectedEntries([]);
            setBulkDialogOpen(false);
            loadEntries();
        } catch (error) {
            console.error('Error in bulk operation:', error);
            toast.error(lang === 'pt' ? 'Erro na operação' : 'Error in operation');
        }
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setUploadingFiles(true);
        try {
            const fileUrls = [];
            for (const file of files) {
                const result = await base44.integrations.Core.UploadFile({ file });
                if (result?.file_url) {
                    fileUrls.push(result.file_url);
                }
            }

            const response = await base44.functions.invoke('bulkKnowledgeOperations', {
                operation: 'import_files',
                files: fileUrls
            });

            toast.success(
                lang === 'pt'
                    ? `${response.data.success} arquivo(s) importado(s)`
                    : `${response.data.success} file(s) imported`
            );
            loadEntries();
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error(lang === 'pt' ? 'Erro ao importar' : 'Error importing');
        } finally {
            setUploadingFiles(false);
        }
    };

    const handleAIGenerate = async (action) => {
        setAiLoading(true);
        try {
            if (action === 'generate_draft') {
                if (!aiTopic.trim()) {
                    toast.error(lang === 'pt' ? 'Digite um tema' : 'Enter a topic');
                    setAiLoading(false);
                    return;
                }

                const response = await base44.functions.invoke('aiContentAssistant', {
                    action: 'complete_article',
                    topic: aiTopic,
                    category: formData.category,
                    target_length: aiLength
                });

                setGeneratedDraft(response.data);
                setFormData({
                    ...formData,
                    title: response.data.title || '',
                    summary: response.data.summary || '',
                    body: response.data.body || '',
                    tags: response.data.tags || [],
                    keywords: response.data.keywords || [],
                    author: response.data.author || ''
                });

                toast.success(lang === 'pt' ? 'Rascunho gerado!' : 'Draft generated!');
                setAiAssistOpen(false);
                
            } else if (action === 'suggest_titles') {
                const response = await base44.functions.invoke('aiContentAssistant', {
                    action: 'suggest_title',
                    topic: aiTopic || formData.title,
                    existing_content: formData
                });

                setSuggestedTitles(response.data.titles || []);
                toast.success(lang === 'pt' ? 'Títulos sugeridos!' : 'Titles suggested!');

            } else if (action === 'generate_summary') {
                const response = await base44.functions.invoke('aiContentAssistant', {
                    action: 'generate_summary',
                    existing_content: formData
                });

                setFormData({
                    ...formData,
                    summary: response.data.summary || ''
                });

                toast.success(lang === 'pt' ? 'Resumo gerado!' : 'Summary generated!');

            } else if (action === 'auto_tags') {
                const response = await base44.functions.invoke('aiContentAssistant', {
                    action: 'generate_tags_keywords',
                    topic: aiTopic,
                    existing_content: formData
                });

                setFormData({
                    ...formData,
                    tags: [...new Set([...formData.tags, ...(response.data.tags || [])])],
                    keywords: [...new Set([...formData.keywords, ...(response.data.keywords || [])])]
                });

                toast.success(lang === 'pt' ? 'Tags e keywords geradas!' : 'Tags and keywords generated!');

            } else if (action === 'enhance') {
                const response = await base44.functions.invoke('aiContentAssistant', {
                    action: 'enhance_content',
                    topic: aiTopic || formData.title,
                    existing_content: formData
                });

                setFormData({
                    ...formData,
                    body: response.data.enhanced_body || formData.body
                });

                toast.success(lang === 'pt' ? 'Conteúdo aprimorado!' : 'Content enhanced!');
            }
        } catch (error) {
            console.error('Error in AI assist:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar conteúdo' : 'Error generating content');
        } finally {
            setAiLoading(false);
        }
    };

    const applyTitle = (title) => {
        setFormData({ ...formData, title });
        setSuggestedTitles([]);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-[#002D62]">{t.title}</CardTitle>
                        <CardDescription>{t.desc}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.docx,.txt"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <Button 
                            onClick={() => fileInputRef.current?.click()} 
                            variant="outline"
                            disabled={uploadingFiles}
                        >
                            {uploadingFiles ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            {t.uploadFiles}
                        </Button>
                        <Button onClick={() => setSuggestionDialogOpen(true)} variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {t.suggestTopic}
                        </Button>
                        <Button onClick={() => openDialog()} className="bg-[#002D62]">
                            <Plus className="w-4 h-4 mr-2" />
                            {t.addEntry}
                        </Button>
                    </div>
                </div>
                {selectedEntries.length > 0 && (
                    <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Badge variant="default">{selectedEntries.length} {t.selected}</Badge>
                        <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            {t.bulkDelete}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setBulkOperation('add_tags'); setBulkDialogOpen(true); }}>
                            <Tag className="w-4 h-4 mr-1" />
                            {t.bulkAddTags}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setBulkOperation('change_category'); setBulkDialogOpen(true); }}>
                            <FolderOpen className="w-4 h-4 mr-1" />
                            {t.bulkChangeCategory}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedEntries([])}>
                            {t.cancel}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
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
                    {filteredEntries.length > 0 && (
                        <Button variant="outline" onClick={toggleSelectAll}>
                            {selectedEntries.length === filteredEntries.length ? (
                                <CheckSquare className="w-4 h-4 mr-2" />
                            ) : (
                                <Square className="w-4 h-4 mr-2" />
                            )}
                            {t.selectAll}
                        </Button>
                    )}
                </div>

                {/* Date Range Filter */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs text-gray-600">{t.dateFrom}</Label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="text-xs text-gray-600">{t.dateTo}</Label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
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
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        checked={selectedEntries.includes(entry.id)}
                                        onCheckedChange={() => toggleSelectEntry(entry.id)}
                                        className="mt-1"
                                    />
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
                                        {/* Feedback */}
                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t">
                                           <button
                                               onClick={() => handleFeedback(entry.id, true)}
                                               className={`flex items-center gap-1 text-xs transition-colors ${
                                                   feedbackMap[entry.id] === true
                                                       ? 'text-green-600 font-semibold'
                                                       : 'text-gray-500 hover:text-green-600'
                                               }`}
                                           >
                                               <ThumbsUp className="w-4 h-4" />
                                               <span>{entry.helpful_votes || 0}</span>
                                           </button>
                                           <button
                                               onClick={() => handleFeedback(entry.id, false)}
                                               className={`flex items-center gap-1 text-xs transition-colors ${
                                                   feedbackMap[entry.id] === false
                                                       ? 'text-red-600 font-semibold'
                                                       : 'text-gray-500 hover:text-red-600'
                                               }`}
                                           >
                                               <ThumbsDown className="w-4 h-4" />
                                               <span>{entry.unhelpful_votes || 0}</span>
                                           </button>
                                        </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
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

                                        {/* Bulk Operations Dialog */}
                                        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                                        <DialogContent>
                                        <DialogHeader>
                                        <DialogTitle>{t.bulkActions}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                        {bulkOperation === 'add_tags' && (
                                        <div>
                                        <Label>{t.tagsLabel}</Label>
                                        <div className="flex gap-2">
                                        <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                        placeholder={t.addTag}
                                        />
                                        <Button onClick={() => {
                                        const tags = newTag.split(',').map(t => t.trim()).filter(t => t);
                                        handleBulkOperation('bulk_add_tags', { tags });
                                        }}>
                                        {t.save}
                                        </Button>
                                        </div>
                                        </div>
                                        )}

                                        {bulkOperation === 'change_category' && (
                                        <div>
                                        <Label>{t.categoryLabel}</Label>
                                        <Select onValueChange={(cat) => handleBulkOperation('bulk_change_category', { category: cat })}>
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
                                        )}

                                        {bulkOperation === 'change_status' && (
                                        <div>
                                        <Label>Status</Label>
                                        <Select onValueChange={(status) => handleBulkOperation('bulk_update_status', { status })}>
                                        <SelectTrigger>
                                        <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="rascunho">Rascunho</SelectItem>
                                        <SelectItem value="revisao">Revisão</SelectItem>
                                        <SelectItem value="publicado">Publicado</SelectItem>
                                        <SelectItem value="arquivado">Arquivado</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        </div>
                                        )}
                                        </div>
                                        </DialogContent>
                                        </Dialog>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle>{editingEntry ? t.editEntry : t.addEntry}</DialogTitle>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setAiAssistOpen(true)}
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                {t.aiAssist}
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>{t.titleLabel}</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAIGenerate('suggest_titles')}
                                    disabled={aiLoading}
                                >
                                    <Wand2 className="w-3 h-3 mr-1" />
                                    {t.suggestTitle}
                                </Button>
                            </div>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            {suggestedTitles.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {suggestedTitles.map((title, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                                            <span className="flex-1">{title}</span>
                                            <Button size="sm" variant="ghost" onClick={() => applyTitle(title)}>
                                                {t.selectTitle}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                            <div className="flex items-center justify-between mb-2">
                                <Label>{t.summaryLabel}</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAIGenerate('generate_summary')}
                                    disabled={aiLoading || !formData.body}
                                >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {t.generateSummary}
                                </Button>
                            </div>
                            <Textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>{t.bodyLabel}</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAIGenerate('enhance')}
                                    disabled={aiLoading || !formData.body}
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    {t.enhanceContent}
                                </Button>
                            </div>
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
                            <div className="flex items-center justify-between mb-2">
                                <Label>{t.tagsLabel}</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAIGenerate('auto_tags')}
                                    disabled={aiLoading || (!formData.body && !formData.summary)}
                                >
                                    <Lightbulb className="w-3 h-3 mr-1" />
                                    {t.autoTags}
                                </Button>
                            </div>
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

            {/* AI Assistant Dialog */}
            <Dialog open={aiAssistOpen} onOpenChange={setAiAssistOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            {t.aiAssist}
                        </DialogTitle>
                        <DialogDescription>
                            {lang === 'pt' 
                                ? 'Gere conteúdo completo automaticamente com IA'
                                : 'Generate complete content automatically with AI'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>
                                {lang === 'pt' ? 'Tema do Artigo' : 'Article Topic'}
                            </Label>
                            <Input
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder={t.topicPlaceholder}
                            />
                        </div>
                        <div>
                            <Label>{t.selectLength}</Label>
                            <Select value={aiLength} onValueChange={setAiLength}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="short">{t.short}</SelectItem>
                                    <SelectItem value="medium">{t.medium}</SelectItem>
                                    <SelectItem value="long">{t.long}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-900">
                                {lang === 'pt'
                                    ? '🤖 A IA gerará automaticamente: título, resumo, conteúdo completo, tags e keywords no estilo Troyjo'
                                    : '🤖 AI will automatically generate: title, summary, full content, tags and keywords in Troyjo style'}
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setAiAssistOpen(false)}>
                                {t.cancel}
                            </Button>
                            <Button 
                                onClick={() => handleAIGenerate('generate_draft')}
                                disabled={aiLoading || !aiTopic.trim()}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                {aiLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.generating}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        {t.generateDraft}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Suggestion Dialog */}
            <Dialog open={suggestionDialogOpen} onOpenChange={setSuggestionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.suggestTopicTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={suggestionText}
                            onChange={(e) => setSuggestionText(e.target.value)}
                            placeholder={t.suggestionPlaceholder}
                            rows={6}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setSuggestionDialogOpen(false)}>
                                {t.cancel}
                            </Button>
                            <Button onClick={handleSuggestTopic} className="bg-[#002D62]">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {t.sendSuggestion}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}