import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Plus, Edit2, Trash2, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RoleManager({ lang = 'pt' }) {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingRole, setEditingRole] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const t = {
        pt: {
            title: 'Gerenciamento de Funções',
            description: 'Defina funções e permissões para o sistema',
            addRole: 'Adicionar Função',
            editRole: 'Editar Função',
            roleName: 'Nome da Função',
            displayName: 'Nome de Exibição',
            description: 'Descrição',
            permissions: 'Permissões',
            active: 'Ativa',
            save: 'Salvar',
            delete: 'Excluir',
            deleteConfirm: 'Tem certeza que deseja excluir esta função?',
            saved: 'Função salva com sucesso',
            deleted: 'Função excluída com sucesso',
            initDefault: 'Inicializar Funções Padrão',
            initialized: 'Funções padrão criadas'
        },
        en: {
            title: 'Role Management',
            description: 'Define roles and permissions for the system',
            addRole: 'Add Role',
            editRole: 'Edit Role',
            roleName: 'Role Name',
            displayName: 'Display Name',
            description: 'Description',
            permissions: 'Permissions',
            active: 'Active',
            save: 'Save',
            delete: 'Delete',
            deleteConfirm: 'Are you sure you want to delete this role?',
            saved: 'Role saved successfully',
            deleted: 'Role deleted successfully',
            initDefault: 'Initialize Default Roles',
            initialized: 'Default roles created'
        }
    };

    const text = t[lang];

    const permissionLabels = {
        read_facts: lang === 'pt' ? 'Ler Fatos' : 'Read Facts',
        create_facts: lang === 'pt' ? 'Criar Fatos' : 'Create Facts',
        update_facts: lang === 'pt' ? 'Atualizar Fatos' : 'Update Facts',
        delete_facts: lang === 'pt' ? 'Excluir Fatos' : 'Delete Facts',
        validate_facts: lang === 'pt' ? 'Validar Fatos' : 'Validate Facts',
        approve_facts: lang === 'pt' ? 'Aprovar Fatos' : 'Approve Facts',
        reject_facts: lang === 'pt' ? 'Rejeitar Fatos' : 'Reject Facts',
        view_history: lang === 'pt' ? 'Ver Histórico' : 'View History',
        revert_versions: lang === 'pt' ? 'Reverter Versões' : 'Revert Versions',
        link_facts: lang === 'pt' ? 'Vincular Fatos' : 'Link Facts',
        manage_users: lang === 'pt' ? 'Gerenciar Usuários' : 'Manage Users',
        manage_roles: lang === 'pt' ? 'Gerenciar Funções' : 'Manage Roles',
        access_analytics: lang === 'pt' ? 'Acessar Analytics' : 'Access Analytics'
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const allRoles = await base44.entities.FactRole.list();
            setRoles(allRoles);
        } catch (error) {
            console.error('Error loading roles:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar funções' : 'Error loading roles');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitializeDefaults = async () => {
        try {
            await base44.functions.invoke('initializeDefaultRoles');
            toast.success(text.initialized);
            loadRoles();
        } catch (error) {
            console.error('Error initializing roles:', error);
            toast.error(lang === 'pt' ? 'Erro ao inicializar' : 'Error initializing');
        }
    };

    const handleSave = async (roleData) => {
        try {
            if (editingRole?.id) {
                await base44.entities.FactRole.update(editingRole.id, roleData);
            } else {
                await base44.entities.FactRole.create(roleData);
            }
            toast.success(text.saved);
            loadRoles();
            setDialogOpen(false);
            setEditingRole(null);
        } catch (error) {
            console.error('Error saving role:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        }
    };

    const handleDelete = async (roleId) => {
        if (!confirm(text.deleteConfirm)) return;
        try {
            await base44.entities.FactRole.delete(roleId);
            toast.success(text.deleted);
            loadRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const RoleForm = ({ role, onSave, onCancel }) => {
        const [formData, setFormData] = useState(role || {
            role_name: '',
            display_name: '',
            description: '',
            permissions: {},
            active: true
        });

        const togglePermission = (perm) => {
            setFormData(prev => ({
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [perm]: !prev.permissions[perm]
                }
            }));
        };

        return (
            <div className="space-y-4">
                <div>
                    <Label>{text.roleName}</Label>
                    <Input
                        value={formData.role_name}
                        onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                        placeholder="viewer"
                    />
                </div>
                <div>
                    <Label>{text.displayName}</Label>
                    <Input
                        value={formData.display_name}
                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                        placeholder="Viewer"
                    />
                </div>
                <div>
                    <Label>{text.description}</Label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div>
                    <Label className="mb-3 block">{text.permissions}</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.keys(permissionLabels).map(perm => (
                            <div key={perm} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">{permissionLabels[perm]}</span>
                                <Switch
                                    checked={formData.permissions[perm] || false}
                                    onCheckedChange={() => togglePermission(perm)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <Label>{text.active}</Label>
                    <Switch
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={() => onSave(formData)}>
                        <Save className="w-4 h-4 mr-2" />
                        {text.save}
                    </Button>
                </div>
            </div>
        );
    };

    if (isLoading) {
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
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#002D62]" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {roles.length === 0 && (
                            <Button variant="outline" onClick={handleInitializeDefaults}>
                                {text.initDefault}
                            </Button>
                        )}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setEditingRole(null)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {text.addRole}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh]">
                                <DialogHeader>
                                    <DialogTitle>{editingRole ? text.editRole : text.addRole}</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[calc(80vh-120px)]">
                                    <RoleForm
                                        role={editingRole}
                                        onSave={handleSave}
                                        onCancel={() => {
                                            setDialogOpen(false);
                                            setEditingRole(null);
                                        }}
                                    />
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <div className="space-y-3">
                        <AnimatePresence>
                            {roles.map(role => (
                                <motion.div
                                    key={role.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 border rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-[#002D62]">{role.display_name}</h4>
                                                <Badge variant="outline">{role.role_name}</Badge>
                                                {!role.active && <Badge variant="secondary">Inactive</Badge>}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(role.permissions || {})
                                                    .filter(([_, value]) => value)
                                                    .map(([perm]) => (
                                                        <Badge key={perm} variant="secondary" className="text-xs">
                                                            {permissionLabels[perm] || perm}
                                                        </Badge>
                                                    ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingRole(role);
                                                    setDialogOpen(true);
                                                }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(role.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}