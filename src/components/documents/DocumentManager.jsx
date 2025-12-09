import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Upload, File, FileText, Trash2, Download, Eye, Loader2, X, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Biblioteca de Documentos',
        description: 'Gerencie documentos para análises e geração de conteúdo',
        upload: 'Upload de Documentos',
        uploadMultiple: 'Selecionar Arquivos',
        uploading: 'Enviando...',
        addDocument: 'Adicionar Documento',
        documentTitle: 'Título do Documento',
        documentDesc: 'Descrição (opcional)',
        tags: 'Tags (separadas por vírgula)',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        download: 'Baixar',
        view: 'Visualizar',
        noDocuments: 'Nenhum documento carregado',
        uploadFirst: 'Faça upload de documentos para usar nas análises',
        search: 'Buscar documentos...',
        usedTimes: 'Usado {{count}} vez(es)',
        formats: 'Formatos: PDF, DOCX, DOC, TXT, CSV',
        maxSize: 'Tamanho máximo: 10MB por arquivo',
        deleteConfirm: 'Tem certeza que deseja excluir este documento?'
    },
    en: {
        title: 'Document Library',
        description: 'Manage documents for analysis and content generation',
        upload: 'Upload Documents',
        uploadMultiple: 'Select Files',
        uploading: 'Uploading...',
        addDocument: 'Add Document',
        documentTitle: 'Document Title',
        documentDesc: 'Description (optional)',
        tags: 'Tags (comma separated)',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        download: 'Download',
        view: 'View',
        noDocuments: 'No documents uploaded',
        uploadFirst: 'Upload documents to use in analysis',
        search: 'Search documents...',
        usedTimes: 'Used {{count}} time(s)',
        formats: 'Formats: PDF, DOCX, DOC, TXT, CSV',
        maxSize: 'Max size: 10MB per file',
        deleteConfirm: 'Are you sure you want to delete this document?'
    }
};

const getFileIcon = (fileType) => {
    const icons = {
        pdf: '📄',
        docx: '📝',
        doc: '📝',
        txt: '📃',
        csv: '📊'
    };
    return icons[fileType] || '📎';
};

export default function DocumentManager({ lang = 'pt', onDocumentSelect }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentDoc, setCurrentDoc] = useState({
        title: '',
        description: '',
        tags: ''
    });
    const t = translations[lang];

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const docs = await base44.entities.Document.filter({
                created_by: user.email
            }, '-created_date');
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Erro ao carregar documentos');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            const validExtensions = ['pdf', 'docx', 'doc', 'txt', 'csv'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!validExtensions.includes(ext)) {
                toast.error(`${file.name}: Formato não suportado`);
                return false;
            }
            if (file.size > maxSize) {
                toast.error(`${file.name}: Arquivo muito grande (máx 10MB)`);
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
            toast.error('Título e arquivo são obrigatórios');
            return;
        }

        setUploading(true);
        try {
            for (const file of selectedFiles) {
                const uploadResult = await base44.integrations.Core.UploadFile({ file });
                
                if (!uploadResult || !uploadResult.file_url) {
                    throw new Error('Upload falhou: URL do arquivo não recebida');
                }
                
                const ext = file.name.split('.').pop().toLowerCase();
                const tags = currentDoc.tags ? currentDoc.tags.split(',').map(t => t.trim()).filter(t => t) : [];

                await base44.entities.Document.create({
                    title: selectedFiles.length > 1 ? file.name : currentDoc.title,
                    file_url: uploadResult.file_url,
                    file_type: ext,
                    file_size: file.size,
                    description: currentDoc.description || '',
                    tags,
                    usage_count: 0,
                    category: 'other'
                });
            }

            toast.success(`${selectedFiles.length} documento(s) carregado(s) com sucesso`);
            await loadDocuments();
            setDialogOpen(false);
            setSelectedFiles([]);
            setCurrentDoc({ title: '', description: '', tags: '' });
        } catch (error) {
            console.error('Error uploading:', error);
            toast.error(`Erro ao fazer upload: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!confirm(t.deleteConfirm)) return;

        try {
            await base44.entities.Document.delete(docId);
            setDocuments(documents.filter(d => d.id !== docId));
            toast.success('Documento excluído');
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Erro ao excluir documento');
        }
    };

    const filteredDocuments = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-[#002D62] flex items-center gap-2">
                            <File className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#002D62] hover:bg-[#001d42]">
                                <Upload className="w-4 h-4 mr-2" />
                                {t.upload}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t.addDocument}</DialogTitle>
                                <DialogDescription>
                                    {t.formats}<br/>
                                    {t.maxSize}
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="file-upload" className="cursor-pointer">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#002D62] transition-colors">
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600">{t.uploadMultiple}</p>
                                            {selectedFiles.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {selectedFiles.map((file, idx) => (
                                                        <p key={idx} className="text-xs text-[#002D62]">
                                                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                        </p>
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
                                        placeholder="Relatório Anual 2024"
                                    />
                                </div>

                                <div>
                                    <Label>{t.documentDesc}</Label>
                                    <Textarea
                                        value={currentDoc.description}
                                        onChange={(e) => setCurrentDoc({...currentDoc, description: e.target.value})}
                                        placeholder="Análise econômica do setor..."
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label>{t.tags}</Label>
                                    <Input
                                        value={currentDoc.tags}
                                        onChange={(e) => setCurrentDoc({...currentDoc, tags: e.target.value})}
                                        placeholder="economia, comercio, brasil"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
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
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                {documents.length > 0 && (
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t.search}
                                className="pl-10"
                            />
                        </div>
                    </div>
                )}

                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">{t.noDocuments}</p>
                        <p className="text-xs text-gray-400 mt-1">{t.uploadFirst}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="border border-gray-100 rounded-lg p-4 hover:border-[#002D62]/20 hover:bg-gray-50/50 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="text-3xl">{getFileIcon(doc.file_type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-[#002D62] truncate">
                                                {doc.title}
                                            </h4>
                                            {doc.description && (
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {doc.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <Badge variant="outline" className="text-xs">
                                                    {doc.file_type.toUpperCase()}
                                                </Badge>
                                                <span className="text-xs text-gray-400">
                                                    {(doc.file_size / 1024).toFixed(1)} KB
                                                </span>
                                                {doc.usage_count > 0 && (
                                                    <span className="text-xs text-[#00654A]">
                                                        {t.usedTimes.replace('{{count}}', doc.usage_count)}
                                                    </span>
                                                )}
                                                {doc.tags?.map((tag, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
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
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                            onClick={() => handleDelete(doc.id)}
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
        </Card>
    );
}