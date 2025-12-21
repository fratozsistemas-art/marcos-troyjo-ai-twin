import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Brain, FileText, Shield, BarChart, Loader2, Save, Database } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Gerenciamento de Agentes',
        description: 'Configure parâmetros e fontes de conhecimento do agente',
        personas: 'Personas',
        rag: 'RAG (Documentos)',
        aegis: 'AEGIS Protocol',
        response: 'Respostas',
        analytics: 'Analytics',
        save: 'Salvar Configurações',
        loading: 'Carregando...',
        temperature: 'Temperature',
        topP: 'Top P',
        enabled: 'Habilitado',
        globalDocs: 'Documentos Globais RAG',
        topK: 'Top K Resultados',
        similarityThreshold: 'Threshold de Similaridade',
        maxTokens: 'Tokens Máximos',
        strictMode: 'Modo Estrito',
        alertThreshold: 'Limite de Alertas',
        streaming: 'Streaming',
        citations: 'Citações',
        suggestions: 'Sugestões',
        trackInteractions: 'Rastrear Interações',
        trackFeedback: 'Rastrear Feedback',
        aggregateInsights: 'Agregar Insights'
    },
    en: {
        title: 'Agent Management',
        description: 'Configure agent parameters and knowledge sources',
        personas: 'Personas',
        rag: 'RAG (Documents)',
        aegis: 'AEGIS Protocol',
        response: 'Responses',
        analytics: 'Analytics',
        save: 'Save Configuration',
        loading: 'Loading...',
        temperature: 'Temperature',
        topP: 'Top P',
        enabled: 'Enabled',
        globalDocs: 'Global RAG Documents',
        topK: 'Top K Results',
        similarityThreshold: 'Similarity Threshold',
        maxTokens: 'Max Tokens',
        strictMode: 'Strict Mode',
        alertThreshold: 'Alert Threshold',
        streaming: 'Streaming',
        citations: 'Citations',
        suggestions: 'Suggestions',
        trackInteractions: 'Track Interactions',
        trackFeedback: 'Track Feedback',
        aggregateInsights: 'Aggregate Insights'
    }
};

