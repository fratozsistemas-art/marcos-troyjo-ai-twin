import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Upload, Image, Video, Music, FileText, File, Trash2, Download, Search, FolderOpen, Plus, X, Loader2, Edit2, FileJson, FileSpreadsheet, ChevronLeft, ChevronRight, Save, Share2, History as HistoryIcon, MessageSquare } from 'lucide-react';
import ShareDialog from '@/components/collaboration/ShareDialog';
import VersionHistory from '@/components/collaboration/VersionHistory';
import CommentThread from '@/components/collaboration/CommentThread';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Gerenciamento de Assets',
        subtitle: 'Upload e organização de arquivos de mídia',
        uploadNew: 'Novo Upload',
        search: 'Buscar assets...',
        noAssets: 'Nenhum asset encontrado',
        uploadFirst: 'Faça upload do seu primeiro arquivo',
        uploading: 'Enviando...',
        uploadTitle: 'Upload de Asset',
        fileName: 'Nome do arquivo',
        description: 'Descrição',
        tags: 'Tags (separadas por vírgula)',
        folder: 'Pasta',
        selectFile: 'Selecionar arquivo',
        cancel: 'Cancelar',
        upload: 'Enviar',
        delete: 'Excluir',
        download: 'Baixar',
        allAssets: 'Todos',
        images: 'Imagens',
        videos: 'Vídeos',
        audio: 'Áudio',
        documents: 'Documentos',
        other: 'Outros',
        deleteConfirm: 'Tem certeza que deseja excluir este asset?',
        edit: 'Editar',
        editTitle: 'Editar Asset',
        save: 'Salvar',
        exportCSV: 'Exportar CSV',
        exportJSON: 'Exportar JSON',
        uploadSuccess: 'Asset enviado com sucesso!',
        deleteSuccess: 'Asset excluído com sucesso!',
        updateSuccess: 'Asset atualizado com sucesso!',
        exportSuccess: 'Dados exportados com sucesso!',
        error: 'Erro ao processar operação',
        page: 'Página',
        of: 'de',
        itemsPerPage: 'Itens por página'
    },
    en: {
        title: 'Asset Management',
        subtitle: 'Upload and organize media files',
        uploadNew: 'New Upload',
        search: 'Search assets...',
        noAssets: 'No assets found',
        uploadFirst: 'Upload your first file',
        uploading: 'Uploading...',
        uploadTitle: 'Upload Asset',
        fileName: 'File name',
        description: 'Description',
        tags: 'Tags (comma separated)',
        folder: 'Folder',
        selectFile: 'Select file',
        cancel: 'Cancel',
        upload: 'Upload',
        delete: 'Delete',
        download: 'Download',
        allAssets: 'All',
        images: 'Images',
        videos: 'Videos',
        audio: 'Audio',
        documents: 'Documents',
        other: 'Other',
        deleteConfirm: 'Are you sure you want to delete this asset?',
        edit: 'Edit',
        editTitle: 'Edit Asset',
        save: 'Save',
        exportCSV: 'Export CSV',
        exportJSON: 'Export JSON',
        uploadSuccess: 'Asset uploaded successfully!',
        deleteSuccess: 'Asset deleted successfully!',
        updateSuccess: 'Asset updated successfully!',
        exportSuccess: 'Data exported successfully!',
        error: 'Error processing operation',
        page: 'Page',
        of: 'of',
        itemsPerPage: 'Items per page'
    }
};

