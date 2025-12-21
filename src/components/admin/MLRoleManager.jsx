import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Users, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Gerenciamento de Papéis ML',
        description: 'Configure permissões para recursos de ML',
        createRole: 'Criar Papel',
        roleName: 'Nome do Papel',
        description: 'Descrição',
        users: 'Usuários',
        addUser: 'Adicionar Usuário',
        permissions: 'Permissões',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        active: 'Ativo',
        inactive: 'Inativo'
    },
    en: {
        title: 'ML Role Management',
        description: 'Configure permissions for ML resources',
        createRole: 'Create Role',
        roleName: 'Role Name',
        description: 'Description',
        users: 'Users',
        addUser: 'Add User',
        permissions: 'Permissions',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        active: 'Active',
        inactive: 'Inactive'
    }
};

const defaultPermissions = {
    experiments: { view: false, create: false, delete: false },
    runs: { view: false, compare: false, delete: false },
    pipelines: { view: false, trigger: false, cancel: false, retry: false },
    models: { view: false, register: false, deploy: false, delete: false },
    sites: { view: false, create: false, configure: false, delete: false, backup: false },
    git: { connect: false, disconnect: false, configure: false },
    audit_logs: { view: false, export: false }
};

export default function MLRoleManager({ lang = 'pt' }) {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        role_name: '',
        description: '',
        user_emails: [],
        permissions: defaultPermissions,
        is_active: true
    });
    const [newUserEmail, setNewUserEmail] = useState('');
    const t = translations[lang];

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.MLPermission.list('-created_date');
            setRoles(data);
        } catch (error) {
            console.error('Error loading roles:', error);
            toast.error('Erro ao carregar papéis');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingRole) {
                await base44.entities.MLPermission.update(editingRole.id, formData);
                toast.success('Papel atualizado!');
            } else {
                await base44.entities.MLPermission.create(formData);
                toast.success('Papel criado!');
            }
            setDialogOpen(false);
            resetForm();
            loadRoles();
        } catch (error) {
            console.error('Error saving role:', error);
            toast.error('Erro ao salvar papel');
        }
    };

    const handleDelete = async (roleId) => {
        if (!confirm('Tem certeza que deseja excluir este papel?')) return;
        
        try {
            await base44.entities.MLPermission.delete(roleId);
            toast.success('Papel excluído!');
            loadRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error('Erro ao excluir papel');
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            role_name: role.role_name,
            description: role.description || '',
            user_emails: role.user_emails || [],
            permissions: role.permissions || defaultPermissions,
            is_active: role.is_active
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingRole(null);
        setFormData({
            role_name: '',
            description: '',
            user_emails: [],
            permissions: defaultPermissions,
            is_active: true
        });
        setNewUserEmail('');
    };

    const handleAddUser = () => {
        if (newUserEmail && !formData.user_emails.includes(newUserEmail)) {
            setFormData({
                ...formData,
                user_emails: [...formData.user_emails, newUserEmail]
            });
            setNewUserEmail('');
        }
    };

    const handleRemoveUser = (email) => {
        setFormData({
            ...formData,
            user_emails: formData.user_emails.filter(e => e !== email)
        });
    };

    const handlePermissionChange = (resource, action, value) => {
        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [resource]: {
                    ...formData.permissions[resource],
                    [action]: value
                }
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Shield className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#002D62]">
                                <Plus className="w-4 h-4 mr-2" />
                                {t.createRole}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>{editingRole ? 'Editar Papel' : t.createRole}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] pr-4">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>{t.roleName}</Label>
                                        <Input
                                            value={formData.role_name}
                                            onChange={(e) => setFormData({...formData, role_name: e.target.value})}
                                            disabled={!!editingRole}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t.description}</Label>
                                        <Input
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t.users}</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={newUserEmail}
                                                onChange={(e) => setNewUserEmail(e.target.value)}
                                                placeholder="user@example.com"
                                            />
                                            <Button onClick={handleAddUser} variant="outline">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.user_emails.map(email => (
                                                <Badge key={email} variant="secondary" className="flex items-center gap-1">
                                                    {email}
                                                    <button onClick={() => handleRemoveUser(email)} className="ml-1">×</button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold">{t.permissions}</Label>
                                        {Object.entries(formData.permissions).map(([resource, actions]) => (
                                            <div key={resource} className="border rounded-lg p-4 space-y-3">
                                                <h4 className="font-semibold capitalize">{resource}</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {Object.entries(actions).map(([action, value]) => (
                                                        <div key={action} className="flex items-center justify-between">
                                                            <Label className="text-sm capitalize">{action}</Label>
                                                            <Switch
                                                                checked={value}
                                                                onCheckedChange={(checked) => handlePermissionChange(resource, action, checked)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>Status</Label>
                                        <Switch
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                                        />
                                    </div>
                                </div>
                            </ScrollArea>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleSave} className="bg-[#002D62]">
                                    {t.save}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {roles.map(role => (
                            <div key={role.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold">{role.role_name}</h4>
                                            <Badge variant={role.is_active ? 'default' : 'secondary'}>
                                                {role.is_active ? t.active : t.inactive}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Users className="w-4 h-4" />
                                            {role.user_emails?.length || 0} usuários
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(role.id)} className="text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}