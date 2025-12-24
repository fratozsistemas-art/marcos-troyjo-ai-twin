import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Trash2, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { toast } from 'sonner';

export default function UserRoleManager({ lang = 'pt' }) {
    const [assignments, setAssignments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const t = {
        pt: {
            title: 'Atribuição de Funções',
            description: 'Gerencie funções de usuários',
            assignRole: 'Atribuir Função',
            user: 'Usuário',
            role: 'Função',
            reason: 'Motivo',
            expiresAt: 'Expira em (opcional)',
            assign: 'Atribuir',
            remove: 'Remover',
            removeConfirm: 'Tem certeza que deseja remover esta atribuição?',
            assigned: 'Função atribuída com sucesso',
            removed: 'Atribuição removida com sucesso',
            assignedBy: 'Atribuído por',
            expires: 'Expira'
        },
        en: {
            title: 'Role Assignments',
            description: 'Manage user roles',
            assignRole: 'Assign Role',
            user: 'User',
            role: 'Role',
            reason: 'Reason',
            expiresAt: 'Expires at (optional)',
            assign: 'Assign',
            remove: 'Remove',
            removeConfirm: 'Are you sure you want to remove this assignment?',
            assigned: 'Role assigned successfully',
            removed: 'Assignment removed successfully',
            assignedBy: 'Assigned by',
            expires: 'Expires'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [assignmentData, roleData, userData] = await Promise.all([
                base44.entities.UserRoleAssignment.list(),
                base44.entities.FactRole.list(),
                base44.entities.User.list()
            ]);
            setAssignments(assignmentData);
            setRoles(roleData.filter(r => r.active));
            setUsers(userData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar dados' : 'Error loading data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async (formData) => {
        try {
            await base44.functions.invoke('assignUserRole', formData);
            toast.success(text.assigned);
            loadData();
            setDialogOpen(false);
        } catch (error) {
            console.error('Error assigning role:', error);
            toast.error(lang === 'pt' ? 'Erro ao atribuir' : 'Error assigning');
        }
    };

    const handleRemove = async (assignmentId) => {
        if (!confirm(text.removeConfirm)) return;
        try {
            await base44.entities.UserRoleAssignment.delete(assignmentId);
            toast.success(text.removed);
            loadData();
        } catch (error) {
            console.error('Error removing assignment:', error);
            toast.error(lang === 'pt' ? 'Erro ao remover' : 'Error removing');
        }
    };

    const AssignmentForm = ({ onAssign, onCancel }) => {
        const [formData, setFormData] = useState({
            user_email: '',
            role_id: '',
            assignment_reason: '',
            expires_at: ''
        });

        return (
            <div className="space-y-4">
                <div>
                    <Label>{text.user}</Label>
                    <Select
                        value={formData.user_email}
                        onValueChange={(value) => setFormData({ ...formData, user_email: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={text.user} />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map(user => (
                                <SelectItem key={user.email} value={user.email}>
                                    {user.full_name || user.email}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>{text.role}</Label>
                    <Select
                        value={formData.role_id}
                        onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={text.role} />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>
                                    {role.display_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>{text.reason}</Label>
                    <Textarea
                        value={formData.assignment_reason}
                        onChange={(e) => setFormData({ ...formData, assignment_reason: e.target.value })}
                    />
                </div>
                <div>
                    <Label>{text.expiresAt}</Label>
                    <Input
                        type="datetime-local"
                        value={formData.expires_at}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={() => onAssign(formData)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {text.assign}
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
                            <Users className="w-5 h-5 text-[#002D62]" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.description}</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                {text.assignRole}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{text.assignRole}</DialogTitle>
                            </DialogHeader>
                            <AssignmentForm
                                onAssign={handleAssign}
                                onCancel={() => setDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-96">
                    <div className="space-y-3">
                        <AnimatePresence>
                            {assignments.map(assignment => (
                                <motion.div
                                    key={assignment.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 border rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">{assignment.user_email}</Badge>
                                                <Badge className="bg-[#002D62] text-white">
                                                    {assignment.role_name}
                                                </Badge>
                                                {assignment.expires_at && new Date(assignment.expires_at) < new Date() && (
                                                    <Badge variant="secondary">Expired</Badge>
                                                )}
                                            </div>
                                            {assignment.assignment_reason && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {assignment.assignment_reason}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>{text.assignedBy}: {assignment.assigned_by}</span>
                                                {assignment.expires_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {text.expires}: {moment(assignment.expires_at).format('MMM D, YYYY')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemove(assignment.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </Button>
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