import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Users, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantManager({ lang = 'pt' }) {
    const [thoughtLeaders, setThoughtLeaders] = useState([]);
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTL, setEditingTL] = useState(null);
    const [formData, setFormData] = useState({});

    const t = {
        pt: {
            title: 'Gestão Multitenant',
            description: 'Gerencie thought leaders e organizações',
            thoughtLeaders: 'Thought Leaders',
            organizations: 'Organizações',
            addNew: 'Adicionar Novo',
            edit: 'Editar',
            delete: 'Excluir',
            save: 'Salvar',
            cancel: 'Cancelar',
            name: 'Nome',
            slug: 'Slug',
            agent: 'Agente AI',
            active: 'Ativo',
            inactive: 'Inativo'
        },
        en: {
            title: 'Multitenant Management',
            description: 'Manage thought leaders and organizations',
            thoughtLeaders: 'Thought Leaders',
            organizations: 'Organizations',
            addNew: 'Add New',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            name: 'Name',
            slug: 'Slug',
            agent: 'AI Agent',
            active: 'Active',
            inactive: 'Inactive'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tls, orgs] = await Promise.all([
                base44.entities.ThoughtLeader.list('-created_date'),
                base44.entities.Organization.list('-created_date')
            ]);
            setThoughtLeaders(tls || []);
            setOrganizations(orgs || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingTL) {
                await base44.entities.ThoughtLeader.update(editingTL.id, formData);
                toast.success(lang === 'pt' ? 'Atualizado com sucesso' : 'Updated successfully');
            } else {
                await base44.entities.ThoughtLeader.create(formData);
                toast.success(lang === 'pt' ? 'Criado com sucesso' : 'Created successfully');
            }
            setDialogOpen(false);
            setEditingTL(null);
            setFormData({});
            loadData();
        } catch (error) {
            console.error('Error saving:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Tem certeza?' : 'Are you sure?')) return;
        
        try {
            await base44.entities.ThoughtLeader.delete(id);
            toast.success(lang === 'pt' ? 'Excluído com sucesso' : 'Deleted successfully');
            loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {text.title}
                </CardTitle>
                <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="thoughtleaders">
                    <TabsList>
                        <TabsTrigger value="thoughtleaders">{text.thoughtLeaders}</TabsTrigger>
                        <TabsTrigger value="organizations">{text.organizations}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="thoughtleaders" className="space-y-4 mt-4">
                        <div className="flex justify-end">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => {
                                        setEditingTL(null);
                                        setFormData({});
                                    }}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        {text.addNew}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingTL ? text.edit : text.addNew} Thought Leader
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>{text.name}</Label>
                                            <Input
                                                value={formData.name || ''}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>{text.slug}</Label>
                                            <Input
                                                value={formData.slug || ''}
                                                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>{text.agent}</Label>
                                            <Input
                                                value={formData.agent_name || ''}
                                                onChange={(e) => setFormData({...formData, agent_name: e.target.value})}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={handleSave}>{text.save}</Button>
                                            <Button variant="outline" onClick={() => setDialogOpen(false)}>{text.cancel}</Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="space-y-2">
                            {thoughtLeaders.map(tl => (
                                <div key={tl.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h3 className="font-semibold">{tl.name}</h3>
                                        <p className="text-sm text-gray-600">{tl.slug} • {tl.agent_name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={tl.active ? 'default' : 'secondary'}>
                                            {tl.active ? text.active : text.inactive}
                                        </Badge>
                                        <Button size="sm" variant="ghost" onClick={() => {
                                            setEditingTL(tl);
                                            setFormData(tl);
                                            setDialogOpen(true);
                                        }}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(tl.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="organizations">
                        <div className="text-center py-8 text-gray-500">
                            {lang === 'pt' ? 'Em desenvolvimento' : 'In development'}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}