export default function Assets() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadData, setUploadData] = useState({
        name: '',
        description: '',
        tags: '',
        folder: ''
    });
    const [editingAsset, setEditingAsset] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [shareOpen, setShareOpen] = useState(false);
    const [versionOpen, setVersionOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const t = translations[lang];

    useEffect(() => {
        loadAssets();
    }, []);

    useEffect(() => {
        filterAssets();
    }, [assets, search, filterType]);

    const loadAssets = async () => {
        setIsLoading(true);
        try {
            const data = await base44.entities.Asset.list('-created_date', 100);
            setAssets(data || []);
        } catch (error) {
            console.error('Error loading assets:', error);
            setAssets([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterAssets = () => {
        let filtered = assets;

        if (search) {
            filtered = filtered.filter(asset =>
                asset.name?.toLowerCase().includes(search.toLowerCase()) ||
                asset.description?.toLowerCase().includes(search.toLowerCase()) ||
                asset.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
            );
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(asset => asset.file_type === filterType);
        }

        setFilteredAssets(filtered);
    };

    const detectFileType = (mimeType) => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
        return 'other';
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setUploadData(prev => ({
                ...prev,
                name: file.name
            }));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
            
            const tags = uploadData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            await base44.entities.Asset.create({
                name: uploadData.name,
                file_url,
                file_type: detectFileType(selectedFile.type),
                mime_type: selectedFile.type,
                file_size: selectedFile.size,
                description: uploadData.description,
                tags,
                folder: uploadData.folder
            });

            await loadAssets();
            setUploadOpen(false);
            setSelectedFile(null);
            setUploadData({ name: '', description: '', tags: '', folder: '' });
            toast.success(t.uploadSuccess);
        } catch (error) {
            console.error('Error uploading asset:', error);
            toast.error(t.error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (assetId) => {
        if (!confirm(t.deleteConfirm)) return;

        try {
            await base44.entities.Asset.delete(assetId);
            setAssets(assets.filter(a => a.id !== assetId));
            toast.success(t.deleteSuccess);
        } catch (error) {
            console.error('Error deleting asset:', error);
            toast.error(t.error);
        }
    };

    const handleEdit = (asset) => {
        setEditingAsset(asset);
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingAsset) return;

        try {
            const tags = typeof editingAsset.tags === 'string' 
                ? editingAsset.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : editingAsset.tags;

            const updatedData = {
                name: editingAsset.name,
                description: editingAsset.description,
                tags,
                folder: editingAsset.folder
            };

            await base44.entities.Asset.update(editingAsset.id, updatedData);

            // Create version entry
            const versions = await base44.entities.Version.filter({ item_id: editingAsset.id });
            const maxVersion = Math.max(...versions.map(v => v.version_number), 0);

            await base44.entities.Version.create({
                item_type: 'asset',
                item_id: editingAsset.id,
                version_number: maxVersion + 1,
                content: { ...editingAsset, ...updatedData },
                change_summary: 'Asset metadata updated',
                changed_fields: Object.keys(updatedData)
            });

            await loadAssets();
            setEditOpen(false);
            setEditingAsset(null);
            toast.success(t.updateSuccess);
        } catch (error) {
            console.error('Error updating asset:', error);
            toast.error(t.error);
        }
    };

    const handleRestoreAssetVersion = async (versionContent) => {
        try {
            await base44.entities.Asset.update(selectedAsset.id, {
                name: versionContent.name,
                description: versionContent.description,
                tags: versionContent.tags,
                folder: versionContent.folder
            });
            await loadAssets();
        } catch (error) {
            console.error('Error restoring version:', error);
            toast.error(t.error);
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Type', 'Size', 'Description', 'Tags', 'Folder', 'URL', 'Created Date'];
        const rows = filteredAssets.map(asset => [
            asset.name,
            asset.file_type,
            formatFileSize(asset.file_size),
            asset.description || '',
            (asset.tags || []).join('; '),
            asset.folder || '',
            asset.file_url,
            new Date(asset.created_date).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assets_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(t.exportSuccess);
    };

    const exportToJSON = () => {
        const dataStr = JSON.stringify(filteredAssets, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assets_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(t.exportSuccess);
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'image': return Image;
            case 'video': return Video;
            case 'audio': return Music;
            case 'document': return FileText;
            default: return File;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const typeFilters = [
        { key: 'all', label: t.allAssets },
        { key: 'image', label: t.images },
        { key: 'video', label: t.videos },
        { key: 'audio', label: t.audio },
        { key: 'document', label: t.documents },
        { key: 'other', label: t.other }
    ];

    // Pagination
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterType]);

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-[#002D62] text-xl">{t.title}</h1>
                        <p className="text-sm text-[#333F48]/60">{t.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                            <FileSpreadsheet className="w-4 h-4" />
                            <span className="hidden md:inline">{t.exportCSV}</span>
                        </Button>
                        <Button onClick={exportToJSON} variant="outline" size="sm" className="gap-2">
                            <FileJson className="w-4 h-4" />
                            <span className="hidden md:inline">{t.exportJSON}</span>
                        </Button>
                        <Button onClick={() => setUploadOpen(true)} className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                            <Plus className="w-4 h-4" />
                            {t.uploadNew}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t.search}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        {typeFilters.map(filter => (
                            <Button
                                key={filter.key}
                                variant={filterType === filter.key ? 'default' : 'outline'}
                                onClick={() => setFilterType(filter.key)}
                                size="sm"
                                className={filterType === filter.key ? 'bg-[#002D62]' : ''}
                            >
                                {filter.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Assets Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">{t.noAssets}</p>
                            <p className="text-sm text-gray-400 mb-4">{t.uploadFirst}</p>
                            <Button onClick={() => setUploadOpen(true)} className="bg-[#002D62]">
                                <Upload className="w-4 h-4 mr-2" />
                                {t.uploadNew}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedAssets.map((asset, index) => {
                            const FileIcon = getFileIcon(asset.file_type);
                            return (
                                <motion.div
                                    key={asset.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                                            {asset.file_type === 'image' ? (
                                                <img src={asset.file_url} alt={asset.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileIcon className="w-16 h-16 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold text-sm text-[#333F48] mb-2 truncate">{asset.name}</h3>
                                            {asset.description && (
                                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{asset.description}</p>
                                            )}
                                            <div className="flex items-center justify-between mb-3">
                                                <Badge variant="outline" className="text-xs">{formatFileSize(asset.file_size)}</Badge>
                                                {asset.folder && (
                                                    <Badge variant="secondary" className="text-xs">{asset.folder}</Badge>
                                                )}
                                            </div>
                                            {asset.tags && asset.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {asset.tags.slice(0, 3).map((tag, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedAsset(asset);
                                                        setShareOpen(true);
                                                    }}
                                                >
                                                    <Share2 className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedAsset(asset);
                                                        setVersionOpen(true);
                                                    }}
                                                >
                                                    <HistoryIcon className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleEdit(asset)}
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setSelectedAsset(asset);
                                                        setCommentsOpen(true);
                                                    }}
                                                >
                                                    <MessageSquare className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => window.open(asset.file_url, '_blank')}
                                                >
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDelete(asset.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-600">
                                {t.page} {currentPage} {t.of} {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                                    })
                                    .map((page, idx, arr) => (
                                        <React.Fragment key={page}>
                                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                <span className="px-2 text-gray-400">...</span>
                                            )}
                                            <Button
                                                variant={currentPage === page ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className={currentPage === page ? 'bg-[#002D62]' : ''}
                                            >
                                                {page}
                                            </Button>
                                        </React.Fragment>
                                    ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </main>

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t.uploadTitle}</DialogTitle>
                        <DialogDescription>{t.subtitle}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="file">{t.selectFile}</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileSelect}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="name">{t.fileName}</Label>
                            <Input
                                id="name"
                                value={uploadData.name}
                                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">{t.description}</Label>
                            <Textarea
                                id="description"
                                value={uploadData.description}
                                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="folder">{t.folder}</Label>
                            <Input
                                id="folder"
                                value={uploadData.folder}
                                onChange={(e) => setUploadData({ ...uploadData, folder: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="tags">{t.tags}</Label>
                            <Input
                                id="tags"
                                value={uploadData.tags}
                                onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                                className="mt-1"
                                placeholder="exemplo, imagem, mídia"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={isUploading}>
                            {t.cancel}
                        </Button>
                        <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="bg-[#002D62]">
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
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t.editTitle}</DialogTitle>
                    </DialogHeader>
                    {editingAsset && (
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="edit-name">{t.fileName}</Label>
                                <Input
                                    id="edit-name"
                                    value={editingAsset.name}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-description">{t.description}</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editingAsset.description || ''}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, description: e.target.value })}
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-folder">{t.folder}</Label>
                                <Input
                                    id="edit-folder"
                                    value={editingAsset.folder || ''}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, folder: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-tags">{t.tags}</Label>
                                <Input
                                    id="edit-tags"
                                    value={Array.isArray(editingAsset.tags) ? editingAsset.tags.join(', ') : editingAsset.tags || ''}
                                    onChange={(e) => setEditingAsset({ ...editingAsset, tags: e.target.value })}
                                    className="mt-1"
                                    placeholder="exemplo, imagem, mídia"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditOpen(false)}>
                            {t.cancel}
                        </Button>
                        <Button onClick={handleUpdate} className="bg-[#002D62]">
                            <Save className="w-4 h-4 mr-2" />
                            {t.save}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Collaboration Dialogs */}
            {selectedAsset && (
                <>
                    <ShareDialog
                        open={shareOpen}
                        onOpenChange={setShareOpen}
                        itemType="asset"
                        itemId={selectedAsset.id}
                        itemTitle={selectedAsset.name}
                        itemData={selectedAsset}
                        lang={lang}
                    />
                    <VersionHistory
                        open={versionOpen}
                        onOpenChange={setVersionOpen}
                        itemType="asset"
                        itemId={selectedAsset.id}
                        onRestore={handleRestoreAssetVersion}
                        lang={lang}
                    />
                    <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
                        <DialogContent className="max-w-2xl">
                            <CommentThread
                                itemType="asset"
                                itemId={selectedAsset.id}
                                lang={lang}
                            />
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}