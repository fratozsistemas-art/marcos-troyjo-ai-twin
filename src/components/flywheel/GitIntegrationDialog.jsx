import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitBranch, Unlink, Plus, Trash2, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Integração Git & CI/CD',
        description: 'Configure repositórios e webhooks',
        repository: 'Repositório',
        webhooks: 'Webhooks',
        build: 'Build',
        provider: 'Provedor',
        repoUrl: 'URL do Repositório',
        branch: 'Branch',
        token: 'Token de Acesso',
        autoDeploy: 'Deploy Automático',
        connect: 'Conectar',
        disconnect: 'Desconectar',
        connected: 'Conectado',
        notConnected: 'Não Conectado',
        webhookUrl: 'URL do Webhook',
        events: 'Eventos',
        addWebhook: 'Adicionar Webhook',
        buildCommand: 'Comando de Build',
        outputDir: 'Diretório de Saída',
        installCommand: 'Comando de Instalação',
        save: 'Salvar',
        cancel: 'Cancelar'
    },
    en: {
        title: 'Git & CI/CD Integration',
        description: 'Configure repositories and webhooks',
        repository: 'Repository',
        webhooks: 'Webhooks',
        build: 'Build',
        provider: 'Provider',
        repoUrl: 'Repository URL',
        branch: 'Branch',
        token: 'Access Token',
        autoDeploy: 'Auto Deploy',
        connect: 'Connect',
        disconnect: 'Disconnect',
        connected: 'Connected',
        notConnected: 'Not Connected',
        webhookUrl: 'Webhook URL',
        events: 'Events',
        addWebhook: 'Add Webhook',
        buildCommand: 'Build Command',
        outputDir: 'Output Directory',
        installCommand: 'Install Command',
        save: 'Save',
        cancel: 'Cancel'
    }
};

