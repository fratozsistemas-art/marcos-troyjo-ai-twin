import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Upload, Image, Video, Music, FileText, File, Trash2, Download, Search, FolderOpen, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        deleteConfirm: 'Tem certeza que deseja excluir este asset?'
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
        deleteConfirm: 'Are you sure you want to delete this asset?'
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
        } catch (error) {
            console.error('Error uploading asset:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (assetId) => {
        if (!confirm(t.deleteConfirm)) return;

        try {
            await base44.entities.Asset.delete(assetId);
            setAssets(assets.filter(a => a.id !== assetId));
        } catch (error) {
            console.error('Error deleting asset:', error);
        }
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

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-[#002D62] text-xl">{t.title}</h1>
                        <p className="text-sm text-[#333F48]/60">{t.subtitle}</p>
                    </div>
                    <Button onClick={() => setUploadOpen(true)} className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                        <Plus className="w-4 h-4" />
                        {t.uploadNew}
                    </Button>
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
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAssets.map((asset, index) => {
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
                                            <div className="flex gap-2">
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
        </div>
    );
}