export default function AgentManager({ lang = 'pt' }) {
    const [config, setConfig] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadConfiguration();
        loadDocuments();
    }, []);

    const loadConfiguration = async () => {
        setLoading(true);
        try {
            const configs = await base44.entities.AgentConfiguration.filter({
                agent_name: 'troyjo_twin'
            });
            
            if (configs.length > 0) {
                setConfig(configs[0]);
            } else {
                // Create default config
                const defaultConfig = {
                    agent_name: 'troyjo_twin',
                    version: '2.4',
                    personas: {
                        professor: { enabled: true, temperature: 0.7, top_p: 0.9 },
                        tecnico: { enabled: true, temperature: 0.5, top_p: 0.85 },
                        diplomatico: { enabled: true, temperature: 0.8, top_p: 0.95 }
                    },
                    rag_settings: {
                        enabled: true,
                        global_document_ids: [],
                        top_k: 5,
                        similarity_threshold: 0.7,
                        max_tokens: 2000
                    },
                    aegis_settings: {
                        enabled: true,
                        strict_mode: true,
                        alert_threshold: 3
                    },
                    response_settings: {
                        max_tokens: 2000,
                        streaming: true,
                        include_citations: true,
                        include_suggestions: true
                    },
                    analytics_settings: {
                        track_interactions: true,
                        track_feedback: true,
                        aggregate_insights: true
                    },
                    active: true
                };
                const created = await base44.entities.AgentConfiguration.create(defaultConfig);
                setConfig(created);
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar configuração' : 'Error loading configuration');
        } finally {
            setLoading(false);
        }
    };

    const loadDocuments = async () => {
        try {
            const docs = await base44.entities.Document.list();
            const indexedDocs = docs.filter(d => d.metadata?.indexed === true);
            setDocuments(indexedDocs);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const user = await base44.auth.me();
            await base44.entities.AgentConfiguration.update(config.id, {
                ...config,
                last_modified_by: user.email
            });
            toast.success(lang === 'pt' ? 'Configurações salvas!' : 'Configuration saved!');
        } catch (error) {
            console.error('Error saving configuration:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        } finally {
            setSaving(false);
        }
    };

    const updatePersona = (persona, field, value) => {
        setConfig({
            ...config,
            personas: {
                ...config.personas,
                [persona]: {
                    ...config.personas[persona],
                    [field]: value
                }
            }
        });
    };

    const updateRAG = (field, value) => {
        setConfig({
            ...config,
            rag_settings: {
                ...config.rag_settings,
                [field]: value
            }
        });
    };

    const updateAegis = (field, value) => {
        setConfig({
            ...config,
            aegis_settings: {
                ...config.aegis_settings,
                [field]: value
            }
        });
    };

    const updateResponse = (field, value) => {
        setConfig({
            ...config,
            response_settings: {
                ...config.response_settings,
                [field]: value
            }
        });
    };

    const updateAnalytics = (field, value) => {
        setConfig({
            ...config,
            analytics_settings: {
                ...config.analytics_settings,
                [field]: value
            }
        });
    };

    if (loading || !config) {
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
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Settings className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {t.save}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="personas">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="personas">
                            <Brain className="w-4 h-4 mr-2" />
                            {t.personas}
                        </TabsTrigger>
                        <TabsTrigger value="rag">
                            <Database className="w-4 h-4 mr-2" />
                            {t.rag}
                        </TabsTrigger>
                        <TabsTrigger value="aegis">
                            <Shield className="w-4 h-4 mr-2" />
                            {t.aegis}
                        </TabsTrigger>
                        <TabsTrigger value="response">
                            <FileText className="w-4 h-4 mr-2" />
                            {t.response}
                        </TabsTrigger>
                        <TabsTrigger value="analytics">
                            <BarChart className="w-4 h-4 mr-2" />
                            {t.analytics}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personas" className="space-y-6 mt-6">
                        {['professor', 'tecnico', 'diplomatico'].map((persona) => (
                            <Card key={persona}>
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Badge>{persona.charAt(0).toUpperCase() + persona.slice(1)}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={config.personas[persona]?.enabled}
                                            onCheckedChange={(checked) => updatePersona(persona, 'enabled', checked)}
                                        />
                                        <Label>{t.enabled}</Label>
                                    </div>
                                    <div>
                                        <Label>{t.temperature}: {config.personas[persona]?.temperature?.toFixed(2)}</Label>
                                        <Slider
                                            value={[config.personas[persona]?.temperature || 0.7]}
                                            onValueChange={([value]) => updatePersona(persona, 'temperature', value)}
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>{t.topP}: {config.personas[persona]?.top_p?.toFixed(2)}</Label>
                                        <Slider
                                            value={[config.personas[persona]?.top_p || 0.9]}
                                            onValueChange={([value]) => updatePersona(persona, 'top_p', value)}
                                            min={0}
                                            max={1}
                                            step={0.05}
                                            className="mt-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="rag" className="space-y-4 mt-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.rag_settings?.enabled}
                                onCheckedChange={(checked) => updateRAG('enabled', checked)}
                            />
                            <Label>{t.enabled}</Label>
                        </div>
                        <div>
                            <Label>{t.topK}: {config.rag_settings?.top_k}</Label>
                            <Slider
                                value={[config.rag_settings?.top_k || 5]}
                                onValueChange={([value]) => updateRAG('top_k', value)}
                                min={1}
                                max={20}
                                step={1}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>{t.similarityThreshold}: {config.rag_settings?.similarity_threshold?.toFixed(2)}</Label>
                            <Slider
                                value={[config.rag_settings?.similarity_threshold || 0.7]}
                                onValueChange={([value]) => updateRAG('similarity_threshold', value)}
                                min={0}
                                max={1}
                                step={0.05}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label>{t.maxTokens}</Label>
                            <Input
                                type="number"
                                value={config.rag_settings?.max_tokens}
                                onChange={(e) => updateRAG('max_tokens', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block">{t.globalDocs}</Label>
                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                                {documents.map((doc) => (
                                    <label key={doc.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.rag_settings?.global_document_ids?.includes(doc.id)}
                                            onChange={(e) => {
                                                const ids = config.rag_settings?.global_document_ids || [];
                                                updateRAG('global_document_ids', 
                                                    e.target.checked 
                                                        ? [...ids, doc.id]
                                                        : ids.filter(id => id !== doc.id)
                                                );
                                            }}
                                        />
                                        <span className="text-sm">{doc.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="aegis" className="space-y-4 mt-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.aegis_settings?.enabled}
                                onCheckedChange={(checked) => updateAegis('enabled', checked)}
                            />
                            <Label>{t.enabled}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.aegis_settings?.strict_mode}
                                onCheckedChange={(checked) => updateAegis('strict_mode', checked)}
                            />
                            <Label>{t.strictMode}</Label>
                        </div>
                        <div>
                            <Label>{t.alertThreshold}</Label>
                            <Input
                                type="number"
                                value={config.aegis_settings?.alert_threshold}
                                onChange={(e) => updateAegis('alert_threshold', parseInt(e.target.value))}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="response" className="space-y-4 mt-6">
                        <div>
                            <Label>{t.maxTokens}</Label>
                            <Input
                                type="number"
                                value={config.response_settings?.max_tokens}
                                onChange={(e) => updateResponse('max_tokens', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.response_settings?.streaming}
                                onCheckedChange={(checked) => updateResponse('streaming', checked)}
                            />
                            <Label>{t.streaming}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.response_settings?.include_citations}
                                onCheckedChange={(checked) => updateResponse('include_citations', checked)}
                            />
                            <Label>{t.citations}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.response_settings?.include_suggestions}
                                onCheckedChange={(checked) => updateResponse('include_suggestions', checked)}
                            />
                            <Label>{t.suggestions}</Label>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4 mt-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.analytics_settings?.track_interactions}
                                onCheckedChange={(checked) => updateAnalytics('track_interactions', checked)}
                            />
                            <Label>{t.trackInteractions}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.analytics_settings?.track_feedback}
                                onCheckedChange={(checked) => updateAnalytics('track_feedback', checked)}
                            />
                            <Label>{t.trackFeedback}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={config.analytics_settings?.aggregate_insights}
                                onCheckedChange={(checked) => updateAnalytics('aggregate_insights', checked)}
                            />
                            <Label>{t.aggregateInsights}</Label>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}