export default function GitIntegrationDialog({ open, onOpenChange, siteId, lang = 'pt' }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [gitStatus, setGitStatus] = useState(null);
    const [webhooks, setWebhooks] = useState([]);
    const [repoForm, setRepoForm] = useState({
        provider: 'github',
        repository: '',
        branch: 'main',
        token: '',
        autoDeploy: true
    });
    const [buildSettings, setBuildSettings] = useState({
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        installCommand: 'npm install',
        mlflowTracking: true,
        mlflowExperimentName: ''
    });
    const t = translations[lang];

    useEffect(() => {
        if (open && siteId) {
            loadData();
        }
    }, [open, siteId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [gitRes, webhooksRes] = await Promise.all([
                base44.functions.invoke('flywheelCICD', {
                    action: 'getGitStatus',
                    siteId
                }),
                base44.functions.invoke('flywheelCICD', {
                    action: 'listWebhooks',
                    siteId
                })
            ]);

            if (gitRes.data.success) {
                setGitStatus(gitRes.data.data);
            }

            if (webhooksRes.data.success) {
                setWebhooks(webhooksRes.data.data.webhooks || []);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectRepo = async () => {
        setSaving(true);
        try {
            const response = await base44.functions.invoke('flywheelCICD', {
                action: 'connectGitRepo',
                siteId,
                data: repoForm
            });

            if (response.data.success) {
                toast.success('Repositório conectado!');
                loadData();
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error connecting repo:', error);
            toast.error('Erro ao conectar repositório');
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async () => {
        setSaving(true);
        try {
            const response = await base44.functions.invoke('flywheelCICD', {
                action: 'disconnectGitRepo',
                siteId
            });

            if (response.data.success) {
                toast.success('Repositório desconectado!');
                setGitStatus(null);
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error disconnecting:', error);
            toast.error('Erro ao desconectar');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBuildSettings = async () => {
        setSaving(true);
        try {
            const response = await base44.functions.invoke('flywheelCICD', {
                action: 'configureBuildSettings',
                siteId,
                data: buildSettings
            });

            if (response.data.success) {
                toast.success('Configurações de build salvas!');
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error('Error saving build settings:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-3xl">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="repository">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="repository">{t.repository}</TabsTrigger>
                        <TabsTrigger value="webhooks">{t.webhooks}</TabsTrigger>
                        <TabsTrigger value="build">{t.build}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="repository" className="space-y-4">
                        {gitStatus ? (
                            <div className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Badge className="bg-green-100 text-green-800">
                                        {t.connected}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDisconnect}
                                        disabled={saving}
                                    >
                                        <Unlink className="w-4 h-4 mr-2" />
                                        {t.disconnect}
                                    </Button>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p><strong>{t.provider}:</strong> {gitStatus.provider}</p>
                                    <p><strong>{t.repoUrl}:</strong> {gitStatus.repository}</p>
                                    <p><strong>{t.branch}:</strong> {gitStatus.branch}</p>
                                    <p><strong>{t.autoDeploy}:</strong> {gitStatus.auto_deploy ? 'Sim' : 'Não'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t.provider}</Label>
                                    <Select
                                        value={repoForm.provider}
                                        onValueChange={(value) => setRepoForm({ ...repoForm, provider: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="github">GitHub</SelectItem>
                                            <SelectItem value="gitlab">GitLab</SelectItem>
                                            <SelectItem value="bitbucket">Bitbucket</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t.repoUrl}</Label>
                                    <Input
                                        placeholder="user/repository"
                                        value={repoForm.repository}
                                        onChange={(e) => setRepoForm({ ...repoForm, repository: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t.branch}</Label>
                                    <Input
                                        placeholder="main"
                                        value={repoForm.branch}
                                        onChange={(e) => setRepoForm({ ...repoForm, branch: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t.token}</Label>
                                    <Input
                                        type="password"
                                        placeholder={
                                            repoForm.provider === 'github' ? 'ghp_xxxx...' :
                                            repoForm.provider === 'gitlab' ? 'glpat-xxxx...' :
                                            'token...'
                                        }
                                        value={repoForm.token}
                                        onChange={(e) => setRepoForm({ ...repoForm, token: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500">
                                        {repoForm.provider === 'github' && 'GitHub: Settings → Developer settings → Personal access tokens'}
                                        {repoForm.provider === 'gitlab' && 'GitLab: Settings → Access Tokens → repo, api scopes'}
                                        {repoForm.provider === 'bitbucket' && 'Bitbucket: Settings → App passwords'}
                                    </p>
                                </div>

                                <Button onClick={handleConnectRepo} disabled={saving} className="w-full bg-[#002D62]">
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <GitBranch className="w-4 h-4 mr-2" />
                                    )}
                                    {t.connect}
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="webhooks" className="space-y-4">
                        <div className="space-y-3">
                            {webhooks.map((webhook) => (
                                <div key={webhook.id} className="border rounded-lg p-3 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-sm">{webhook.url}</p>
                                        <p className="text-xs text-gray-500">{webhook.events?.join(', ')}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        {webhooks.length === 0 && (
                            <p className="text-center text-gray-500 py-8">Nenhum webhook configurado</p>
                        )}
                    </TabsContent>

                    <TabsContent value="build" className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.buildCommand}</Label>
                            <Input
                                value={buildSettings.buildCommand}
                                onChange={(e) => setBuildSettings({ ...buildSettings, buildCommand: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.outputDir}</Label>
                            <Input
                                value={buildSettings.outputDirectory}
                                onChange={(e) => setBuildSettings({ ...buildSettings, outputDirectory: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.installCommand}</Label>
                            <Input
                                value={buildSettings.installCommand}
                                onChange={(e) => setBuildSettings({ ...buildSettings, installCommand: e.target.value })}
                            />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4 text-[#002D62]" />
                                    <Label className="mb-0">MLflow Auto-Tracking</Label>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={buildSettings.mlflowTracking}
                                    onChange={(e) => setBuildSettings({ ...buildSettings, mlflowTracking: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </div>
                            {buildSettings.mlflowTracking && (
                                <div className="space-y-2">
                                    <Label>
                                        {lang === 'pt' ? 'Nome do Experimento (opcional)' : 'Experiment Name (optional)'}
                                    </Label>
                                    <Input
                                        placeholder={lang === 'pt' ? 'site-name-main' : 'site-name-main'}
                                        value={buildSettings.mlflowExperimentName}
                                        onChange={(e) => setBuildSettings({ ...buildSettings, mlflowExperimentName: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500">
                                        {lang === 'pt' 
                                            ? 'Deixe vazio para usar o nome padrão (repo-branch)'
                                            : 'Leave empty to use default name (repo-branch)'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button onClick={handleSaveBuildSettings} disabled={saving} className="w-full bg-[#002D62]">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}