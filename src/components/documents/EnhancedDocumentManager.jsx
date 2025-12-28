import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File, FileText, Trash2, Eye, Loader2, Plus, Search, Folder, FolderPlus, ChevronRight, Sparkles, BookOpen, Filter, SortAsc } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ButtonPremium from '@/components/caio/ButtonPremium';
import BadgeCaio from '@/components/caio/BadgeCaio';
import CardGlow from '@/components/caio/CardGlow';

const translations = {
    pt: {
        title: 'Biblioteca de Documentos',
        description: 'Gerencie documentos com busca avançada e organização por pastas',
        upload: 'Upload',
        uploading: 'Enviando...',
        addDocument: 'Adicionar Documento',
        documentTitle: 'Título do Documento',
        documentDesc: 'Descrição (opcional)',
        tags: 'Tags (separadas por vírgula)',
        folder: 'Pasta',
        noFolder: 'Sem pasta',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        view: 'Visualizar',
        noDocuments: 'Nenhum documento',
        uploadFirst: 'Faça upload de documentos',
        search: 'Buscar documentos...',
        advancedSearch: 'Busca Avançada',
        searchInContent: 'Buscar dentro do conteúdo',
        createFolder: 'Nova Pasta',
        folderName: 'Nome da Pasta',
        folderDesc: 'Descrição',
        folderColor: 'Cor',
        allDocuments: 'Todos os Documentos',
        sortBy: 'Ordenar por',
        sortDate: 'Data',
        sortName: 'Nome',
        sortSize: 'Tamanho',
        filterByType: 'Filtrar por tipo',
        allTypes: 'Todos os tipos',
        autoSummarize: 'Resumo Automático',
        summarizing: 'Resumindo...',
        viewSummary: 'Ver Resumo',
        summary: 'Resumo'
    },
    en: {
        title: 'Document Library',
        description: 'Manage documents with advanced search and folder organization',
        upload: 'Upload',
        uploading: 'Uploading...',
        addDocument: 'Add Document',
        documentTitle: 'Document Title',
        documentDesc: 'Description (optional)',
        tags: 'Tags (comma separated)',
        folder: 'Folder',
        noFolder: 'No folder',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        view: 'View',
        noDocuments: 'No documents',
        uploadFirst: 'Upload documents',
        search: 'Search documents...',
        advancedSearch: 'Advanced Search',
        searchInContent: 'Search within content',
        createFolder: 'New Folder',
        folderName: 'Folder Name',
        folderDesc: 'Description',
        folderColor: 'Color',
        allDocuments: 'All Documents',
        sortBy: 'Sort by',
        sortDate: 'Date',
        sortName: 'Name',
        sortSize: 'Size',
        filterByType: 'Filter by type',
        allTypes: 'All types',
        autoSummarize: 'Auto Summary',
        summarizing: 'Summarizing...',
        viewSummary: 'View Summary',
        summary: 'Summary'
    }
};

const getFileIcon = (fileType) => {
    const icons = {
        pdf: FileText,
        docx: FileText,
        doc: FileText,
        txt: File,
        csv: FileText
    };
    return icons[fileType] || File;
};

const folderColors = {
    cyan: { bg: 'bg-electric-cyan-50 dark:bg-electric-cyan-900/20', border: 'border-electric-cyan-200', icon: 'text-electric-cyan-600' },
    gold: { bg: 'bg-metallic-gold-50 dark:bg-metallic-gold-900/20', border: 'border-metallic-gold-200', icon: 'text-metallic-gold-600' },
    abyss: { bg: 'bg-abyss-blue-50 dark:bg-abyss-blue-900/20', border: 'border-abyss-blue-200', icon: 'text-abyss-blue-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' }
};

