import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, Save, X, FileText, Video } from 'lucide-react';
import { toast } from 'sonner';

export default function PublicationManager({ lang = 'pt' }) {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'article',
        publication_date: '',
        outlet: '',
        url: '',
        video_link: '',
        topics: '',
        summary: ''
    });

    const t = {
        pt: {
            title: 'Gerenciar Publicações',
            add: 'Adicionar Publicação',
            titleLabel: 'Título',
            type: 'Tipo',
            article: 'Artigo',
            interview: 'Entrevista',
            date: 'Data',
            outlet: 'Veículo',
            url: 'URL',
            videoLink: 'Link do Vídeo',
            topics: 'Tópicos (separados por vírgula)',
            summary: 'Resumo',
            noPublications: 'Nenhuma publicação cadastrada'
        },
        en: {
            title: 'Manage Publications',
            add: 'Add Publication',
            titleLabel: 'Title',
            type: 'Type',
            article: 'Article',
            interview: 'Interview',
            date: 'Date',
            outlet: 'Outlet',
            url: 'URL',
            videoLink: 'Video Link',
            topics: 'Topics (comma separated)',
            summary: 'Summary',
            noPublications: 'No publications registered'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadPublications();
    }, []);

    const loadPublications = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.Publication.list('-publication_date', 100);
            setPublications(data || []);
        } catch (error) {
            console.error('Error loading publications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const topics = formData.topics.split(',').map(t => t.trim()).filter(t => t);
            const data = { ...formData, topics };
            
            if (editing) {
                await base44.entities.Publication.update(editing.id, data);
                toast.success(lang === 'pt' ? 'Publicação atualizada!' : 'Publication updated!');
            } else {
                await base44.entities.Publication.create(data);
                toast.success(lang === 'pt' ? 'Publicação criada!' : 'Publication created!');
            }
            setDialogOpen(false);
            setEditing(null);
            resetForm();
            loadPublications();
        } catch (error) {
            console.error('Error saving publication:', error);
            toast.error('Error saving publication');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir esta publicação?' : 'Delete this publication?')) return;
        try {
            await base44.entities.Publication.delete(id);
            toast.success(lang === 'pt' ? 'Publicação excluída!' : 'Publication deleted!');
            loadPublications();
        } catch (error) {
            console.error('Error deleting publication:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'article',
            publication_date: '',
            outlet: '',
            url: '',
            video_link: '',
            topics: '',
            summary: ''
        });
    };

    const openEditDialog = (pub) => {
        setEditing(pub);
        setFormData({
            title: pub.title,
            type: pub.type,
            publication_date: pub.publication_date || '',
            outlet: pub.outlet || '',
            url: pub.url || '',
            video_link: pub.video_link || '',
            topics: pub.topics?.join(', ') || '',
            summary: pub.summary || ''
        });
        setDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{text.title}</CardTitle>
                    <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-[#002D62] gap-2">
                        <Plus className="w-4 h-4" />
                        {text.add}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                    </div>
                ) : publications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">{text.noPublications}</div>
                ) : (
                    <div className="space-y-3">
                        {publications.map((pub) => (
                            <div key={pub.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                                {pub.type === 'interview' && pub.video_link ? (
                                    <Video className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <FileText className="w-5 h-5 text-[#002D62] flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#002D62]">{pub.title}</h3>
                                    {pub.outlet && <p className="text-sm text-gray-600">{pub.outlet}</p>}
                                    {pub.publication_date && <p className="text-xs text-gray-500">{new Date(pub.publication_date).toLocaleDateString()}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openEditDialog(pub)}>
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(pub.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editing ? 'Editar' : text.add}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>{text.titleLabel} *</Label>
                                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{text.type} *</Label>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="article">{text.article}</SelectItem>
                                            <SelectItem value="interview">{text.interview}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>{text.date}</Label>
                                    <Input type="date" value={formData.publication_date} onChange={(e) => setFormData({...formData, publication_date: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <Label>{text.outlet}</Label>
                                <Input value={formData.outlet} onChange={(e) => setFormData({...formData, outlet: e.target.value})} />
                            </div>
                            <div>
                                <Label>{text.url}</Label>
                                <Input value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} />
                            </div>
                            <div>
                                <Label>{text.videoLink}</Label>
                                <Input value={formData.video_link} onChange={(e) => setFormData({...formData, video_link: e.target.value})} />
                            </div>
                            <div>
                                <Label>{text.topics}</Label>
                                <Input value={formData.topics} onChange={(e) => setFormData({...formData, topics: e.target.value})} />
                            </div>
                            <div>
                                <Label>{text.summary}</Label>
                                <Textarea rows={3} value={formData.summary} onChange={(e) => setFormData({...formData, summary: e.target.value})} />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); resetForm(); }}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} className="bg-[#002D62]">
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}