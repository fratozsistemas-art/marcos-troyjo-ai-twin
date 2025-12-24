import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, Save, X, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function AwardManager({ lang = 'pt' }) {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        year: '',
        organization: '',
        description: '',
        order: 0,
        featured: true
    });

    const t = {
        pt: {
            title: 'Gerenciar Prêmios',
            add: 'Adicionar Prêmio',
            edit: 'Editar',
            delete: 'Excluir',
            save: 'Salvar',
            cancel: 'Cancelar',
            titleLabel: 'Título',
            year: 'Ano',
            organization: 'Organização',
            description: 'Descrição',
            order: 'Ordem',
            noAwards: 'Nenhum prêmio cadastrado'
        },
        en: {
            title: 'Manage Awards',
            add: 'Add Award',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            titleLabel: 'Title',
            year: 'Year',
            organization: 'Organization',
            description: 'Description',
            order: 'Order',
            noAwards: 'No awards registered'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadAwards();
    }, []);

    const loadAwards = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.Award.list('order');
            setAwards(data || []);
        } catch (error) {
            console.error('Error loading awards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await base44.entities.Award.update(editing.id, formData);
                toast.success(lang === 'pt' ? 'Prêmio atualizado!' : 'Award updated!');
            } else {
                await base44.entities.Award.create(formData);
                toast.success(lang === 'pt' ? 'Prêmio criado!' : 'Award created!');
            }
            setDialogOpen(false);
            setEditing(null);
            resetForm();
            loadAwards();
        } catch (error) {
            console.error('Error saving award:', error);
            toast.error('Error saving award');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir este prêmio?' : 'Delete this award?')) return;
        try {
            await base44.entities.Award.delete(id);
            toast.success(lang === 'pt' ? 'Prêmio excluído!' : 'Award deleted!');
            loadAwards();
        } catch (error) {
            console.error('Error deleting award:', error);
            toast.error('Error deleting award');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            year: '',
            organization: '',
            description: '',
            order: 0,
            featured: true
        });
    };

    const openEditDialog = (award) => {
        setEditing(award);
        setFormData({
            title: award.title,
            year: award.year || '',
            organization: award.organization || '',
            description: award.description || '',
            order: award.order || 0,
            featured: award.featured !== false
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
                ) : awards.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">{text.noAwards}</div>
                ) : (
                    <div className="space-y-3">
                        {awards.map((award) => (
                            <div key={award.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#D4AF37] hover:shadow-md transition-all">
                                <Award className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#002D62]">{award.title}</h3>
                                    {award.organization && <p className="text-sm text-gray-600">{award.organization}</p>}
                                    {award.year && <p className="text-xs text-gray-500">{award.year}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openEditDialog(award)}>
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(award.id)}>
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editing ? text.edit : text.add}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>{text.titleLabel} *</Label>
                                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{text.year}</Label>
                                    <Input value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                                </div>
                                <div>
                                    <Label>{text.order}</Label>
                                    <Input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} />
                                </div>
                            </div>
                            <div>
                                <Label>{text.organization}</Label>
                                <Input value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} />
                            </div>
                            <div>
                                <Label>{text.description}</Label>
                                <Textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); resetForm(); }}>
                                    <X className="w-4 h-4 mr-2" />
                                    {text.cancel}
                                </Button>
                                <Button onClick={handleSave} className="bg-[#002D62]">
                                    <Save className="w-4 h-4 mr-2" />
                                    {text.save}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}