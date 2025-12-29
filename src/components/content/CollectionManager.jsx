import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FolderOpen, Plus, Edit, Trash2, Eye, Share2, 
    BookmarkPlus, Loader2, Grid, List, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function CollectionManager({ lang = 'pt', onCollectionSelect }) {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        collection_type: 'thematic_analysis',
        tags: [],
        visibility: 'private',
        color: '#002D62',
        status: 'draft'
    });

    const t = {
        pt: {
            title: 'Coleções de Conteúdo',
            create: 'Nova Coleção',
            name: 'Nome',
            description: 'Descrição',
            type: 'Tipo',
            tags: 'Tags',
            visibility: 'Visibilidade',
            status: 'Status',
            save: 'Salvar',
            cancel: 'Cancelar',
            delete: 'Excluir',
            items: 'itens',
            noCollections: 'Nenhuma coleção criada',
            search: 'Buscar coleções...',
            types: {
                thematic_analysis: 'Análise Temática',
                research_project: 'Projeto de Pesquisa',
                policy_brief: 'Policy Brief',
                learning_path: 'Caminho de Aprendizagem',
                client_deliverable: 'Entregável Cliente'
            },
            visibilities: {
                private: 'Privado',
                team: 'Equipe',
                organization: 'Organização',
                public: 'Público'
            },
            statuses: {
                draft: 'Rascunho',
                in_progress: 'Em Progresso',
                review: 'Em Revisão',
                published: 'Publicado'
            }
        },
        en: {
            title: 'Content Collections',
            create: 'New Collection',
            name: 'Name',
            description: 'Description',
            type: 'Type',
            tags: 'Tags',
            visibility: 'Visibility',
            status: 'Status',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            items: 'items',
            noCollections: 'No collections created',
            search: 'Search collections...',
            types: {
                thematic_analysis: 'Thematic Analysis',
                research_project: 'Research Project',
                policy_brief: 'Policy Brief',
                learning_path: 'Learning Path',
                client_deliverable: 'Client Deliverable'
            },
            visibilities: {
                private: 'Private',
                team: 'Team',
                organization: 'Organization',
                public: 'Public'
            },
            statuses: {
                draft: 'Draft',
                in_progress: 'In Progress',
                review: 'Review',
                published: 'Published'
            }
        }
    }[lang];

    useEffect(() => {
        loadCollections();
    }, []);

    const loadCollections = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const data = await base44.entities.ContentCollection.filter({
                owner_email: user.email
            });
            setCollections(data);
        } catch (error) {
            console.error('Error loading collections:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar coleções' : 'Error loading collections');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error(lang === 'pt' ? 'Nome é obrigatório' : 'Name is required');
            return;
        }

        try {
            const user = await base44.auth.me();
            
            if (editingCollection) {
                await base44.entities.ContentCollection.update(editingCollection.id, formData);
                toast.success(lang === 'pt' ? 'Coleção atualizada!' : 'Collection updated!');
            } else {
                await base44.entities.ContentCollection.create({
                    ...formData,
                    owner_email: user.email,
                    content_items: []
                });
                toast.success(lang === 'pt' ? 'Coleção criada!' : 'Collection created!');
            }
            
            setDialogOpen(false);
            setEditingCollection(null);
            resetForm();
            loadCollections();
        } catch (error) {
            console.error('Error saving collection:', error);
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir esta coleção?' : 'Delete this collection?')) return;
        
        try {
            await base44.entities.ContentCollection.delete(id);
            toast.success(lang === 'pt' ? 'Coleção excluída!' : 'Collection deleted!');
            loadCollections();
        } catch (error) {
            console.error('Error deleting collection:', error);
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            collection_type: 'thematic_analysis',
            tags: [],
            visibility: 'private',
            color: '#002D62',
            status: 'draft'
        });
    };

    const filteredCollections = collections.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <FolderOpen className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        >
                            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                        </Button>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => { resetForm(); setEditingCollection(null); }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t.create}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingCollection ? t.name : t.create}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>{t.name}</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder={lang === 'pt' ? 'Análise BRICS 2024' : 'BRICS Analysis 2024'}
                                        />
                                    </div>

                                    <div>
                                        <Label>{t.description}</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>{t.type}</Label>
                                            <Select value={formData.collection_type} onValueChange={(v) => setFormData({...formData, collection_type: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(t.types).map((key) => (
                                                        <SelectItem key={key} value={key}>{t.types[key]}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>{t.visibility}</Label>
                                            <Select value={formData.visibility} onValueChange={(v) => setFormData({...formData, visibility: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(t.visibilities).map((key) => (
                                                        <SelectItem key={key} value={key}>{t.visibilities[key]}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>{t.status}</Label>
                                            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(t.statuses).map((key) => (
                                                        <SelectItem key={key} value={key}>{t.statuses[key]}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>{lang === 'pt' ? 'Cor' : 'Color'}</Label>
                                            <Input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({...formData, color: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} className="flex-1">
                                            {t.save}
                                        </Button>
                                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                            {t.cancel}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Search */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : filteredCollections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">{t.noCollections}</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                        {filteredCollections.map((collection) => (
                            <motion.div
                                key={collection.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 border-l-4 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer"
                                style={{ borderLeftColor: collection.color }}
                                onClick={() => onCollectionSelect?.(collection)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-sm text-gray-900 flex-1">
                                        {collection.name}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingCollection(collection);
                                                setFormData(collection);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(collection.id);
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                {collection.description && (
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        {collection.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-1 mb-2">
                                    <Badge variant="outline" className="text-xs">
                                        {t.types[collection.collection_type]}
                                    </Badge>
                                    <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                        style={{ backgroundColor: `${collection.color}20`, color: collection.color }}
                                    >
                                        {collection.content_items?.length || 0} {t.items}
                                    </Badge>
                                </div>

                                {collection.tags && collection.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {collection.tags.slice(0, 3).map((tag, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}