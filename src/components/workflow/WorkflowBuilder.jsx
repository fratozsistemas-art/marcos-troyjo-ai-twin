import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Workflow, Plus, Save, Play, Pause, Trash2, Settings, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function WorkflowBuilder({ lang = 'pt' }) {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingWorkflow, setEditingWorkflow] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        workflow_type: 'auto_collection_assignment',
        status: 'active',
        trigger_type: 'on_create',
        content_types: ['article'],
        criteria: {
            min_confidence: 0.7
        },
        auto_approve: false
    });

    const t = {
        pt: {
            title: 'Workflows de Curadoria',
            create: 'Novo Workflow',
            name: 'Nome',
            description: 'Descrição',
            type: 'Tipo',
            trigger: 'Gatilho',
            status: 'Status',
            autoApprove: 'Aprovar Automaticamente',
            minConfidence: 'Confiança Mínima',
            contentTypes: 'Tipos de Conteúdo',
            save: 'Salvar',
            cancel: 'Cancelar',
            executions: 'execuções',
            successRate: 'Taxa de sucesso',
            types: {
                auto_collection_assignment: 'Atribuição Automática a Coleções',
                content_review_flagging: 'Sinalização para Revisão',
                trend_based_suggestions: 'Sugestões Baseadas em Tendências',
                tag_auto_assignment: 'Atribuição Automática de Tags',
                content_quality_check: 'Verificação de Qualidade'
            },
            triggers: {
                on_create: 'Ao Criar',
                on_update: 'Ao Atualizar',
                scheduled: 'Agendado',
                manual: 'Manual'
            }
        },
        en: {
            title: 'Curation Workflows',
            create: 'New Workflow',
            name: 'Name',
            description: 'Description',
            type: 'Type',
            trigger: 'Trigger',
            status: 'Status',
            autoApprove: 'Auto Approve',
            minConfidence: 'Minimum Confidence',
            contentTypes: 'Content Types',
            save: 'Save',
            cancel: 'Cancel',
            executions: 'executions',
            successRate: 'Success rate',
            types: {
                auto_collection_assignment: 'Auto Collection Assignment',
                content_review_flagging: 'Content Review Flagging',
                trend_based_suggestions: 'Trend-Based Suggestions',
                tag_auto_assignment: 'Auto Tag Assignment',
                content_quality_check: 'Content Quality Check'
            },
            triggers: {
                on_create: 'On Create',
                on_update: 'On Update',
                scheduled: 'Scheduled',
                manual: 'Manual'
            }
        }
    }[lang];

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const data = await base44.entities.ContentCurationWorkflow.filter({
                owner_email: user.email
            });
            setWorkflows(data);
        } catch (error) {
            console.error('Error loading workflows:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error(lang === 'pt' ? 'Nome é obrigatório' : 'Name is required');
            return;
        }

        try {
            const user = await base44.auth.me();
            
            if (editingWorkflow) {
                await base44.entities.ContentCurationWorkflow.update(editingWorkflow.id, formData);
                toast.success(lang === 'pt' ? 'Workflow atualizado!' : 'Workflow updated!');
            } else {
                await base44.entities.ContentCurationWorkflow.create({
                    ...formData,
                    owner_email: user.email
                });
                toast.success(lang === 'pt' ? 'Workflow criado!' : 'Workflow created!');
            }
            
            setEditingWorkflow(null);
            resetForm();
            loadWorkflows();
        } catch (error) {
            console.error('Error saving workflow:', error);
            toast.error(error.message);
        }
    };

    const handleToggleStatus = async (workflow) => {
        try {
            const newStatus = workflow.status === 'active' ? 'paused' : 'active';
            await base44.entities.ContentCurationWorkflow.update(workflow.id, {
                status: newStatus
            });
            toast.success(
                lang === 'pt' 
                    ? `Workflow ${newStatus === 'active' ? 'ativado' : 'pausado'}!`
                    : `Workflow ${newStatus === 'active' ? 'activated' : 'paused'}!`
            );
            loadWorkflows();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Excluir este workflow?' : 'Delete this workflow?')) return;
        
        try {
            await base44.entities.ContentCurationWorkflow.delete(id);
            toast.success(lang === 'pt' ? 'Workflow excluído!' : 'Workflow deleted!');
            loadWorkflows();
        } catch (error) {
            console.error('Error deleting workflow:', error);
            toast.error(error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            workflow_type: 'auto_collection_assignment',
            status: 'active',
            trigger_type: 'on_create',
            content_types: ['article'],
            criteria: {
                min_confidence: 0.7
            },
            auto_approve: false
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Workflow className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <Button onClick={() => { resetForm(); setEditingWorkflow(null); }}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t.create}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingWorkflow !== null && (
                        <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                            <div className="space-y-4">
                                <div>
                                    <Label>{t.name}</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder={lang === 'pt' ? 'Auto-atribuir artigos de IA' : 'Auto-assign AI articles'}
                                    />
                                </div>

                                <div>
                                    <Label>{t.description}</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows={2}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t.type}</Label>
                                        <Select value={formData.workflow_type} onValueChange={(v) => setFormData({...formData, workflow_type: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(t.types).map((key) => (
                                                    <SelectItem key={key} value={key}>{t.types[key]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>{t.trigger}</Label>
                                        <Select value={formData.trigger_type} onValueChange={(v) => setFormData({...formData, trigger_type: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(t.triggers).map((key) => (
                                                    <SelectItem key={key} value={key}>{t.triggers[key]}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t.minConfidence}</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={formData.criteria.min_confidence}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                criteria: {
                                                    ...formData.criteria,
                                                    min_confidence: parseFloat(e.target.value)
                                                }
                                            })}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 pt-6">
                                        <Switch
                                            checked={formData.auto_approve}
                                            onCheckedChange={(checked) => setFormData({...formData, auto_approve: checked})}
                                        />
                                        <Label>{t.autoApprove}</Label>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleSave} className="flex-1">
                                        <Save className="w-4 h-4 mr-2" />
                                        {t.save}
                                    </Button>
                                    <Button variant="outline" onClick={() => { setEditingWorkflow(null); resetForm(); }}>
                                        {t.cancel}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {workflows.map((workflow) => (
                            <motion.div
                                key={workflow.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 border rounded-lg hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                                            <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                                                {workflow.status}
                                            </Badge>
                                            {workflow.auto_approve && (
                                                <Badge variant="outline" className="text-green-600">
                                                    <Zap className="w-3 h-3 mr-1" />
                                                    Auto
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{workflow.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span>{t.types[workflow.workflow_type]}</span>
                                            <span>•</span>
                                            <span>{workflow.execution_count || 0} {t.executions}</span>
                                            <span>•</span>
                                            <span>{t.successRate}: {Math.round((workflow.success_rate || 1) * 100)}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleStatus(workflow)}
                                        >
                                            {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingWorkflow(workflow);
                                                setFormData(workflow);
                                            }}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600"
                                            onClick={() => handleDelete(workflow.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {workflows.length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-500">
                                <Workflow className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">{lang === 'pt' ? 'Nenhum workflow criado' : 'No workflows created'}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}