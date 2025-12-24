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
import { Plus, Edit, Trash2, Globe, Users, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ForumManager({ lang = 'pt' }) {
    const [forums, setForums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingForum, setEditingForum] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        full_name: '',
        acronym: '',
        description: '',
        type: 'multilateral',
        members: [],
        established_year: null,
        headquarters: '',
        website: '',
        key_themes: [],
        significance: '',
        active: true
    });

    const t = {
        pt: {
            title: 'Fóruns',
            subtitle: 'Gerenciar fóruns multilaterais e instituições',
            create: 'Adicionar Fórum',
            edit: 'Editar',
            delete: 'Excluir',
            save: 'Salvar',
            cancel: 'Cancelar',
            search: 'Buscar fóruns...',
            name: 'Nome',
            fullName: 'Nome Completo',
            acronym: 'Sigla',
            description: 'Descrição',
            type: 'Tipo',
            members: 'Membros',
            established: 'Ano de Criação',
            headquarters: 'Sede',
            website: 'Website',
            themes: 'Temas Principais',
            significance: 'Importância Estratégica',
            deleteConfirm: 'Tem certeza que deseja excluir este fórum?'
        },
        en: {
            title: 'Forums',
            subtitle: 'Manage multilateral forums and institutions',
            create: 'Add Forum',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            search: 'Search forums...',
            name: 'Name',
            fullName: 'Full Name',
            acronym: 'Acronym',
            description: 'Description',
            type: 'Type',
            members: 'Members',
            established: 'Established Year',
            headquarters: 'Headquarters',
            website: 'Website',
            themes: 'Key Themes',
            significance: 'Strategic Significance',
            deleteConfirm: 'Are you sure you want to delete this forum?'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadForums();
    }, []);

    const loadForums = async () => {
        setIsLoading(true);
        try {
            const data = await base44.entities.Forum.filter({ active: true }, '-created_date');
            setForums(data || []);
        } catch (error) {
            console.error('Error loading forums:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingForum) {
                await base44.entities.Forum.update(editingForum.id, formData);
                toast.success(lang === 'pt' ? 'Fórum atualizado!' : 'Forum updated!');
            } else {
                await base44.entities.Forum.create(formData);
                toast.success(lang === 'pt' ? 'Fórum criado!' : 'Forum created!');
            }
            setDialogOpen(false);
            resetForm();
            loadForums();
        } catch (error) {
            console.error('Error saving forum:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar fórum' : 'Error saving forum');
        }
    };

    const handleDelete = async (forumId) => {
        if (!confirm(text.deleteConfirm)) return;
        try {
            await base44.entities.Forum.update(forumId, { active: false });
            toast.success(lang === 'pt' ? 'Fórum excluído!' : 'Forum deleted!');
            loadForums();
        } catch (error) {
            console.error('Error deleting forum:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir fórum' : 'Error deleting forum');
        }
    };

    const handleEdit = (forum) => {
        setEditingForum(forum);
        setFormData({
            name: forum.name || '',
            full_name: forum.full_name || '',
            acronym: forum.acronym || '',
            description: forum.description || '',
            type: forum.type || 'multilateral',
            members: forum.members || [],
            established_year: forum.established_year || null,
            headquarters: forum.headquarters || '',
            website: forum.website || '',
            key_themes: forum.key_themes || [],
            significance: forum.significance || '',
            active: forum.active !== false
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingForum(null);
        setFormData({
            name: '',
            full_name: '',
            acronym: '',
            description: '',
            type: 'multilateral',
            members: [],
            established_year: null,
            headquarters: '',
            website: '',
            key_themes: [],
            significance: '',
            active: true
        });
    };

    const filteredForums = forums.filter(forum =>
        forum.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        forum.acronym?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Globe className="w-5 h-5" />
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
                                <DialogTitle>{editingForum ? text.edit : text.create}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{text.acronym}</Label>
                                        <Input
                                            value={formData.acronym}
                                            onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                                            placeholder="G20"
                                        />
                                    </div>
                                    <div>
                                        <Label>{text.name}</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Group of Twenty"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>{text.fullName}</Label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>{text.type}</Label>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="multilateral">Multilateral</SelectItem>
                                            <SelectItem value="bilateral">Bilateral</SelectItem>
                                            <SelectItem value="regional">Regional</SelectItem>
                                            <SelectItem value="thematic">Temático</SelectItem>
                                            <SelectItem value="academic">Acadêmico</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>{text.description}</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{text.established}</Label>
                                        <Input
                                            type="number"
                                            value={formData.established_year || ''}
                                            onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) || null })}
                                        />
                                    </div>
                                    <div>
                                        <Label>{text.headquarters}</Label>
                                        <Input
                                            value={formData.headquarters}
                                            onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>{text.website}</Label>
                                    <Input
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://"
                                    />
                                </div>
                                <div>
                                    <Label>{text.significance}</Label>
                                    <Textarea
                                        value={formData.significance}
                                        onChange={(e) => setFormData({ ...formData, significance: e.target.value })}
                                        rows={2}
                                    />
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
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={text.search}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredForums.map((forum) => (
                        <div key={forum.id} className="p-4 rounded-lg border hover:border-[#002D62]/30 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-[#002D62]">{forum.acronym || forum.name}</h4>
                                        <Badge variant="outline">{forum.type}</Badge>
                                        {forum.established_year && (
                                            <Badge variant="secondary" className="gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {forum.established_year}
                                            </Badge>
                                        )}
                                    </div>
                                    {forum.full_name && (
                                        <p className="text-sm text-gray-600 mb-1">{forum.full_name}</p>
                                    )}
                                    {forum.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">{forum.description}</p>
                                    )}
                                    {forum.headquarters && (
                                        <p className="text-xs text-gray-400 mt-1">📍 {forum.headquarters}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(forum)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(forum.id)} className="text-red-600">
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