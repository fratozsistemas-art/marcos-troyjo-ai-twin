import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, Save, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function NeologismManager({ lang = 'pt' }) {
    const [concepts, setConcepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        concept_name: '',
        type: 'neologismo',
        version: '1.0',
        content: ''
    });

    useEffect(() => {
        loadConcepts();
    }, []);

    const loadConcepts = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.ConceptEvolution.list('-created_date', 100);
            setConcepts(data || []);
        } catch (error) {
            console.error('Error loading concepts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await base44.entities.ConceptEvolution.update(editing.id, formData);
                toast.success(lang === 'pt' ? 'Conceito atualizado!' : 'Concept updated!');
            } else {
                await base44.entities.ConceptEvolution.create(formData);
                toast.success(lang === 'pt' ? 'Conceito criado!' : 'Concept created!');
            }
            setDialogOpen(false);
            setEditing(null);
            resetForm();
            loadConcepts();
        } catch (error) {
            console.error('Error saving concept:', error);
            toast.error('Error saving concept');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir este conceito?' : 'Delete this concept?')) return;
        try {
            await base44.entities.ConceptEvolution.delete(id);
            toast.success(lang === 'pt' ? 'Conceito excluído!' : 'Concept deleted!');
            loadConcepts();
        } catch (error) {
            console.error('Error deleting concept:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            concept_name: '',
            type: 'neologismo',
            version: '1.0',
            content: ''
        });
    };

    const openEditDialog = (concept) => {
        setEditing(concept);
        setFormData({
            concept_name: concept.concept_name,
            type: concept.type,
            version: concept.version || '1.0',
            content: concept.content
        });
        setDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{lang === 'pt' ? 'Gerenciar Neologismos' : 'Manage Neologisms'}</CardTitle>
                    <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-[#002D62] gap-2">
                        <Plus className="w-4 h-4" />
                        {lang === 'pt' ? 'Adicionar' : 'Add'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                    </div>
                ) : concepts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {lang === 'pt' ? 'Nenhum conceito cadastrado' : 'No concepts registered'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {concepts.map((concept) => (
                            <div key={concept.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#002D62]">{concept.concept_name}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{concept.content}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openEditDialog(concept)}>
                                        <Edit2 className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(concept.id)}>
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
                            <DialogTitle>{editing ? 'Editar' : lang === 'pt' ? 'Adicionar' : 'Add'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>{lang === 'pt' ? 'Nome do Conceito' : 'Concept Name'} *</Label>
                                <Input value={formData.concept_name} onChange={(e) => setFormData({...formData, concept_name: e.target.value})} />
                            </div>
                            <div>
                                <Label>{lang === 'pt' ? 'Conteúdo' : 'Content'} *</Label>
                                <Textarea rows={5} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => { setDialogOpen(false); setEditing(null); resetForm(); }}>
                                    <X className="w-4 h-4 mr-2" />
                                    {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                                </Button>
                                <Button onClick={handleSave} className="bg-[#002D62]">
                                    <Save className="w-4 h-4 mr-2" />
                                    {lang === 'pt' ? 'Salvar' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}