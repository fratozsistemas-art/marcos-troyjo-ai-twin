import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, FileText, BookOpen, Mic, FileSpreadsheet, FileCheck, File, Trash2, Download, Edit2, Loader2, X, Plus, Calendar, User, Tag, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentLibrary({ lang = 'pt' }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [uploadData, setUploadData] = useState({
        title: '',
        author: '',
        category: 'other',
        description: '',
        publication_date: '',
        tags: '',
        keywords: ''
    });

    const t = {
        pt: {
            title: 'Biblioteca de Documentos',
            upload: 'Upload de Documento',
            search: 'Buscar documentos...',
            category: 'Categoria',
            all: 'Todos',
            speech: 'Discursos',
            book: 'Livros',
            article: 'Artigos',
            research_paper: 'Pesquisas',
            interview: 'Entrevistas',
            report: 'Relatórios',
            policy_document: 'Documentos Políticos',
            other: 'Outros',
            titleLabel: 'Título',
            authorLabel: 'Autor',
            categoryLabel: 'Categoria',
            descriptionLabel: 'Descrição',
            publicationDate: 'Data de Publicação',
            tagsLabel: 'Tags (separadas por vírgula)',
            keywordsLabel: 'Palavras-chave (separadas por vírgula)',
            selectFile: 'Selecionar Arquivo',
            uploadBtn: 'Fazer Upload',
            cancel: 'Cancelar',
            edit: 'Editar',
            delete: 'Excluir',
            view: 'Visualizar',
            noDocuments: 'Nenhum documento encontrado',
            uploadSuccess: 'Documento enviado com sucesso!',
            updateSuccess: 'Documento atualizado!',
            deleteSuccess: 'Documento excluído!',
            metadata: 'Metadados',
            fileSize: 'Tamanho',
            uploadDate: 'Data de Upload',
            lastUsed: 'Último Uso',
            usageCount: 'Vezes Usado'
        },
        en: {
            title: 'Document Library',
            upload: 'Upload Document',
            search: 'Search documents...',
            category: 'Category',
            all: 'All',
            speech: 'Speeches',
            book: 'Books',
            article: 'Articles',
            research_paper: 'Research Papers',
            interview: 'Interviews',
            report: 'Reports',
            policy_document: 'Policy Documents',
            other: 'Other',
            titleLabel: 'Title',
            authorLabel: 'Author',
            categoryLabel: 'Category',
            descriptionLabel: 'Description',
            publicationDate: 'Publication Date',
            tagsLabel: 'Tags (comma separated)',
            keywordsLabel: 'Keywords (comma separated)',
            selectFile: 'Select File',
            uploadBtn: 'Upload',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            view: 'View',
            noDocuments: 'No documents found',
            uploadSuccess: 'Document uploaded successfully!',
            updateSuccess: 'Document updated!',
            deleteSuccess: 'Document deleted!',
            metadata: 'Metadata',
            fileSize: 'File Size',
            uploadDate: 'Upload Date',
            lastUsed: 'Last Used',
            usageCount: 'Times Used'
        }
    }[lang];

    const categoryIcons = {
        speech: Mic,
        book: BookOpen,
        article: FileText,
        research_paper: FileSpreadsheet,
        interview: Mic,
        report: FileCheck,
        policy_document: FileText,
        other: File
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const docs = await base44.entities.Document.list('-created_date');
            setDocuments(docs || []);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('doc-file-input');
        const file = fileInput?.files?.[0];

        if (!file) {
            toast.error(lang === 'pt' ? 'Selecione um arquivo' : 'Select a file');
            return;
        }

        setLoading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });

            const tags = uploadData.tags.split(',').map(t => t.trim()).filter(t => t);
            const keywords = uploadData.keywords.split(',').map(k => k.trim()).filter(k => k);

            await base44.entities.Document.create({
                title: uploadData.title,
                author: uploadData.author,
                category: uploadData.category,
                description: uploadData.description,
                publication_date: uploadData.publication_date || null,
                tags,
                keywords,
                file_url,
                file_type: file.name.split('.').pop().toLowerCase(),
                file_size: file.size
            });

            setUploadOpen(false);
            setUploadData({
                title: '',
                author: '',
                category: 'other',
                description: '',
                publication_date: '',
                tags: '',
                keywords: ''
            });
            await loadDocuments();
            toast.success(t.uploadSuccess);
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error('Error uploading document');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedDoc) return;

        try {
            const tags = typeof selectedDoc.tags === 'string' 
                ? selectedDoc.tags.split(',').map(t => t.trim()).filter(t => t)
                : selectedDoc.tags;

            const keywords = typeof selectedDoc.keywords === 'string'
                ? selectedDoc.keywords.split(',').map(k => k.trim()).filter(k => k)
                : selectedDoc.keywords;

            await base44.entities.Document.update(selectedDoc.id, {
                title: selectedDoc.title,
                author: selectedDoc.author,
                category: selectedDoc.category,
                description: selectedDoc.description,
                publication_date: selectedDoc.publication_date,
                tags,
                keywords
            });

            setEditOpen(false);
            await loadDocuments();
            toast.success(t.updateSuccess);
        } catch (error) {
            console.error('Error updating:', error);
            toast.error('Error updating document');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir este documento?' : 'Delete this document?')) return;

        try {
            await base44.entities.Document.delete(id);
            await loadDocuments();
            toast.success(t.deleteSuccess);
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Error deleting document');
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = !searchQuery || 
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            doc.keywords?.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return mb < 1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.search}
                        className="pl-10"
                    />
                </div>
                <Button onClick={() => setUploadOpen(true)} className="bg-[#002D62] gap-2">
                    <Upload className="w-4 h-4" />
                    {t.upload}
                </Button>
            </div>

            <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                <TabsList className="grid grid-cols-4 lg:grid-cols-9 w-full">
                    <TabsTrigger value="all">{t.all}</TabsTrigger>
                    <TabsTrigger value="speech">{t.speech}</TabsTrigger>
                    <TabsTrigger value="book">{t.book}</TabsTrigger>
                    <TabsTrigger value="article">{t.article}</TabsTrigger>
                    <TabsTrigger value="research_paper">{t.research_paper}</TabsTrigger>
                    <TabsTrigger value="interview">{t.interview}</TabsTrigger>
                    <TabsTrigger value="report">{t.report}</TabsTrigger>
                    <TabsTrigger value="policy_document">{t.policy_document}</TabsTrigger>
                    <TabsTrigger value="other">{t.other}</TabsTrigger>
                </TabsList>
            </Tabs>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                </div>
            ) : filteredDocs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t.noDocuments}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredDocs.map(doc => {
                            const Icon = categoryIcons[doc.category] || File;
                            return (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-[#002D62]/10 flex items-center justify-center flex-shrink-0">
                                                        <Icon className="w-5 h-5 text-[#002D62]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm text-[#002D62] line-clamp-2">
                                                            {doc.title}
                                                        </h4>
                                                        <Badge variant="secondary" className="mt-1 text-xs">
                                                            {t[doc.category]}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {doc.author && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <User className="w-3 h-3" />
                                                    <span className="truncate">{doc.author}</span>
                                                </div>
                                            )}
                                            {doc.publication_date && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(doc.publication_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {doc.description && (
                                                <p className="text-xs text-gray-600 line-clamp-2">
                                                    {doc.description}
                                                </p>
                                            )}
                                            {doc.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {doc.tags.slice(0, 3).map((tag, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setSelectedDoc(doc);
                                                        setViewOpen(true);
                                                    }}
                                                >
                                                    <Eye className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setSelectedDoc({
                                                            ...doc,
                                                            tags: doc.tags?.join(', ') || '',
                                                            keywords: doc.keywords?.join(', ') || ''
                                                        });
                                                        setEditOpen(true);
                                                    }}
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(doc.file_url, '_blank')}
                                                >
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.upload}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t.titleLabel} *</Label>
                                <Input
                                    required
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>{t.authorLabel}</Label>
                                <Input
                                    value={uploadData.author}
                                    onChange={(e) => setUploadData({...uploadData, author: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t.categoryLabel} *</Label>
                                <Select
                                    value={uploadData.category}
                                    onValueChange={(value) => setUploadData({...uploadData, category: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(categoryIcons).map(cat => (
                                            <SelectItem key={cat} value={cat}>{t[cat]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t.publicationDate}</Label>
                                <Input
                                    type="date"
                                    value={uploadData.publication_date}
                                    onChange={(e) => setUploadData({...uploadData, publication_date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>{t.descriptionLabel}</Label>
                            <Textarea
                                value={uploadData.description}
                                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                                rows={3}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t.tagsLabel}</Label>
                                <Input
                                    value={uploadData.tags}
                                    onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                                    placeholder="economia, comércio, BRICS"
                                />
                            </div>
                            <div>
                                <Label>{t.keywordsLabel}</Label>
                                <Input
                                    value={uploadData.keywords}
                                    onChange={(e) => setUploadData({...uploadData, keywords: e.target.value})}
                                    placeholder="globalização, competitividade"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>{t.selectFile} *</Label>
                            <Input
                                id="doc-file-input"
                                type="file"
                                required
                                accept=".pdf,.doc,.docx,.txt,.csv"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                                {t.cancel}
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-[#002D62]">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.uploadBtn}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.edit}</DialogTitle>
                    </DialogHeader>
                    {selectedDoc && (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>{t.titleLabel}</Label>
                                    <Input
                                        value={selectedDoc.title}
                                        onChange={(e) => setSelectedDoc({...selectedDoc, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>{t.authorLabel}</Label>
                                    <Input
                                        value={selectedDoc.author || ''}
                                        onChange={(e) => setSelectedDoc({...selectedDoc, author: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>{t.categoryLabel}</Label>
                                    <Select
                                        value={selectedDoc.category}
                                        onValueChange={(value) => setSelectedDoc({...selectedDoc, category: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(categoryIcons).map(cat => (
                                                <SelectItem key={cat} value={cat}>{t[cat]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>{t.publicationDate}</Label>
                                    <Input
                                        type="date"
                                        value={selectedDoc.publication_date || ''}
                                        onChange={(e) => setSelectedDoc({...selectedDoc, publication_date: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>{t.descriptionLabel}</Label>
                                <Textarea
                                    value={selectedDoc.description || ''}
                                    onChange={(e) => setSelectedDoc({...selectedDoc, description: e.target.value})}
                                    rows={3}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>{t.tagsLabel}</Label>
                                    <Input
                                        value={selectedDoc.tags || ''}
                                        onChange={(e) => setSelectedDoc({...selectedDoc, tags: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>{t.keywordsLabel}</Label>
                                    <Input
                                        value={selectedDoc.keywords || ''}
                                        onChange={(e) => setSelectedDoc({...selectedDoc, keywords: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setEditOpen(false)}>
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleUpdate} className="bg-[#002D62]">
                                    {t.edit}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedDoc?.title}</DialogTitle>
                        <DialogDescription>{t.metadata}</DialogDescription>
                    </DialogHeader>
                    {selectedDoc && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {selectedDoc.author && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">{t.authorLabel}</p>
                                            <p className="font-medium">{selectedDoc.author}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">{t.categoryLabel}</p>
                                        <p className="font-medium">{t[selectedDoc.category]}</p>
                                    </div>
                                </div>
                                {selectedDoc.publication_date && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">{t.publicationDate}</p>
                                            <p className="font-medium">
                                                {new Date(selectedDoc.publication_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">{t.fileSize}</p>
                                        <p className="font-medium">{formatFileSize(selectedDoc.file_size)}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedDoc.description && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">{t.descriptionLabel}</p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        {selectedDoc.description}
                                    </p>
                                </div>
                            )}

                            {selectedDoc.tags?.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">{t.tagsLabel}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDoc.tags.map((tag, i) => (
                                            <Badge key={i} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedDoc.keywords?.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">{t.keywordsLabel}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDoc.keywords.map((kw, i) => (
                                            <Badge key={i} className="bg-blue-100 text-blue-800">{kw}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => window.open(selectedDoc.file_url, '_blank')}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    {t.download || 'Download'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}