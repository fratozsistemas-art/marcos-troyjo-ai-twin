import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, Plus, RefreshCw, Trash2, Key, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_SOURCES = {
    world_bank: {
        name: 'World Bank',
        api_endpoint: 'https://api.worldbank.org/v2',
        api_key_required: false,
        auth_type: 'none',
        data_format: 'json'
    },
    imf: {
        name: 'International Monetary Fund',
        api_endpoint: 'https://www.imf.org/external/datamapper/api/v1',
        api_key_required: false,
        auth_type: 'none',
        data_format: 'json'
    },
    wto: {
        name: 'World Trade Organization',
        api_endpoint: 'https://api.wto.org',
        api_key_required: true,
        auth_type: 'api_key',
        auth_header: 'Ocp-Apim-Subscription-Key',
        data_format: 'json'
    },
    oecd: {
        name: 'OECD',
        api_endpoint: 'https://stats.oecd.org/restsdmx/sdmx.ashx/GetData',
        api_key_required: false,
        auth_type: 'none',
        data_format: 'xml'
    },
    ndb: {
        name: 'New Development Bank',
        api_endpoint: 'https://ndb.int/api',
        api_key_required: false,
        auth_type: 'none',
        data_format: 'json'
    }
};

export default function DataSourceManager({ lang = 'pt' }) {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [syncing, setSyncing] = useState(null);
    const [editingSource, setEditingSource] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        source_type: 'world_bank',
        api_endpoint: '',
        api_key_required: false,
        api_key: '',
        auth_type: 'none',
        auth_header: '',
        enabled: true,
        sync_frequency: 'manual',
        data_format: 'json'
    });

    const t = {
        pt: {
            title: 'Fontes de Dados Externas',
            addSource: 'Adicionar Fonte',
            name: 'Nome',
            type: 'Tipo',
            endpoint: 'API Endpoint',
            apiKey: 'API Key',
            authType: 'Tipo de Autenticação',
            authHeader: 'Header de Autenticação',
            enabled: 'Ativo',
            syncFreq: 'Frequência de Sync',
            save: 'Salvar',
            cancel: 'Cancelar',
            sync: 'Sincronizar',
            syncing: 'Sincronizando...',
            delete: 'Excluir',
            lastSync: 'Última Sincronização',
            never: 'Nunca',
            custom: 'Customizado'
        },
        en: {
            title: 'External Data Sources',
            addSource: 'Add Source',
            name: 'Name',
            type: 'Type',
            endpoint: 'API Endpoint',
            apiKey: 'API Key',
            authType: 'Authentication Type',
            authHeader: 'Auth Header',
            enabled: 'Enabled',
            syncFreq: 'Sync Frequency',
            save: 'Save',
            cancel: 'Cancel',
            sync: 'Sync',
            syncing: 'Syncing...',
            delete: 'Delete',
            lastSync: 'Last Sync',
            never: 'Never',
            custom: 'Custom'
        }
    }[lang];

    useEffect(() => {
        loadSources();
    }, []);

    const loadSources = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.ExternalDataSource.list();
            setSources(data);
        } catch (error) {
            console.error('Error loading sources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePresetSelect = (type) => {
        const preset = PRESET_SOURCES[type];
        if (preset) {
            setFormData({
                ...formData,
                ...preset,
                source_type: type
            });
        }
    };

    const handleSave = async () => {
        try {
            if (editingSource) {
                await base44.entities.ExternalDataSource.update(editingSource.id, formData);
                toast.success(lang === 'pt' ? 'Fonte atualizada!' : 'Source updated!');
            } else {
                await base44.entities.ExternalDataSource.create(formData);
                toast.success(lang === 'pt' ? 'Fonte adicionada!' : 'Source added!');
            }
            setDialogOpen(false);
            setEditingSource(null);
            setFormData({
                name: '',
                source_type: 'world_bank',
                api_endpoint: '',
                api_key_required: false,
                api_key: '',
                auth_type: 'none',
                auth_header: '',
                enabled: true,
                sync_frequency: 'manual',
                data_format: 'json'
            });
            loadSources();
        } catch (error) {
            console.error('Error saving source:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        }
    };

    const handleSync = async (source) => {
        setSyncing(source.id);
        try {
            const response = await base44.functions.invoke('fetchExternalDataSource', {
                source_id: source.id,
                indicators: ['NY.GDP.MKTP.CD', 'NY.GDP.PCAP.CD'],
                countries: ['BRA', 'CHN', 'IND', 'RUS', 'ZAF'],
                startYear: 2020,
                endYear: 2023
            });

            if (response.data.success) {
                toast.success(`${response.data.sync_log.facts_created} novos fatos criados!`);
                loadSources();
            }
        } catch (error) {
            console.error('Error syncing:', error);
            toast.error(lang === 'pt' ? 'Erro ao sincronizar' : 'Error syncing');
        } finally {
            setSyncing(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(lang === 'pt' ? 'Confirmar exclusão?' : 'Confirm deletion?')) return;
        
        try {
            await base44.entities.ExternalDataSource.delete(id);
            toast.success(lang === 'pt' ? 'Fonte excluída!' : 'Source deleted!');
            loadSources();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <Database className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                {t.addSource}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{t.addSource}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>{t.type}</Label>
                                    <Select
                                        value={formData.source_type}
                                        onValueChange={(val) => {
                                            setFormData({ ...formData, source_type: val });
                                            handlePresetSelect(val);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(PRESET_SOURCES).map(key => (
                                                <SelectItem key={key} value={key}>
                                                    {PRESET_SOURCES[key].name}
                                                </SelectItem>
                                            ))}
                                            <SelectItem value="custom">{t.custom}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>{t.name}</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: World Bank API"
                                    />
                                </div>

                                <div>
                                    <Label>{t.endpoint}</Label>
                                    <Input
                                        value={formData.api_endpoint}
                                        onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                                        placeholder="https://api.example.com"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.api_key_required}
                                        onCheckedChange={(checked) => setFormData({ ...formData, api_key_required: checked })}
                                    />
                                    <Label>Requer API Key</Label>
                                </div>

                                {formData.api_key_required && (
                                    <>
                                        <div>
                                            <Label>{t.apiKey}</Label>
                                            <Input
                                                type="password"
                                                value={formData.api_key}
                                                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <div>
                                            <Label>{t.authType}</Label>
                                            <Select
                                                value={formData.auth_type}
                                                onValueChange={(val) => setFormData({ ...formData, auth_type: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="api_key">API Key</SelectItem>
                                                    <SelectItem value="bearer">Bearer Token</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label>{t.authHeader}</Label>
                                            <Input
                                                value={formData.auth_header}
                                                onChange={(e) => setFormData({ ...formData, auth_header: e.target.value })}
                                                placeholder="Authorization"
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <Label>{t.syncFreq}</Label>
                                    <Select
                                        value={formData.sync_frequency}
                                        onValueChange={(val) => setFormData({ ...formData, sync_frequency: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual</SelectItem>
                                            <SelectItem value="daily">Diário</SelectItem>
                                            <SelectItem value="weekly">Semanal</SelectItem>
                                            <SelectItem value="monthly">Mensal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        {t.cancel}
                                    </Button>
                                    <Button onClick={handleSave}>
                                        {t.save}
                                    </Button>
                                </div>
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
                ) : sources.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {lang === 'pt' ? 'Nenhuma fonte configurada' : 'No sources configured'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sources.map((source) => (
                            <div key={source.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-[#002D62]">{source.name}</h4>
                                            {source.enabled ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex gap-2 mb-2">
                                            <Badge variant="secondary">{source.source_type}</Badge>
                                            <Badge variant="outline">{source.sync_frequency}</Badge>
                                            {source.api_key_required && (
                                                <Badge className="bg-purple-100 text-purple-800">
                                                    <Key className="w-3 h-3 mr-1" />
                                                    API Key
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            {t.lastSync}: {source.last_sync 
                                                ? new Date(source.last_sync).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')
                                                : t.never}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleSync(source)}
                                            disabled={syncing === source.id || !source.enabled}
                                        >
                                            {syncing === source.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(source.id)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
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