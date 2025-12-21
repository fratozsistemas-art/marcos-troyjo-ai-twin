import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
    Plus, ArrowLeft, Edit, Trash2, Eye, Save, X, Loader2, Upload
} from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Gerenciar Base de Conhecimento',
        subtitle: 'Criar e editar artigos, tutoriais e FAQs',
        back: 'Voltar',
        newArticle: 'Novo Artigo',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        preview: 'Visualizar',
        title_field: 'Título',
        summary_field: 'Resumo',
        body_field: 'Conteúdo (Markdown)',
        category: 'Categoria',
        subcategory: 'Subcategoria',
        tags: 'Tags (separadas por vírgula)',
        keywords: 'Palavras-chave (separadas por vírgula)',
        difficulty: 'Dificuldade',
        status: 'Status',
        readingTime: 'Tempo de leitura (minutos)',
        priority: 'Prioridade de busca (1-10)',
        featured: 'Destacar artigo',
        saving: 'Salvando...',
        deleteConfirm: 'Tem certeza que deseja excluir este artigo?'
    }
};

export default function KnowledgeAdmin() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        body: '',
        category: 'artigo',
        subcategory: '',
        tags: '',
        keywords: '',
        difficulty_level: 'intermediario',
        status: 'rascunho',
        estimated_reading_time: 5,
        search_priority: 5,
        featured: false
    });
    const t = translations[lang];

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.KnowledgeEntry.list('-updated_date');
            setEntries(data);
        } catch (error) {
            console.error('Error loading entries:', error);
            toast.error('Erro ao carregar artigos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (entry = null) => {
        if (entry) {
            setEditingEntry(entry);
            setFormData({
                title: entry.title,
                summary: entry.summary || '',
                body: entry.body,
                category: entry.category,
                subcategory: entry.subcategory || '',
                tags: entry.tags?.join(', ') || '',
                keywords: entry.keywords?.join(', ') || '',
                difficulty_level: entry.difficulty_level || 'intermediario',
                status: entry.status || 'rascunho',
                estimated_reading_time: entry.estimated_reading_time || 5,
                search_priority: entry.search_priority || 5,
                featured: entry.featured || false
            });
        } else {
            setEditingEntry(null);
            setFormData({
                title: '',
                summary: '',
                body: '',
                category: 'artigo',
                subcategory: '',
                tags: '',
                keywords: '',
                difficulty_level: 'intermediario',
                status: 'rascunho',
                estimated_reading_time: 5,
                search_priority: 5,
                featured: false
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.body) {
            toast.error('Título e conteúdo são obrigatórios');
            return;
        }

        setSaving(true);
        try {
            const user = await base44.auth.me();
            
            const data = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
                author: user.full_name || user.email,
                last_reviewed_date: new Date().toISOString()
            };

            let entryId;
            if (editingEntry) {
                await base44.entities.KnowledgeEntry.update(editingEntry.id, data);
                entryId = editingEntry.id;
                toast.success('Artigo atualizado!');
            } else {
                const newEntry = await base44.entities.KnowledgeEntry.create(data);
                entryId = newEntry.id;
                toast.success('Artigo criado!');
            }

            // Generate embedding for the article
            try {
                toast.info('Gerando embedding semântico...');
                await base44.functions.invoke('generateKnowledgeEmbeddings', {
                    entry_id: entryId,
                    force: true
                });
                
                // Find and link related articles automatically
                const relatedResponse = await base44.functions.invoke('findRelatedArticles', {
                    entry_id: entryId,
                    limit: 5,
                    min_similarity: 0.75,
                    auto_update: true
                });
                
                if (relatedResponse.data.total > 0) {
                    toast.success(`${relatedResponse.data.total} artigos relacionados encontrados!`);
                }
            } catch (embeddingError) {
                console.error('Error generating embedding:', embeddingError);
                toast.warning('Artigo salvo, mas erro ao gerar embedding');
            }

            setDialogOpen(false);
            loadEntries();
        } catch (error) {
            console.error('Error saving entry:', error);
            toast.error('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t.deleteConfirm)) return;

        try {
            await base44.entities.KnowledgeEntry.delete(id);
            toast.success('Artigo excluído!');
            loadEntries();
        } catch (error) {
            console.error('Error deleting entry:', error);
            toast.error('Erro ao excluir');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-[#002D62]">{t.title}</h1>
                            <p className="text-sm text-gray-600">{t.subtitle}</p>
                        </div>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-[#002D62] gap-2">
                        <Plus className="w-4 h-4" />
                        {t.newArticle}
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {entries.map((entry) => (
                            <Card key={entry.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-[#002D62]">
                                                    {entry.title}
                                                </h3>
                                                {entry.featured && (
                                                    <Badge className="bg-[#B8860B] text-white">Destaque</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {entry.summary}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">{entry.category}</Badge>
                                                <Badge>{entry.status}</Badge>
                                                <Badge variant="outline">{entry.difficulty_level}</Badge>
                                                {entry.tags?.slice(0, 3).map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link to={createPageUrl('KnowledgeArticle') + `?id=${entry.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDialog(entry)}
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Edit/Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingEntry ? 'Editar Artigo' : t.newArticle}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>{t.title_field}</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>{t.summary_field}</Label>
                            <Textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label>{t.body_field}</Label>
                            <Textarea
                                value={formData.body}
                                onChange={(e) => setFormData({...formData, body: e.target.value})}
                                rows={10}
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t.category}</Label>
                                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tutorial">Tutorial</SelectItem>
                                        <SelectItem value="faq">FAQ</SelectItem>
                                        <SelectItem value="artigo">Artigo</SelectItem>
                                        <SelectItem value="guia">Guia</SelectItem>
                                        <SelectItem value="referencia">Referência</SelectItem>
                                        <SelectItem value="conceito">Conceito</SelectItem>
                                        <SelectItem value="troubleshooting">Solução de Problemas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t.difficulty}</Label>
                                <Select value={formData.difficulty_level} onValueChange={(val) => setFormData({...formData, difficulty_level: val})}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="iniciante">Iniciante</SelectItem>
                                        <SelectItem value="intermediario">Intermediário</SelectItem>
                                        <SelectItem value="avancado">Avançado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>{t.tags}</Label>
                            <Input
                                value={formData.tags}
                                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                placeholder="economia, BRICS, comércio"
                            />
                        </div>
                        <div>
                            <Label>{t.keywords}</Label>
                            <Input
                                value={formData.keywords}
                                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                                placeholder="PIB, exportação, balança comercial"
                            />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label>{t.status}</Label>
                                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
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
                            <div>
                                <Label>{t.readingTime}</Label>
                                <Input
                                    type="number"
                                    value={formData.estimated_reading_time}
                                    onChange={(e) => setFormData({...formData, estimated_reading_time: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <Label>{t.priority}</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.search_priority}
                                    onChange={(e) => setFormData({...formData, search_priority: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.featured}
                                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                                className="w-4 h-4"
                            />
                            <Label>{t.featured}</Label>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                {t.cancel}
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-[#002D62]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                {t.save}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}