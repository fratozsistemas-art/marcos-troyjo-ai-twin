import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PermissionGate from '@/components/rbac/PermissionGate';

const ROLE_PRESETS = {
    admin: {
        label: 'Admin',
        color: 'bg-red-600',
        permissions: {
            ssot: { manage_sources: true, add_facts: true, edit_facts: true, delete_facts: true, verify_facts: true, view_facts: true, sync_data: true, export_data: true, access_chatbot: true },
            articles: { create: true, read: true, update: true, delete: true, publish: true, revise: true },
            alerts: { configure: true, view: true },
            users: { invite: true, manage_roles: true, view_all: true },
            analytics: { view_basic: true, view_detailed: true, export: true }
        }
    },
    data_manager: {
        label: 'Data Manager',
        color: 'bg-blue-600',
        permissions: {
            ssot: { manage_sources: true, add_facts: true, edit_facts: true, delete_facts: false, verify_facts: true, view_facts: true, sync_data: true, export_data: true, access_chatbot: true },
            articles: { create: false, read: true, update: false, delete: false, publish: false, revise: false },
            alerts: { configure: true, view: true },
            users: { invite: false, manage_roles: false, view_all: false },
            analytics: { view_basic: true, view_detailed: true, export: true }
        }
    },
    analyst: {
        label: 'Analyst',
        color: 'bg-purple-600',
        permissions: {
            ssot: { manage_sources: false, add_facts: false, edit_facts: false, delete_facts: false, verify_facts: false, view_facts: true, sync_data: false, export_data: true, access_chatbot: true },
            articles: { create: false, read: true, update: false, delete: false, publish: false, revise: false },
            alerts: { configure: true, view: true },
            users: { invite: false, manage_roles: false, view_all: false },
            analytics: { view_basic: true, view_detailed: true, export: true }
        }
    },
    viewer: {
        label: 'Viewer',
        color: 'bg-gray-600',
        permissions: {
            ssot: { manage_sources: false, add_facts: false, edit_facts: false, delete_facts: false, verify_facts: false, view_facts: true, sync_data: false, export_data: false, access_chatbot: false },
            articles: { create: false, read: true, update: false, delete: false, publish: false, revise: false },
            alerts: { configure: false, view: true },
            users: { invite: false, manage_roles: false, view_all: false },
            analytics: { view_basic: true, view_detailed: false, export: false }
        }
    },
    co_author: {
        label: 'Co-Author',
        color: 'bg-green-600',
        permissions: {
            ssot: { manage_sources: false, add_facts: true, edit_facts: true, delete_facts: false, verify_facts: false, view_facts: true, sync_data: false, export_data: true, access_chatbot: true },
            articles: { create: true, read: true, update: true, delete: false, publish: false, revise: false },
            alerts: { configure: true, view: true },
            users: { invite: false, manage_roles: false, view_all: false },
            analytics: { view_basic: true, view_detailed: false, export: false }
        }
    },
    curator: {
        label: 'Curator',
        color: 'bg-yellow-600',
        permissions: {
            ssot: { manage_sources: false, add_facts: false, edit_facts: false, delete_facts: false, verify_facts: true, view_facts: true, sync_data: false, export_data: true, access_chatbot: true },
            articles: { create: false, read: true, update: true, delete: false, publish: false, revise: true },
            alerts: { configure: false, view: true },
            users: { invite: false, manage_roles: false, view_all: false },
            analytics: { view_basic: true, view_detailed: true, export: false }
        }
    }
};

