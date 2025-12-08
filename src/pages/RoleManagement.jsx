import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Shield, Users, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/components/rbac/PermissionGate';

const ROLE_TYPES = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
    executive: { label: 'Executive', color: 'bg-blue-100 text-blue-800' },
    analyst: { label: 'Analyst', color: 'bg-green-100 text-green-800' },
    guest: { label: 'Guest', color: 'bg-gray-100 text-gray-800' }
};

export default function RoleManagement() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [newUserEmail, setNewUserEmail] = useState('');
    const { can, roleType } = usePermissions();

    const t = {
        pt: {
            title: 'Gerenciamento de Papéis',
            description: 'Controle de acesso e permissões',
            back: 'Voltar',
            users: 'Usuários',
            addUser: 'Adicionar Usuário',
            email: 'Email',
            role: 'Papel',
            permissions: 'Permissões',
            specialPrivileges: 'Privilégios Especiais',
            save: 'Salvar',
            delete: 'Remover',
            unauthorized: 'Você não tem permissão para acessar esta página',
            loading: 'Carregando...'
        },
        en: {
            title: 'Role Management',
            description: 'Access control and permissions',
            back: 'Back',
            users: 'Users',
            addUser: 'Add User',
            email: 'Email',
            role: 'Role',
            permissions: 'Permissions',
            specialPrivileges: 'Special Privileges',
            save: 'Save',
            delete: 'Delete',
            unauthorized: 'You do not have permission to access this page',
            loading: 'Loading...'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadRoles();
        loadUsers();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.Role.filter({});
            setRoles(data);
        } catch (error) {
            console.error('Error loading roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await base44.entities.User.list();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const createRole = async () => {
        if (!newUserEmail) return;
        
        try {
            await base44.entities.Role.create({
                user_email: newUserEmail,
                role_type: 'guest',
                is_active: true
            });
            setNewUserEmail('');
            loadRoles();
            toast.success(lang === 'pt' ? 'Papel criado com sucesso' : 'Role created successfully');
        } catch (error) {
            console.error('Error creating role:', error);
            toast.error(lang === 'pt' ? 'Erro ao criar papel' : 'Error creating role');
        }
    };

    const updateRole = async (roleId, updates) => {
        try {
            await base44.entities.Role.update(roleId, updates);
            loadRoles();
            toast.success(lang === 'pt' ? 'Papel atualizado' : 'Role updated');
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error(lang === 'pt' ? 'Erro ao atualizar' : 'Error updating');
        }
    };

    const deleteRole = async (roleId) => {
        if (!confirm(lang === 'pt' ? 'Tem certeza?' : 'Are you sure?')) return;
        
        try {
            await base44.entities.Role.delete(roleId);
            loadRoles();
            toast.success(lang === 'pt' ? 'Papel removido' : 'Role deleted');
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error(lang === 'pt' ? 'Erro ao remover' : 'Error deleting');
        }
    };

    if (!can || !can('users', 'manage_roles')) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-[#333F48]">{text.unauthorized}</p>
                        <Link to={createPageUrl('Dashboard')}>
                            <Button className="mt-4">{text.back}</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {text.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{text.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{text.description}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            {text.addUser}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <Input
                                placeholder={text.email}
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={createRole}>
                                <Plus className="w-4 h-4 mr-2" />
                                {text.addUser}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {roles.map((role) => (
                        <Card key={role.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                            <span className="text-white text-xs font-semibold">
                                                {role.user_email.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#333F48]">{role.user_email}</p>
                                            <Badge className={ROLE_TYPES[role.role_type].color}>
                                                {ROLE_TYPES[role.role_type].label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteRole(role.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label>{text.role}</Label>
                                        <Select
                                            value={role.role_type}
                                            onValueChange={(value) => updateRole(role.id, { role_type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(ROLE_TYPES).map(key => (
                                                    <SelectItem key={key} value={key}>
                                                        {ROLE_TYPES[key].label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="mb-2 block">{text.specialPrivileges}</Label>
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={role.special_privileges?.includes('troyjo_revision')}
                                                onCheckedChange={(checked) => {
                                                    const privileges = role.special_privileges || [];
                                                    const updated = checked
                                                        ? [...privileges, 'troyjo_revision']
                                                        : privileges.filter(p => p !== 'troyjo_revision');
                                                    updateRole(role.id, { special_privileges: updated });
                                                }}
                                            />
                                            <span className="text-sm">Troyjo Revision Authority</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}