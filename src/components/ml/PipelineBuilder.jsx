import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { GitBranch, Plus, Trash2, Edit2, Loader2, Play, Settings } from 'lucide-react';
import { toast } from 'sonner';

const stageTypes = [
    { value: 'build', label: 'Build', icon: '🔨' },
    { value: 'test', label: 'Test', icon: '🧪' },
    { value: 'train', label: 'Train', icon: '🎓' },
    { value: 'evaluate', label: 'Evaluate', icon: '📊' },
    { value: 'deploy', label: 'Deploy', icon: '🚀' },
    { value: 'custom', label: 'Custom', icon: '⚙️' }
];

export default function PipelineBuilder({ lang = 'pt' }) {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPipeline, setEditingPipeline] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        model_name: '',
        git_repo_url: '',
        git_branch: 'main',
        enabled: true,
        trigger_on_commit: false,
        trigger_on_retraining: false,
        stages: [],
        notification_emails: [],
        deployment_target: 'flywheel'
    });

    useEffect(() => {
        loadPipelines();
    }, []);

    const loadPipelines = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.MLPipeline.list('-created_date');
            setPipelines(data);
        } catch (error) {
            console.error('Error loading pipelines:', error);
            toast.error('Erro ao carregar pipelines');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingPipeline) {
                await base44.entities.MLPipeline.update(editingPipeline.id, formData);
                toast.success('Pipeline atualizado!');
            } else {
                await base44.entities.MLPipeline.create(formData);
                toast.success('Pipeline criado!');
            }
            setDialogOpen(false);
            resetForm();
            loadPipelines();
        } catch (error) {
            console.error('Error saving pipeline:', error);
            toast.error('Erro ao salvar pipeline');
        }
    };

    const handleRunPipeline = async (pipelineId) => {
        try {
            toast.info('Iniciando pipeline...');
            await base44.functions.invoke('executePipeline', {
                pipeline_id: pipelineId,
                trigger_data: { trigger_type: 'manual' }
            });
            toast.success('Pipeline executando!');
            setTimeout(loadPipelines, 2000);
        } catch (error) {
            console.error('Error running pipeline:', error);
            toast.error('Erro ao executar pipeline');
        }
    };

    const addStage = () => {
        setFormData({
            ...formData,
            stages: [...formData.stages, {
                name: `stage-${formData.stages.length + 1}`,
                type: 'build',
                script: '',
                timeout_minutes: 30,
                retry_on_failure: false
            }]
        });
    };

    const updateStage = (index, field, value) => {
        const newStages = [...formData.stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setFormData({ ...formData, stages: newStages });
    };

    const removeStage = (index) => {
        setFormData({
            ...formData,
            stages: formData.stages.filter((_, i) => i !== index)
        });
    };

    const resetForm = () => {
        setEditingPipeline(null);
        setFormData({
            name: '',
            description: '',
            model_name: '',
            git_repo_url: '',
            git_branch: 'main',
            enabled: true,
            trigger_on_commit: false,
            trigger_on_retraining: false,
            stages: [],
            notification_emails: [],
            deployment_target: 'flywheel'
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <GitBranch className="w-5 h-5" />
                            {lang === 'pt' ? 'Pipelines CI/CD' : 'CI/CD Pipelines'}
                        </CardTitle>
                        <CardDescription>
                            {lang === 'pt' ? 'Configure pipelines de ML' : 'Configure ML pipelines'}
                        </CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#002D62]">
                                <Plus className="w-4 h-4 mr-2" />
                                {lang === 'pt' ? 'Novo Pipeline' : 'New Pipeline'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>{editingPipeline ? 'Editar Pipeline' : 'Novo Pipeline'}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[75vh] pr-4">
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nome</Label>
                                            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Modelo</Label>
                                            <Input value={formData.model_name} onChange={(e) => setFormData({...formData, model_name: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Descrição</Label>
                                        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Git Repository URL</Label>
                                            <Input value={formData.git_repo_url} onChange={(e) => setFormData({...formData, git_repo_url: e.target.value})} placeholder="https://github.com/user/repo" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Branch</Label>
                                            <Input value={formData.git_branch} onChange={(e) => setFormData({...formData, git_branch: e.target.value})} />
                                        </div>
                                    </div>

                                    <div className="space-y-3 border rounded-lg p-4">
                                        <Label className="text-base font-semibold">Gatilhos</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm">Disparar em commits Git</Label>
                                                <Switch checked={formData.trigger_on_commit} onCheckedChange={(val) => setFormData({...formData, trigger_on_commit: val})} />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm">Disparar após retreinamento</Label>
                                                <Switch checked={formData.trigger_on_retraining} onCheckedChange={(val) => setFormData({...formData, trigger_on_retraining: val})} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">Estágios do Pipeline</Label>
                                            <Button onClick={addStage} variant="outline" size="sm">
                                                <Plus className="w-4 h-4 mr-1" />
                                                Adicionar Estágio
                                            </Button>
                                        </div>
                                        {formData.stages.map((stage, idx) => (
                                            <div key={idx} className="border rounded-lg p-3 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-sm">Estágio {idx + 1}</span>
                                                    <Button onClick={() => removeStage(idx)} variant="ghost" size="sm" className="text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Input placeholder="Nome" value={stage.name} onChange={(e) => updateStage(idx, 'name', e.target.value)} />
                                                    <Select value={stage.type} onValueChange={(val) => updateStage(idx, 'type', val)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            {stageTypes.map(t => (
                                                                <SelectItem key={t.value} value={t.value}>
                                                                    {t.icon} {t.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Textarea placeholder="Script ou comando" value={stage.script} onChange={(e) => updateStage(idx, 'script', e.target.value)} rows={2} />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Plataforma de Deploy</Label>
                                        <Select value={formData.deployment_target} onValueChange={(val) => setFormData({...formData, deployment_target: val})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="flywheel">Flywheel</SelectItem>
                                                <SelectItem value="kubernetes">Kubernetes</SelectItem>
                                                <SelectItem value="docker">Docker</SelectItem>
                                                <SelectItem value="serverless">Serverless</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </ScrollArea>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSave} className="bg-[#002D62]">Salvar</Button>
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
                        {pipelines.map(pipeline => (
                            <div key={pipeline.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold">{pipeline.name}</h4>
                                            <Badge variant={pipeline.enabled ? 'default' : 'secondary'}>
                                                {pipeline.enabled ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                            {pipeline.last_run_status && (
                                                <Badge variant={pipeline.last_run_status === 'success' ? 'default' : 'destructive'}>
                                                    {pipeline.last_run_status}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{pipeline.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>Modelo: {pipeline.model_name}</span>
                                            <span>•</span>
                                            <span>{pipeline.stages?.length || 0} estágios</span>
                                            {pipeline.git_repo_url && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <GitBranch className="w-3 h-3" />
                                                        {pipeline.git_branch}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleRunPipeline(pipeline.id)}>
                                            <Play className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            setEditingPipeline(pipeline);
                                            setFormData({...pipeline});
                                            setDialogOpen(true);
                                        }}>
                                            <Edit2 className="w-4 h-4" />
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