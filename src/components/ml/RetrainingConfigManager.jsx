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
import { RefreshCw, Plus, Edit2, Trash2, Loader2, Play, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Configuração de Retreinamento',
        description: 'Configure gatilhos automáticos para retreinamento',
        create: 'Nova Configuração',
        modelName: 'Nome do Modelo',
        triggerType: 'Tipo de Gatilho',
        metricThreshold: 'Limite de Métrica',
        dataDrift: 'Deriva de Dados',
        scheduled: 'Agendado',
        manual: 'Manual',
        save: 'Salvar',
        cancel: 'Cancelar',
        enabled: 'Ativo',
        autoDeploy: 'Auto-Deploy se Melhorar',
        notificationEmails: 'Emails para Notificação',
        triggerNow: 'Disparar Agora'
    }
};

export default function RetrainingConfigManager({ lang = 'pt' }) {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        model_name: '',
        experiment_id: '',
        enabled: true,
        trigger_type: 'metric_threshold',
        metric_thresholds: { metric_name: 'accuracy', operator: 'less_than', threshold_value: 0.8 },
        drift_threshold: 0.1,
        auto_deploy_if_improved: false,
        improvement_threshold: 0.02,
        notification_emails: [],
        training_params: {},
        baseline_metrics: {}
    });
    const [newEmail, setNewEmail] = useState('');
    const t = translations[lang];

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.ModelRetrainingConfig.list('-created_date');
            setConfigs(data);
        } catch (error) {
            console.error('Error loading configs:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingConfig) {
                await base44.entities.ModelRetrainingConfig.update(editingConfig.id, formData);
                toast.success('Configuração atualizada!');
            } else {
                await base44.entities.ModelRetrainingConfig.create(formData);
                toast.success('Configuração criada!');
            }
            setDialogOpen(false);
            resetForm();
            loadConfigs();
        } catch (error) {
            console.error('Error saving config:', error);
            toast.error('Erro ao salvar');
        }
    };

    const handleTriggerNow = async (configId) => {
        try {
            const config = configs.find(c => c.id === configId);
            const job = await base44.entities.RetrainingJob.create({
                config_id: configId,
                model_name: config.model_name,
                trigger_reason: 'Manual trigger',
                status: 'pending',
                baseline_metrics: config.baseline_metrics,
                training_params: config.training_params,
                triggered_by: (await base44.auth.me()).email
            });

            toast.success('Retreinamento iniciado!');
            
            // Execute retraining
            await base44.functions.invoke('executeRetraining', { job_id: job.id });
        } catch (error) {
            console.error('Error triggering retraining:', error);
            toast.error('Erro ao disparar retreinamento');
        }
    };

    const handleDelete = async (configId) => {
        if (!confirm('Excluir esta configuração?')) return;
        try {
            await base44.entities.ModelRetrainingConfig.delete(configId);
            toast.success('Configuração excluída!');
            loadConfigs();
        } catch (error) {
            console.error('Error deleting config:', error);
            toast.error('Erro ao excluir');
        }
    };

    const handleEdit = (config) => {
        setEditingConfig(config);
        setFormData({ ...config });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingConfig(null);
        setFormData({
            name: '',
            model_name: '',
            experiment_id: '',
            enabled: true,
            trigger_type: 'metric_threshold',
            metric_thresholds: { metric_name: 'accuracy', operator: 'less_than', threshold_value: 0.8 },
            drift_threshold: 0.1,
            auto_deploy_if_improved: false,
            improvement_threshold: 0.02,
            notification_emails: [],
            training_params: {},
            baseline_metrics: {}
        });
    };

    const addEmail = () => {
        if (newEmail && !formData.notification_emails.includes(newEmail)) {
            setFormData({
                ...formData,
                notification_emails: [...formData.notification_emails, newEmail]
            });
            setNewEmail('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <RefreshCw className="w-5 h-5" />
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
                                {t.create}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>{editingConfig ? 'Editar' : t.create}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] pr-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nome</Label>
                                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t.modelName}</Label>
                                        <Input value={formData.model_name} onChange={(e) => setFormData({...formData, model_name: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t.triggerType}</Label>
                                        <Select value={formData.trigger_type} onValueChange={(val) => setFormData({...formData, trigger_type: val})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="metric_threshold">{t.metricThreshold}</SelectItem>
                                                <SelectItem value="data_drift">{t.dataDrift}</SelectItem>
                                                <SelectItem value="scheduled">{t.scheduled}</SelectItem>
                                                <SelectItem value="manual">{t.manual}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {formData.trigger_type === 'metric_threshold' && (
                                        <div className="space-y-3 border rounded-lg p-3">
                                            <Label>Configuração de Métrica</Label>
                                            <Input 
                                                placeholder="Nome da métrica"
                                                value={formData.metric_thresholds.metric_name}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    metric_thresholds: {...formData.metric_thresholds, metric_name: e.target.value}
                                                })}
                                            />
                                            <Select 
                                                value={formData.metric_thresholds.operator}
                                                onValueChange={(val) => setFormData({
                                                    ...formData,
                                                    metric_thresholds: {...formData.metric_thresholds, operator: val}
                                                })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="less_than">Menor que</SelectItem>
                                                    <SelectItem value="greater_than">Maior que</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input 
                                                type="number"
                                                step="0.01"
                                                placeholder="Valor limite"
                                                value={formData.metric_thresholds.threshold_value}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    metric_thresholds: {...formData.metric_thresholds, threshold_value: parseFloat(e.target.value)}
                                                })}
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <Label>{t.autoDeploy}</Label>
                                        <Switch checked={formData.auto_deploy_if_improved} onCheckedChange={(val) => setFormData({...formData, auto_deploy_if_improved: val})} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t.notificationEmails}</Label>
                                        <div className="flex gap-2">
                                            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
                                            <Button onClick={addEmail} variant="outline"><Plus className="w-4 h-4" /></Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.notification_emails.map(email => (
                                                <Badge key={email} variant="secondary">
                                                    {email}
                                                    <button onClick={() => setFormData({...formData, notification_emails: formData.notification_emails.filter(e => e !== email)})} className="ml-1">×</button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label>{t.enabled}</Label>
                                        <Switch checked={formData.enabled} onCheckedChange={(val) => setFormData({...formData, enabled: val})} />
                                    </div>
                                </div>
                            </ScrollArea>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
                                <Button onClick={handleSave} className="bg-[#002D62]">{t.save}</Button>
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
                        {configs.map(config => (
                            <div key={config.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold">{config.name}</h4>
                                            <Badge variant={config.enabled ? 'default' : 'secondary'}>
                                                {config.enabled ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                            <Badge variant="outline">{config.trigger_type}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Modelo: {config.model_name}</p>
                                        {config.auto_deploy_if_improved && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                Auto-deploy habilitado
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleTriggerNow(config.id)} title={t.triggerNow}>
                                            <Play className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(config.id)} className="text-red-600">
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