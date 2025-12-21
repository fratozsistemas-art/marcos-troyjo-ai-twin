import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Configurações do Site',
        description: 'Gerencie configurações avançadas',
        general: 'Geral',
        envVars: 'Variáveis de Ambiente',
        ssl: 'SSL',
        phpVersion: 'Versão PHP',
        addVar: 'Adicionar Variável',
        varName: 'Nome',
        varValue: 'Valor',
        sslEnabled: 'SSL Habilitado',
        autoRenew: 'Renovação Automática',
        save: 'Salvar',
        saving: 'Salvando...',
        cancel: 'Cancelar',
        loading: 'Carregando...'
    },
    en: {
        title: 'Site Configuration',
        description: 'Manage advanced settings',
        general: 'General',
        envVars: 'Environment Variables',
        ssl: 'SSL',
        phpVersion: 'PHP Version',
        addVar: 'Add Variable',
        varName: 'Name',
        varValue: 'Value',
        sslEnabled: 'SSL Enabled',
        autoRenew: 'Auto Renew',
        save: 'Save',
        saving: 'Saving...',
        cancel: 'Cancel',
        loading: 'Loading...'
    }
};

export default function SiteConfigDialog({ open, onOpenChange, siteId, lang = 'pt' }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        phpVersion: '8.2',
        envVars: [],
        ssl: { enabled: true, autoRenew: true }
    });
    const t = translations[lang];

    useEffect(() => {
        if (open && siteId) {
            loadConfig();
        }
    }, [open, siteId]);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const [configRes, envRes] = await Promise.all([
                base44.functions.invoke('flywheelManager', {
                    action: 'getSiteConfig',
                    siteId
                }),
                base44.functions.invoke('flywheelManager', {
                    action: 'getEnvVars',
                    siteId
                })
            ]);

            if (configRes.data.success) {
                setConfig({
                    phpVersion: configRes.data.data.phpVersion || '8.2',
                    envVars: envRes.data.success ? envRes.data.data.variables || [] : [],
                    ssl: configRes.data.data.ssl || { enabled: true, autoRenew: true }
                });
            }
        } catch (error) {
            console.error('Error loading config:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section) => {
        setSaving(true);
        try {
            let action, data;

            switch (section) {
                case 'php':
                    action = 'updatePHPVersion';
                    data = { version: config.phpVersion };
                    break;
                case 'env':
                    action = 'updateEnvVars';
                    data = { variables: config.envVars };
                    break;
                case 'ssl':
                    action = 'updateSSL';
                    data = { sslConfig: config.ssl };
                    break;
            }

            const response = await base44.functions.invoke('flywheelManager', {
                action,
                siteId,
                data
            });

            if (response.data.success) {
                toast.success('Configurações salvas com sucesso!');
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error saving config:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const addEnvVar = () => {
        setConfig({
            ...config,
            envVars: [...config.envVars, { name: '', value: '' }]
        });
    };

    const removeEnvVar = (index) => {
        setConfig({
            ...config,
            envVars: config.envVars.filter((_, i) => i !== index)
        });
    };

    const updateEnvVar = (index, field, value) => {
        const newVars = [...config.envVars];
        newVars[index][field] = value;
        setConfig({ ...config, envVars: newVars });
    };

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                        <span className="ml-2 text-sm text-gray-600">{t.loading}</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">{t.general}</TabsTrigger>
                        <TabsTrigger value="env">{t.envVars}</TabsTrigger>
                        <TabsTrigger value="ssl">{t.ssl}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.phpVersion}</Label>
                            <Select
                                value={config.phpVersion}
                                onValueChange={(value) => setConfig({ ...config, phpVersion: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7.4">PHP 7.4</SelectItem>
                                    <SelectItem value="8.0">PHP 8.0</SelectItem>
                                    <SelectItem value="8.1">PHP 8.1</SelectItem>
                                    <SelectItem value="8.2">PHP 8.2</SelectItem>
                                    <SelectItem value="8.3">PHP 8.3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => handleSave('php')} disabled={saving} className="bg-[#002D62]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="env" className="space-y-4">
                        <div className="space-y-3">
                            {config.envVars.map((envVar, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        placeholder={t.varName}
                                        value={envVar.name}
                                        onChange={(e) => updateEnvVar(idx, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder={t.varValue}
                                        value={envVar.value}
                                        onChange={(e) => updateEnvVar(idx, 'value', e.target.value)}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeEnvVar(idx)}
                                        className="text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={addEnvVar}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t.addVar}
                            </Button>
                            <Button onClick={() => handleSave('env')} disabled={saving} className="bg-[#002D62]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="ssl" className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>{t.sslEnabled}</Label>
                                <Select
                                    value={config.ssl.enabled.toString()}
                                    onValueChange={(value) => setConfig({
                                        ...config,
                                        ssl: { ...config.ssl, enabled: value === 'true' }
                                    })}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">{lang === 'pt' ? 'Sim' : 'Yes'}</SelectItem>
                                        <SelectItem value="false">{lang === 'pt' ? 'Não' : 'No'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>{t.autoRenew}</Label>
                                <Select
                                    value={config.ssl.autoRenew.toString()}
                                    onValueChange={(value) => setConfig({
                                        ...config,
                                        ssl: { ...config.ssl, autoRenew: value === 'true' }
                                    })}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">{lang === 'pt' ? 'Sim' : 'Yes'}</SelectItem>
                                        <SelectItem value="false">{lang === 'pt' ? 'Não' : 'No'}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => handleSave('ssl')} disabled={saving} className="bg-[#002D62]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}