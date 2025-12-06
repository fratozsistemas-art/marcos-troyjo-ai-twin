import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Upload, Search, FileText, Calendar, HardDrive, 
    Eye, Check, X, Loader2, Filter, SortAsc, SortDesc 
} from 'lucide-react';
import { toast } from 'sonner';

export default function EnhancedDocumentManager({ selectedDocuments = [], onSelectionChange, lang = 'pt' }) {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [viewDocument, setViewDocument] = useState(null);

    const t = {
        pt: {
            title: 'Gestão de Documentos',
            desc: 'Selecione documentos para preparação da entrevista',
            search: 'Buscar documentos...',
            upload: 'Upload Novo',
            uploading: 'Enviando...',
            category: 'Categoria',
            allCategories: 'Todas',
            sortBy: 'Ordenar',
            newest: 'Mais recentes',
            oldest: 'Mais antigos',
            nameAZ: 'Nome (A-Z)',
            nameZA: 'Nome (Z-A)',
            selected: 'selecionado(s)',
            viewDetails: 'Ver detalhes',
            select: 'Selecionar',
            deselect: 'Remover',
            noDocuments: 'Nenhum documento encontrado',
            uploadSuccess: 'Documento enviado com sucesso!',
            details: 'Detalhes do Documento',
            size: 'Tamanho',
            uploadedOn: 'Enviado em',
            type: 'Tipo',
            close: 'Fechar'
        },
        en: {
            title: 'Document Management',
            desc: 'Select documents for interview preparation',
            search: 'Search documents...',
            upload: 'Upload New',
            uploading: 'Uploading...',
            category: 'Category',
            allCategories: 'All',
            sortBy: 'Sort by',
            newest: 'Newest first',
            oldest: 'Oldest first',
            nameAZ: 'Name (A-Z)',
            nameZA: 'Name (Z-A)',
            selected: 'selected',
            viewDetails: 'View details',
            select: 'Select',
            deselect: 'Deselect',
            noDocuments: 'No documents found',
            uploadSuccess: 'Document uploaded successfully!',
            details: 'Document Details',
            size: 'Size',
            uploadedOn: 'Uploaded on',
            type: 'Type',
            close: 'Close'
        }
    }[lang];

    const categoryLabels = {
        pt: {
            speech: 'Discursos',
            book: 'Livros',
            article: 'Artigos',
            research_paper: 'Papers',
            interview: 'Entrevistas',
            report: 'Relatórios',
            policy_document: 'Docs Políticas',
            other: 'Outros'
        },
        en: {
            speech: 'Speeches',
            book: 'Books',
            article: 'Articles',
            research_paper: 'Papers',
            interview: 'Interviews',
            report: 'Reports',
            policy_document: 'Policy Docs',
            other: 'Other'
        }
    }[lang];

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const docs = await base44.entities.Document.list();
            setDocuments(docs || []);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            
            const newDoc = await base44.entities.Document.create({
                title: file.name.replace(/\.[^/.]+$/, ''),
                file_url,
                file_type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
                file_size: file.size,
                category: 'other'
            });

            setDocuments([newDoc, ...documents]);
            toast.success(t.uploadSuccess);
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error(lang === 'pt' ? 'Erro ao enviar documento' : 'Error uploading document');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const toggleSelection = (doc) => {
        const isSelected = selectedDocuments.some(d => d.id === doc.id);
        if (isSelected) {
            onSelectionChange(selectedDocuments.filter(d => d.id !== doc.id));
        } else {
            onSelectionChange([...selectedDocuments, doc]);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const filteredAndSorted = documents
        .filter(doc => {
            const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date_desc':
                    return new Date(b.created_date) - new Date(a.created_date);
                case 'date_asc':
                    return new Date(a.created_date) - new Date(b.created_date);
                case 'name_asc':
                    return (a.title || '').localeCompare(b.title || '');
                case 'name_desc':
                    return (b.title || '').localeCompare(a.title || '');
                default:
                    return 0;
            }
        });

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                <FileText className="w-5 h-5" />
                                {t.title}
                            </CardTitle>
                            <CardDescription>
                                {t.desc}
                                {selectedDocuments.length > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        {selectedDocuments.length} {t.selected}
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                        <div>
                            <input
                                type="file"
                                id="doc-upload"
                                className="hidden"
                                onChange={handleUpload}
                                accept=".pdf,.doc,.docx,.txt,.csv"
                            />
                            <label htmlFor="doc-upload">
                                <Button disabled={isUploading} className="bg-[#002D62]" asChild>
                                    <span>
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t.uploading}
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                {t.upload}
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder={t.search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder={t.category} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.allCategories}</SelectItem>
                                {Object.keys(categoryLabels).map(cat => (
                                    <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SortAsc className="w-4 h-4 mr-2" />
                                <SelectValue placeholder={t.sortBy} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date_desc">{t.newest}</SelectItem>
                                <SelectItem value="date_asc">{t.oldest}</SelectItem>
                                <SelectItem value="name_asc">{t.nameAZ}</SelectItem>
                                <SelectItem value="name_desc">{t.nameZA}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Document List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                        </div>
                    ) : filteredAndSorted.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {t.noDocuments}
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredAndSorted.map((doc) => {
                                const isSelected = selectedDocuments.some(d => d.id === doc.id);
                                return (
                                    <div
                                        key={doc.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                            isSelected 
                                                ? 'border-[#002D62] bg-blue-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelection(doc)}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm text-[#333F48] truncate">
                                                    {doc.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <HardDrive className="w-3 h-3" />
                                                        {formatFileSize(doc.file_size)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(doc.created_date).toLocaleDateString()}
                                                    </span>
                                                    {doc.category && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {categoryLabels[doc.category] || doc.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setViewDocument(doc)}
                                                className="h-8"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant={isSelected ? 'destructive' : 'default'}
                                                size="sm"
                                                onClick={() => toggleSelection(doc)}
                                                className="h-8"
                                            >
                                                {isSelected ? (
                                                    <>
                                                        <X className="w-4 h-4 mr-1" />
                                                        {t.deselect}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-1" />
                                                        {t.select}
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Document Details Modal */}
            <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.details}</DialogTitle>
                        <DialogDescription>{viewDocument?.title}</DialogDescription>
                    </DialogHeader>
                    {viewDocument && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-gray-500">{t.type}</Label>
                                    <p className="text-sm font-medium">{viewDocument.file_type?.toUpperCase()}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">{t.size}</Label>
                                    <p className="text-sm font-medium">{formatFileSize(viewDocument.file_size)}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">{t.uploadedOn}</Label>
                                    <p className="text-sm font-medium">
                                        {new Date(viewDocument.created_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">{t.category}</Label>
                                    <p className="text-sm font-medium">
                                        {categoryLabels[viewDocument.category] || viewDocument.category}
                                    </p>
                                </div>
                            </div>
                            {viewDocument.description && (
                                <div>
                                    <Label className="text-xs text-gray-500">Descrição</Label>
                                    <p className="text-sm text-gray-700">{viewDocument.description}</p>
                                </div>
                            )}
                            {viewDocument.tags && viewDocument.tags.length > 0 && (
                                <div>
                                    <Label className="text-xs text-gray-500">Tags</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {viewDocument.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setViewDocument(null)}>
                                    {t.close}
                                </Button>
                                <Button 
                                    onClick={() => {
                                        toggleSelection(viewDocument);
                                        setViewDocument(null);
                                    }}
                                    className="bg-[#002D62]"
                                >
                                    {selectedDocuments.some(d => d.id === viewDocument.id) ? t.deselect : t.select}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}