export default function EnhancedDocumentManager({ lang = 'pt', onDocumentSelect }) {
    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [typeFilter, setTypeFilter] = useState('all');
    const [autoSummarizing, setAutoSummarizing] = useState({});
    const [summaryDialog, setSummaryDialog] = useState(false);
    const [currentSummary, setCurrentSummary] = useState(null);
    const [currentDoc, setCurrentDoc] = useState({
        title: '',
        description: '',
        tags: '',
        folder_id: ''
    });
    const [newFolder, setNewFolder] = useState({
        name: '',
        description: '',
        color: 'cyan'
    });
    const t = translations[lang];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const [docs, fldrs] = await Promise.all([
                base44.entities.Document.filter({ created_by: user.email }, '-created_date'),
                base44.entities.DocumentFolder.filter({ user_email: user.email }, 'order')
            ]);
            setDocuments(docs);
            setFolders(fldrs);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar' : 'Error loading');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            const validExtensions = ['pdf', 'docx', 'doc', 'txt', 'csv'];
            const maxSize = 10 * 1024 * 1024;
            
            if (!validExtensions.includes(ext)) {
                toast.error(`${file.name}: ${lang === 'pt' ? 'Formato não suportado' : 'Unsupported format'}`);
                return false;
            }
            if (file.size > maxSize) {
                toast.error(`${file.name}: ${lang === 'pt' ? 'Arquivo muito grande' : 'File too large'}`);
                return false;
            }
            return true;
        });

        setSelectedFiles(validFiles);
        if (validFiles.length > 0) {
            setCurrentDoc({ ...currentDoc, title: validFiles[0].name });
            setDialogOpen(true);
        }
    };

    const handleUpload = async () => {
        if (!currentDoc.title || selectedFiles.length === 0) {
            toast.error(lang === 'pt' ? 'Título e arquivo obrigatórios' : 'Title and file required');
            return;
        }

        setUploading(true);
        try {
            for (const file of selectedFiles) {
                const uploadResult = await base44.integrations.Core.UploadFile({ file });
                const ext = file.name.split('.').pop().toLowerCase();
                const tags = currentDoc.tags ? currentDoc.tags.split(',').map(t => t.trim()).filter(t => t) : [];

                const docData = {
                    title: selectedFiles.length > 1 ? file.name : currentDoc.title,
                    file_url: uploadResult.file_url,
                    file_type: ext,
                    file_size: file.size,
                    description: currentDoc.description || '',
                    tags,
                    usage_count: 0,
                    category: 'other',
                    folder_id: currentDoc.folder_id || null
                };

                const createdDoc = await base44.entities.Document.create(docData);

                // Auto-summarize large documents
                if (file.size > 50000) {
                    setAutoSummarizing(prev => ({ ...prev, [createdDoc.id]: true }));
                    try {
                        await base44.functions.invoke('generateDocumentSummary', {
                            document_id: createdDoc.id
                        });
                    } catch (error) {
                        console.error('Auto-summarize failed:', error);
                    } finally {
                        setAutoSummarizing(prev => ({ ...prev, [createdDoc.id]: false }));
                    }
                }
            }

            toast.success(`${selectedFiles.length} ${lang === 'pt' ? 'documento(s) carregado(s)' : 'document(s) uploaded'}`);
            await loadData();
            setDialogOpen(false);
            setSelectedFiles([]);
            setCurrentDoc({ title: '', description: '', tags: '', folder_id: '' });
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error(`${lang === 'pt' ? 'Erro' : 'Error'}: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolder.name.trim()) {
            toast.error(lang === 'pt' ? 'Nome obrigatório' : 'Name required');
            return;
        }

        try {
            const user = await base44.auth.me();
            await base44.entities.DocumentFolder.create({
                ...newFolder,
                user_email: user.email,
                document_count: 0,
                order: folders.length
            });
            toast.success(lang === 'pt' ? 'Pasta criada!' : 'Folder created!');
            await loadData();
            setFolderDialogOpen(false);
            setNewFolder({ name: '', description: '', color: 'cyan' });
        } catch (error) {
            console.error('Error creating folder:', error);
            toast.error(lang === 'pt' ? 'Erro ao criar pasta' : 'Error creating folder');
        }
    };

    const handleDelete = async (docId) => {
        if (!confirm(lang === 'pt' ? 'Excluir documento?' : 'Delete document?')) return;

        try {
            await base44.entities.Document.delete(docId);
            setDocuments(documents.filter(d => d.id !== docId));
            toast.success(lang === 'pt' ? 'Documento excluído' : 'Document deleted');
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const handleAdvancedSearch = async () => {
        if (!searchTerm.trim()) return;
        
        try {
            const response = await base44.functions.invoke('searchDocumentsRAG', {
                query: searchTerm,
                top_k: 10
            });
            
            if (response.data?.results) {
                const docIds = [...new Set(response.data.results.map(r => r.document_id))];
                const filtered = documents.filter(d => docIds.includes(d.id));
                setDocuments(filtered.length > 0 ? filtered : documents);
            }
        } catch (error) {
            console.error('Advanced search error:', error);
        }
    };

    let filteredDocuments = documents.filter(doc => {
        const folderMatch = selectedFolder === 'all' || doc.folder_id === selectedFolder || (!doc.folder_id && selectedFolder === 'none');
        const searchMatch = !searchTerm || 
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const typeMatch = typeFilter === 'all' || doc.file_type === typeFilter;
        
        return folderMatch && searchMatch && typeMatch;
    });

    // Sort documents
    filteredDocuments = filteredDocuments.sort((a, b) => {
        if (sortBy === 'date') return new Date(b.created_date) - new Date(a.created_date);
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        if (sortBy === 'size') return (b.file_size || 0) - (a.file_size || 0);
        return 0;
    });

    const uniqueTypes = [...new Set(documents.map(d => d.file_type))];

    return (
        <div className="space-y-6">
            {/* Folder Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-abyss-blue">
                                <Folder className="w-5 h-5" />
                                {lang === 'pt' ? 'Pastas' : 'Folders'}
                            </CardTitle>
                            <CardDescription>{lang === 'pt' ? 'Organize seus documentos' : 'Organize your documents'}</CardDescription>
                        </div>
                        <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <FolderPlus className="w-4 h-4" />
                                    {t.createFolder}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t.createFolder}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>{t.folderName}</Label>
                                        <Input
                                            value={newFolder.name}
                                            onChange={(e) => setNewFolder({...newFolder, name: e.target.value})}
                                            placeholder={lang === 'pt' ? 'Relatórios Anuais' : 'Annual Reports'}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t.folderDesc}</Label>
                                        <Textarea
                                            value={newFolder.description}
                                            onChange={(e) => setNewFolder({...newFolder, description: e.target.value})}
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t.folderColor}</Label>
                                        <div className="flex gap-2 mt-2">
                                            {Object.keys(folderColors).map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setNewFolder({...newFolder, color})}
                                                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                                        newFolder.color === color ? 'border-abyss-blue scale-110' : 'border-gray-200'
                                                    } ${folderColors[color].bg}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>{t.cancel}</Button>
                                    <Button onClick={handleCreateFolder} className="bg-abyss-blue hover:bg-abyss-blue-600">
                                        <FolderPlus className="w-4 h-4 mr-2" />
                                        {t.save}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={selectedFolder === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedFolder('all')}
                            className={selectedFolder === 'all' ? 'bg-abyss-blue' : ''}
                        >
                            {t.allDocuments}
                        </Button>
                        <Button
                            variant={selectedFolder === 'none' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedFolder('none')}
                        >
                            {t.noFolder}
                        </Button>
                        {folders.map(folder => (
                            <Button
                                key={folder.id}
                                variant={selectedFolder === folder.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedFolder(folder.id)}
                                className={`gap-2 ${selectedFolder === folder.id ? folderColors[folder.color].bg + ' ' + folderColors[folder.color].border : ''}`}
                            >
                                <Folder className={`w-4 h-4 ${folderColors[folder.color].icon}`} />
                                {folder.name}
                                <Badge variant="secondary" className="ml-1">{folder.document_count || 0}</Badge>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Main Document Library */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-abyss-blue">
                                <FileText className="w-5 h-5" />
                                {t.title}
                            </CardTitle>
                            <CardDescription>{t.description}</CardDescription>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <ButtonPremium>
                                    <Upload className="w-4 h-4 mr-2" />
                                    {t.upload}
                                </ButtonPremium>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t.addDocument}</DialogTitle>
                                    <DialogDescription>
                                        PDF, DOCX, DOC, TXT, CSV • Max 10MB
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="file-upload" className="cursor-pointer">
                                            <div className="border-2 border-dashed border-electric-cyan/30 rounded-lg p-6 text-center hover:border-electric-cyan transition-all hover:bg-electric-cyan-50/50">
                                                <Upload className="w-8 h-8 mx-auto mb-2 text-electric-cyan" />
                                                <p className="text-sm text-gray-600">{lang === 'pt' ? 'Selecionar Arquivos' : 'Select Files'}</p>
                                                {selectedFiles.length > 0 && (
                                                    <div className="mt-3 space-y-1">
                                                        {selectedFiles.map((file, idx) => (
                                                            <BadgeCaio key={idx} variant="cyan">
                                                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                            </BadgeCaio>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                id="file-upload"
                                                type="file"
                                                accept=".pdf,.docx,.doc,.txt,.csv"
                                                multiple
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                        </Label>
                                    </div>

                                    <div>
                                        <Label>{t.documentTitle}</Label>
                                        <Input
                                            value={currentDoc.title}
                                            onChange={(e) => setCurrentDoc({...currentDoc, title: e.target.value})}
                                            placeholder={lang === 'pt' ? 'Relatório Q4 2025' : 'Q4 2025 Report'}
                                        />
                                    </div>

                                    <div>
                                        <Label>{t.documentDesc}</Label>
                                        <Textarea
                                            value={currentDoc.description}
                                            onChange={(e) => setCurrentDoc({...currentDoc, description: e.target.value})}
                                            placeholder={lang === 'pt' ? 'Análise econômica...' : 'Economic analysis...'}
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label>{t.folder}</Label>
                                        <Select value={currentDoc.folder_id} onValueChange={(val) => setCurrentDoc({...currentDoc, folder_id: val})}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t.noFolder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={null}>{t.noFolder}</SelectItem>
                                                {folders.map(folder => (
                                                    <SelectItem key={folder.id} value={folder.id}>
                                                        {folder.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>{t.tags}</Label>
                                        <Input
                                            value={currentDoc.tags}
                                            onChange={(e) => setCurrentDoc({...currentDoc, tags: e.target.value})}
                                            placeholder="economia, brics, comercio"
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
                                    <ButtonPremium onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t.uploading}
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                {t.save}
                                            </>
                                        )}
                                    </ButtonPremium>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Search & Filters */}
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (advancedSearch ? handleAdvancedSearch() : null)}
                                    placeholder={t.search}
                                    className="pl-10 border-electric-cyan/20 focus:border-electric-cyan"
                                />
                            </div>
                            {advancedSearch && (
                                <Button onClick={handleAdvancedSearch} className="bg-electric-cyan hover:bg-electric-cyan-600 text-abyss-blue">
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    {t.searchInContent}
                                </Button>
                            )}
                            <Button
                                variant={advancedSearch ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setAdvancedSearch(!advancedSearch)}
                                className={advancedSearch ? 'bg-abyss-blue' : ''}
                            >
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-40">
                                    <SortAsc className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">{t.sortDate}</SelectItem>
                                    <SelectItem value="name">{t.sortName}</SelectItem>
                                    <SelectItem value="size">{t.sortSize}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t.allTypes}</SelectItem>
                                    {uniqueTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Documents Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-electric-cyan" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">{t.noDocuments}</p>
                            <p className="text-sm text-gray-400">{t.uploadFirst}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {filteredDocuments.map((doc) => {
                                    const IconComponent = getFileIcon(doc.file_type);
                                    const folder = folders.find(f => f.id === doc.folder_id);
                                    
                                    return (
                                        <motion.div
                                            key={doc.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                        >
                                            <CardGlow className="h-full flex flex-col">
                                                <CardContent className="p-5 flex flex-col h-full">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className={`w-12 h-12 rounded-xl ${folderColors[folder?.color || 'cyan'].bg} flex items-center justify-center`}>
                                                            <IconComponent className={`w-6 h-6 ${folderColors[folder?.color || 'cyan'].icon}`} />
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {onDocumentSelect && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => onDocumentSelect(doc)}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </a>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                                                onClick={() => handleDelete(doc.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <h4 className="font-semibold text-abyss-blue mb-2 line-clamp-2">
                                                        {doc.title}
                                                    </h4>

                                                    {doc.description && (
                                                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                            {doc.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-auto space-y-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {folder && (
                                                                <Badge className={`${folderColors[folder.color].bg} ${folderColors[folder.color].border} border text-xs`}>
                                                                    <Folder className="w-3 h-3 mr-1" />
                                                                    {folder.name}
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="text-xs">
                                                                {doc.file_type.toUpperCase()}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {(doc.file_size / 1024).toFixed(1)} KB
                                                            </Badge>
                                                        </div>

                                                        {doc.ai_summary ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full gap-2 text-electric-cyan border-electric-cyan/30 hover:bg-electric-cyan-50"
                                                                onClick={() => {
                                                                    setCurrentSummary({
                                                                        executive_summary: doc.ai_summary,
                                                                        ...doc.summary_metadata,
                                                                        document: { title: doc.title }
                                                                    });
                                                                    setSummaryDialog(true);
                                                                }}
                                                            >
                                                                <BookOpen className="w-4 h-4" />
                                                                {t.viewSummary}
                                                            </Button>
                                                        ) : autoSummarizing[doc.id] ? (
                                                            <Button variant="outline" size="sm" className="w-full" disabled>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                {t.summarizing}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full gap-2"
                                                                onClick={async () => {
                                                                    setAutoSummarizing(prev => ({ ...prev, [doc.id]: true }));
                                                                    try {
                                                                        await base44.functions.invoke('generateDocumentSummary', {
                                                                            document_id: doc.id
                                                                        });
                                                                        await loadData();
                                                                        toast.success(lang === 'pt' ? 'Resumo gerado!' : 'Summary generated!');
                                                                    } catch (error) {
                                                                        toast.error(lang === 'pt' ? 'Erro' : 'Error');
                                                                    } finally {
                                                                        setAutoSummarizing(prev => ({ ...prev, [doc.id]: false }));
                                                                    }
                                                                }}
                                                            >
                                                                <Sparkles className="w-4 h-4" />
                                                                {t.autoSummarize}
                                                            </Button>
                                                        )}

                                                        {doc.tags && doc.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 pt-2 border-t">
                                                                {doc.tags.slice(0, 3).map((tag, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </CardGlow>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Dialog */}
            <Dialog open={summaryDialog} onOpenChange={setSummaryDialog}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="w-6 h-6 text-metallic-gold" />
                            {t.summary}
                        </DialogTitle>
                    </DialogHeader>
                    {currentSummary && (
                        <div className="space-y-6">
                            <div className="bg-electric-cyan-50 dark:bg-electric-cyan-900/20 rounded-xl p-5 border-l-4 border-electric-cyan">
                                <h4 className="font-bold text-abyss-blue mb-2">{currentSummary.document.title}</h4>
                                <p className="text-sm text-gray-600">{t.executiveSummary}</p>
                            </div>

                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">
                                    {currentSummary.executive_summary}
                                </p>
                            </div>

                            {currentSummary.key_insights?.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-abyss-blue mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-electric-cyan" />
                                        {t.keyInsights}
                                    </h3>
                                    <div className="space-y-3">
                                        {currentSummary.key_insights.map((insight, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-metallic-gold">
                                                <h4 className="font-semibold text-metallic-gold mb-2">
                                                    {insight.insight || insight.title}
                                                </h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {insight.analysis || insight.content}
                                                </p>
                                                {insight.citation && (
                                                    <p className="text-xs text-gray-500 italic mt-2">{insight.citation}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentSummary.troyjo_frameworks_applied?.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-abyss-blue mb-3">{t.frameworksApplied}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentSummary.troyjo_frameworks_applied.map((framework, idx) => (
                                            <BadgeCaio key={idx} variant="gold">
                                                {framework}
                                            </BadgeCaio>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentSummary.recommendations?.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-abyss-blue mb-3">{t.recommendations}</h3>
                                    <ul className="space-y-2">
                                        {currentSummary.recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                <ChevronRight className="w-4 h-4 text-electric-cyan mt-0.5 flex-shrink-0" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}