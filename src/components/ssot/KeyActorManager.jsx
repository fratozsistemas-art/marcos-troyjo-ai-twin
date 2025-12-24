import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, Search, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function KeyActorManager({ lang = 'pt' }) {
    const [actors, setActors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingActor, setEditingActor] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'government',
        country: '',
        acronym: '',
        full_name: '',
        description: '',
        role: '',
        areas_of_influence: [],
        strategic_importance: 'medium',
        active: true
    });

    const t = {
        pt: {
            title: 'Atores Chave',
            subtitle: 'Gerenciar instituições e atores estratégicos',
            create: 'Adicionar Ator',
            edit: 'Editar',
            delete: 'Excluir',
            save: 'Salvar',
            cancel: 'Cancelar',
            search: 'Buscar atores...',
            name: 'Nome',
            type: 'Tipo',
            country: 'País',
            acronym: 'Sigla',
            fullName: 'Nome Completo',
            description: 'Descrição',
            role: 'Papel/Função',
            areas: 'Áreas de Influência',
            importance: 'Importância Estratégica',
            deleteConfirm: 'Tem certeza que deseja excluir este ator?'
        },
        en: {
            title: 'Key Actors',
            subtitle: 'Manage institutions and strategic actors',
            create: 'Add Actor',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            search: 'Search actors...',
            name: 'Name',
            type: 'Type',
            country: 'Country',
            acronym: 'Acronym',
            fullName: 'Full Name',
            description: 'Description',
            role: 'Role/Function',
            areas: 'Areas of Influence',
            importance: 'Strategic Importance',
            deleteConfirm: 'Are you sure you want to delete this actor?'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadActors();
    }, []);

    const loadActors = async () => {
        setIsLoading(true);
        try {
            const data = await base44.entities.KeyActor.filter({ active: true }, '-created_date');
            setActors(data || []);
        } catch (error) {
            console.error('Error loading actors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingActor) {
                await base44.entities.KeyActor.update(editingActor.id, formData);
                toast.success(lang === 'pt' ? 'Ator atualizado!' : 'Actor updated!');
            } else {
                await base44.entities.KeyActor.create(formData);
                toast.success(lang === 'pt' ? 'Ator criado!' : 'Actor created!');
            }
            setDialogOpen(false);
            resetForm();
            loadActors();
        } catch (error) {
            console.error('Error saving actor:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar ator' : 'Error saving actor');
        }
    };

    const handleDelete = async (actorId) => {
        if (!confirm(text.deleteConfirm)) return;
        try {
            await base44.entities.KeyActor.update(actorId, { active: false });
            toast.success(lang === 'pt' ? 'Ator excluído!' : 'Actor deleted!');
            loadActors();
        } catch (error) {
            console.error('Error deleting actor:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir ator' : 'Error deleting actor');
        }
    };

    const handleEdit = (actor) => {
        setEditingActor(actor);
        setFormData({
            name: actor.name || '',
            type: actor.type || 'government',
            country: actor.country || '',
            acronym: actor.acronym || '',
            full_name: actor.full_name || '',
            description: actor.description || '',
            role: actor.role || '',
            areas_of_influence: actor.areas_of_influence || [],
            strategic_importance: actor.strategic_importance || 'medium',
            active: actor.active !== false
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingActor(null);
        setFormData({
            name: '',
            type: 'government',
            country: '',
            acronym: '',
            full_name: '',
            description: '',
            role: '',
            areas_of_influence: [],
            strategic_importance: 'medium',
            active: true
        });
    };

    const filteredActors = actors.filter(actor =>
        actor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        actor.acronym?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const importanceColors = {
        critical: 'bg-red-100 text-red-800 border-red-300',
        high: 'bg-orange-100 text-orange-800 border-orange-300',
        medium: 'bg-blue-100 text-blue-800 border-blue-300',
        low: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Users className="w-5 h-5" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.subtitle}</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                                <Plus className="w-4 h-4" />
                                {text.create}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingActor ? text.edit : text.create}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{text.acronym}</Label>
                                        <Input
                                            value={formData.acronym}
                                            onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                                            placeholder="MCTI"
                                        />
                                    </div>
                                    <div>
                                        <Label>{text.name}</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="MCTI"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>{text.fullName}</Label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Ministério da Ciência, Tecnologia e Inovação"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{text.type}</Label>
                                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="government">Government</SelectItem>
                                                <SelectItem value="ministry">Ministry</SelectItem>
                                                <SelectItem value="agency">Agency</SelectItem>
                                                <SelectItem value="legislature">Legislature</SelectItem>
                                                <SelectItem value="international_org">International Org</SelectItem>
                                                <SelectItem value="private_sector">Private Sector</SelectItem>
                                                <SelectItem value="ngo">NGO</SelectItem>
                                                <SelectItem value="academic">Academic</SelectItem>
                                                <SelectItem value="individual">Individual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>{text.country}</Label>
                                        <Input
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            placeholder="Brasil"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>{text.role}</Label>
                                    <Input
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        placeholder="Formulação de política de C&T"
                                    />
                                </div>
                                <div>
                                    <Label>{text.description}</Label>
                                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                                </div>
                                <div>
                                    <Label>{text.importance}</Label>
                                    <Select value={formData.strategic_importance} onValueChange={(value) => setFormData({ ...formData, strategic_importance: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="critical">Critical</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>{text.cancel}</Button>
                                    <Button onClick={handleSave} disabled={!formData.name} className="bg-[#002D62]">{text.save}</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={text.search} className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredActors.map((actor) => (
                        <div key={actor.id} className="p-4 rounded-lg border hover:border-[#002D62]/30 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-[#002D62]">{actor.acronym || actor.name}</h4>
                                        <Badge variant="outline">{actor.type}</Badge>
                                        {actor.strategic_importance && (
                                            <Badge className={importanceColors[actor.strategic_importance]}>
                                                <Star className="w-3 h-3 mr-1" />
                                                {actor.strategic_importance}
                                            </Badge>
                                        )}
                                    </div>
                                    {actor.full_name && (
                                        <p className="text-sm text-gray-600 mb-1">{actor.full_name}</p>
                                    )}
                                    {actor.role && (
                                        <p className="text-sm text-gray-500">{actor.role}</p>
                                    )}
                                    {actor.country && (
                                        <p className="text-xs text-gray-400 mt-1">🌍 {actor.country}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(actor)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(actor.id)} className="text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}