export default function RoleManagement() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('viewer');

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.Role.list();
            setRoles(data);
        } catch (error) {
            console.error('Error loading roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = async () => {
        if (!newUserEmail.trim()) {
            toast.error('Digite um email válido');
            return;
        }

        try {
            await base44.entities.Role.create({
                user_email: newUserEmail.trim(),
                role_type: selectedRole,
                permissions: ROLE_PRESETS[selectedRole].permissions,
                is_active: true
            });

            toast.success('Papel atribuído com sucesso!');
            setNewUserEmail('');
            setSelectedRole('viewer');
            loadRoles();
        } catch (error) {
            console.error('Error adding role:', error);
            toast.error('Erro ao atribuir papel');
        }
    };

    const handleUpdateRole = async (roleId, newRoleType) => {
        try {
            await base44.entities.Role.update(roleId, {
                role_type: newRoleType,
                permissions: ROLE_PRESETS[newRoleType].permissions
            });

            toast.success('Papel atualizado!');
            loadRoles();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Erro ao atualizar');
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!confirm('Confirmar remoção de papel?')) return;

        try {
            await base44.entities.Role.delete(roleId);
            toast.success('Papel removido!');
            loadRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error('Erro ao remover');
        }
    };

    return (
        <PermissionGate 
            permission="users.manage_roles"
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <Card className="max-w-md">
                        <CardContent className="pt-6 text-center">
                            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
                            <p className="text-gray-600">Você não tem permissão para gerenciar papéis.</p>
                        </CardContent>
                    </Card>
                </div>
            }
        >
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                <Shield className="w-6 h-6" />
                                Gerenciamento de Papéis & Permissões
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Add New Role */}
                            <div className="border rounded-lg p-4 bg-blue-50">
                                <h3 className="font-semibold text-[#002D62] mb-4">Atribuir Novo Papel</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <Label>Email do Usuário</Label>
                                        <Input
                                            type="email"
                                            value={newUserEmail}
                                            onChange={(e) => setNewUserEmail(e.target.value)}
                                            placeholder="usuario@exemplo.com"
                                        />
                                    </div>
                                    <div>
                                        <Label>Papel</Label>
                                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(ROLE_PRESETS).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {value.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button onClick={handleAddRole} className="mt-4">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar
                                </Button>
                            </div>

                            {/* Roles List */}
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {roles.map((role) => (
                                        <div key={role.id} className="border rounded-lg p-4 bg-white">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Users className="w-5 h-5 text-gray-600" />
                                                        <span className="font-semibold text-gray-800">{role.user_email}</span>
                                                        <Badge className={ROLE_PRESETS[role.role_type]?.color || 'bg-gray-600'}>
                                                            {ROLE_PRESETS[role.role_type]?.label || role.role_type}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 ml-8">
                                                        {role.permissions?.ssot?.manage_sources && (
                                                            <Badge variant="outline" className="text-xs">Gerenciar Fontes</Badge>
                                                        )}
                                                        {role.permissions?.ssot?.verify_facts && (
                                                            <Badge variant="outline" className="text-xs">Verificar Fatos</Badge>
                                                        )}
                                                        {role.permissions?.articles?.publish && (
                                                            <Badge variant="outline" className="text-xs">Publicar Artigos</Badge>
                                                        )}
                                                        {role.permissions?.users?.manage_roles && (
                                                            <Badge variant="outline" className="text-xs">Gerenciar Usuários</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={role.role_type}
                                                        onValueChange={(val) => handleUpdateRole(role.id, val)}
                                                    >
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.entries(ROLE_PRESETS).map(([key, value]) => (
                                                                <SelectItem key={key} value={key}>
                                                                    {value.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteRole(role.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Permission Matrix */}
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <h3 className="font-semibold text-[#002D62] mb-4">Matriz de Permissões</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-2 px-2">Papel</th>
                                                <th className="text-center py-2 px-2">Gerenciar Fontes</th>
                                                <th className="text-center py-2 px-2">Verificar Fatos</th>
                                                <th className="text-center py-2 px-2">Publicar Artigos</th>
                                                <th className="text-center py-2 px-2">Chatbot SSOT</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                                                <tr key={key} className="border-b">
                                                    <td className="py-2 px-2">
                                                        <Badge className={preset.color}>{preset.label}</Badge>
                                                    </td>
                                                    <td className="text-center py-2 px-2">
                                                        {preset.permissions.ssot.manage_sources ? '✓' : '✗'}
                                                    </td>
                                                    <td className="text-center py-2 px-2">
                                                        {preset.permissions.ssot.verify_facts ? '✓' : '✗'}
                                                    </td>
                                                    <td className="text-center py-2 px-2">
                                                        {preset.permissions.articles.publish ? '✓' : '✗'}
                                                    </td>
                                                    <td className="text-center py-2 px-2">
                                                        {preset.permissions.ssot.access_chatbot ? '✓' : '✗'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PermissionGate>
    );
}