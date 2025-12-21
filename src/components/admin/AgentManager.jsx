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
import { Settings, Brain, FileText, Shield, BarChart, Loader2, Save, Database, ScrollText, TrendingUp, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, Legend, ComposedChart } from 'recharts';

const translations = {
    pt: {
        title: 'Gerenciamento de Agentes',
        description: 'Configure parâmetros e fontes de conhecimento do agente',
        personas: 'Personas',
        rag: 'RAG (Documentos)',
        aegis: 'AEGIS Protocol',
        response: 'Respostas',
        analytics: 'Analytics',
        logs: 'Logs de Interações',
        metrics: 'Métricas',
        customPersonas: 'Personas Customizadas',
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
        aggregateInsights: 'Agregar Insights',
        viewLogs: 'Ver Logs',
        noLogs: 'Nenhum log disponível',
        avgResponseTime: 'Tempo Médio de Resposta',
        totalInteractions: 'Interações Totais',
        avgFeedback: 'Feedback Médio',
        createPersona: 'Criar Persona',
        personaName: 'Nome da Persona',
        personaRole: 'Papel',
        personaDesc: 'Descrição',
        systemPrompt: 'Prompt de Sistema',
        focusAreas: 'Áreas de Foco',
        noPersonas: 'Nenhuma persona customizada',
        dateFilter: 'Filtrar por Data',
        last7Days: 'Últimos 7 dias',
        last30Days: 'Últimos 30 dias',
        last90Days: 'Últimos 90 dias',
        allTime: 'Todo período',
        interactionsByPersona: 'Interações por Persona',
        feedbackDistribution: 'Distribuição de Feedback',
        timelineMetrics: 'Métricas ao Longo do Tempo',
        positive: 'Positivo',
        negative: 'Negativo',
        neutral: 'Neutro',
        interactions: 'Interações',
        avgTime: 'Tempo Médio (ms)',
        exportData: 'Exportar Dados',
        exportCSV: 'Exportar CSV',
        exportExcel: 'Exportar Excel',
        exportPDF: 'Gerar Relatório PDF',
        exporting: 'Exportando...',
        exportSuccess: 'Exportação concluída!'
    },
    en: {
        title: 'Agent Management',
        description: 'Configure agent parameters and knowledge sources',
        personas: 'Personas',
        rag: 'RAG (Documents)',
        aegis: 'AEGIS Protocol',
        response: 'Responses',
        analytics: 'Analytics',
        logs: 'Interaction Logs',
        metrics: 'Metrics',
        customPersonas: 'Custom Personas',
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
        aggregateInsights: 'Aggregate Insights',
        viewLogs: 'View Logs',
        noLogs: 'No logs available',
        avgResponseTime: 'Avg Response Time',
        totalInteractions: 'Total Interactions',
        avgFeedback: 'Avg Feedback',
        createPersona: 'Create Persona',
        personaName: 'Persona Name',
        personaRole: 'Role',
        personaDesc: 'Description',
        systemPrompt: 'System Prompt',
        focusAreas: 'Focus Areas',
        noPersonas: 'No custom personas',
        dateFilter: 'Filter by Date',
        last7Days: 'Last 7 days',
        last30Days: 'Last 30 days',
        last90Days: 'Last 90 days',
        allTime: 'All time',
        interactionsByPersona: 'Interactions by Persona',
        feedbackDistribution: 'Feedback Distribution',
        timelineMetrics: 'Metrics Over Time',
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',
        interactions: 'Interactions',
        avgTime: 'Avg Time (ms)',
        exportData: 'Export Data',
        exportCSV: 'Export CSV',
        exportExcel: 'Export Excel',
        exportPDF: 'Generate PDF Report',
        exporting: 'Exporting...',
        exportSuccess: 'Export completed!'
    }
};

export default function AgentManager({ lang = 'pt' }) {
    const [config, setConfig] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logs, setLogs] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [personas, setPersonas] = useState([]);
    const [logsDialogOpen, setLogsDialogOpen] = useState(false);
    const [personaDialogOpen, setPersonaDialogOpen] = useState(false);
    const [newPersona, setNewPersona] = useState({
        name: '',
        role: '',
        description: '',
        system_prompt: '',
        focus_areas: [],
        temperature: 0.7,
        top_p: 0.9
    });
    const [dateFilter, setDateFilter] = useState('30');
    const [analyticsData, setAnalyticsData] = useState({
        byPersona: [],
        feedbackDist: [],
        timeline: []
    });
    const [isExporting, setIsExporting] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadConfiguration();
        loadDocuments();
        loadLogs();
        loadMetrics(parseInt(dateFilter));
        loadPersonas();
    }, []);

    useEffect(() => {
        loadMetrics(dateFilter === 'all' ? 'all' : parseInt(dateFilter));
    }, [dateFilter]);

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

    const loadLogs = async () => {
        try {
            const allLogs = await base44.entities.AgentInteractionLog.filter({
                agent_name: 'troyjo_twin'
            }, '-created_date', 50);
            setLogs(allLogs);
        } catch (error) {
            console.error('Error loading logs:', error);
        }
    };

    const loadMetrics = async (filterDays = 30) => {
        try {
            const allLogs = await base44.entities.AgentInteractionLog.filter({
                agent_name: 'troyjo_twin'
            });

            // Apply date filter
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - filterDays);
            const filteredLogs = filterDays === 'all' ? allLogs : allLogs.filter(log => 
                new Date(log.created_date) >= cutoffDate
            );
            
            const totalInteractions = filteredLogs.length;
            const avgResponseTime = filteredLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / totalInteractions;
            const logsWithFeedback = filteredLogs.filter(l => l.feedback_score);
            const avgFeedback = logsWithFeedback.reduce((sum, log) => sum + log.feedback_score, 0) / logsWithFeedback.length;
            
            // Group by date for chart
            const byDate = {};
            filteredLogs.forEach(log => {
                const date = new Date(log.created_date).toLocaleDateString();
                byDate[date] = (byDate[date] || 0) + 1;
            });
            
            const chartData = Object.entries(byDate).map(([date, count]) => ({ date, count })).slice(-30);
            
            setMetrics({
                totalInteractions,
                avgResponseTime: Math.round(avgResponseTime),
                avgFeedback: avgFeedback ? avgFeedback.toFixed(2) : 'N/A',
                chartData
            });

            // Analytics data for visualizations
            
            // 1. Interactions by Persona
            const byPersona = {};
            filteredLogs.forEach(log => {
                const persona = log.persona_mode || 'não especificado';
                byPersona[persona] = (byPersona[persona] || 0) + 1;
            });
            const personaData = Object.entries(byPersona).map(([name, value]) => ({ name, value }));

            // 2. Feedback Distribution
            const feedbackCounts = { positive: 0, negative: 0, neutral: 0 };
            filteredLogs.forEach(log => {
                if (log.feedback_score >= 4) feedbackCounts.positive++;
                else if (log.feedback_score <= 2) feedbackCounts.negative++;
                else if (log.feedback_score === 3) feedbackCounts.neutral++;
            });
            const feedbackData = [
                { name: lang === 'pt' ? 'Positivo' : 'Positive', value: feedbackCounts.positive },
                { name: lang === 'pt' ? 'Neutro' : 'Neutral', value: feedbackCounts.neutral },
                { name: lang === 'pt' ? 'Negativo' : 'Negative', value: feedbackCounts.negative }
            ];

            // 3. Timeline with interactions and avg response time
            const timelineMap = {};
            filteredLogs.forEach(log => {
                const date = new Date(log.created_date).toLocaleDateString();
                if (!timelineMap[date]) {
                    timelineMap[date] = { count: 0, totalTime: 0, numWithTime: 0 };
                }
                timelineMap[date].count++;
                if (log.response_time_ms) {
                    timelineMap[date].totalTime += log.response_time_ms;
                    timelineMap[date].numWithTime++;
                }
            });
            
            const timelineData = Object.entries(timelineMap)
                .map(([date, data]) => ({
                    date,
                    interactions: data.count,
                    avgTime: data.numWithTime > 0 ? Math.round(data.totalTime / data.numWithTime) : 0
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            setAnalyticsData({
                byPersona: personaData,
                feedbackDist: feedbackData,
                timeline: timelineData
            });
            
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    };

    const loadPersonas = async () => {
        try {
            const allPersonas = await base44.entities.CustomAgentPersona.filter({
                agent_name: 'troyjo_twin',
                active: true
            });
            setPersonas(allPersonas);
        } catch (error) {
            console.error('Error loading personas:', error);
        }
    };

    const handleCreatePersona = async () => {
        if (!newPersona.name || !newPersona.role || !newPersona.system_prompt) {
            toast.error(lang === 'pt' ? 'Preencha os campos obrigatórios' : 'Fill required fields');
            return;
        }
        
        try {
            const user = await base44.auth.me();
            await base44.entities.CustomAgentPersona.create({
                ...newPersona,
                agent_name: 'troyjo_twin',
                created_by: user.email
            });
            
            toast.success(lang === 'pt' ? 'Persona criada!' : 'Persona created!');
            setPersonaDialogOpen(false);
            setNewPersona({
                name: '',
                role: '',
                description: '',
                system_prompt: '',
                focus_areas: [],
                temperature: 0.7,
                top_p: 0.9
            });
            loadPersonas();
        } catch (error) {
            console.error('Error creating persona:', error);
            toast.error(lang === 'pt' ? 'Erro ao criar' : 'Error creating');
        }
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
                    <TabsList className="grid w-full grid-cols-8 text-xs">
                        <TabsTrigger value="personas">
                            <Brain className="w-4 h-4 mr-1" />
                            {t.personas}
                        </TabsTrigger>
                        <TabsTrigger value="logs">
                            <ScrollText className="w-4 h-4 mr-1" />
                            {t.logs}
                        </TabsTrigger>
                        <TabsTrigger value="metrics">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            {t.metrics}
                        </TabsTrigger>
                        <TabsTrigger value="custom">
                            <Users className="w-4 h-4 mr-1" />
                            {t.customPersonas}
                        </TabsTrigger>
                        <TabsTrigger value="rag">
                            <Database className="w-4 h-4 mr-1" />
                            {t.rag}
                        </TabsTrigger>
                        <TabsTrigger value="aegis">
                            <Shield className="w-4 h-4 mr-1" />
                            {t.aegis}
                        </TabsTrigger>
                        <TabsTrigger value="response">
                            <FileText className="w-4 h-4 mr-1" />
                            {t.response}
                        </TabsTrigger>
                        <TabsTrigger value="analytics">
                            <BarChart className="w-4 h-4 mr-1" />
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

                    <TabsContent value="logs" className="space-y-4 mt-6">
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {logs.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">{t.noLogs}</p>
                            ) : (
                                logs.map((log) => (
                                    <Card key={log.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline">{log.persona_mode}</Badge>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(log.created_date).toLocaleString()}
                                                        </span>
                                                        {log.response_time_ms && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {log.response_time_ms}ms
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                                        {log.prompt.substring(0, 100)}...
                                                    </p>
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {log.response?.substring(0, 150)}...
                                                    </p>
                                                    {log.feedback_score && (
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-green-100 text-green-800">
                                                                ⭐ {log.feedback_score}/5
                                                            </Badge>
                                                            {log.feedback_comment && (
                                                                <span className="text-xs text-gray-500">
                                                                    {log.feedback_comment}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-6 mt-6">
                        {metrics && (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-xs text-gray-500 mb-1">{t.totalInteractions}</div>
                                            <div className="text-2xl font-bold text-[#002D62]">
                                                {metrics.totalInteractions}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-xs text-gray-500 mb-1">{t.avgResponseTime}</div>
                                            <div className="text-2xl font-bold text-[#002D62]">
                                                {metrics.avgResponseTime}ms
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="text-xs text-gray-500 mb-1">{t.avgFeedback}</div>
                                            <div className="text-2xl font-bold text-[#002D62]">
                                                {metrics.avgFeedback}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">
                                            {lang === 'pt' ? 'Interações nos Últimos 30 Dias' : 'Interactions Last 30 Days'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <AreaChart data={metrics.chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="count" stroke="#002D62" fill="#002D62" fillOpacity={0.3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="custom" className="space-y-4 mt-6">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setPersonaDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                {t.createPersona}
                            </Button>
                        </div>
                        
                        {personas.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">{t.noPersonas}</p>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {personas.map((persona) => (
                                    <Card key={persona.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-sm">{persona.name}</CardTitle>
                                                    <Badge variant="outline" className="mt-1">{persona.role}</Badge>
                                                </div>
                                                <Badge>
                                                    {persona.usage_count || 0} {lang === 'pt' ? 'usos' : 'uses'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <p className="text-xs text-gray-600">{persona.description}</p>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Badge variant="secondary">T: {persona.temperature}</Badge>
                                                <Badge variant="secondary">P: {persona.top_p}</Badge>
                                                {persona.avg_feedback && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        ⭐ {persona.avg_feedback}
                                                    </Badge>
                                                )}
                                            </div>
                                            {persona.focus_areas?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {persona.focus_areas.map((area, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {area}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6 mt-6">
                        {/* Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    {lang === 'pt' ? 'Configurações de Analytics' : 'Analytics Settings'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
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
                            </CardContent>
                        </Card>

                        {/* Date Filter & Export */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Label>{t.dateFilter}:</Label>
                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">{t.last7Days}</SelectItem>
                                        <SelectItem value="30">{t.last30Days}</SelectItem>
                                        <SelectItem value="90">{t.last90Days}</SelectItem>
                                        <SelectItem value="all">{t.allTime}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToCSV}
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <FileText className="w-4 h-4 mr-2" />
                                    )}
                                    {t.exportCSV}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToExcel}
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    )}
                                    {t.exportExcel}
                                </Button>
                                <Button
                                    onClick={exportToPDF}
                                    disabled={isExporting}
                                    className="bg-[#002D62] hover:bg-[#001d42]"
                                    size="sm"
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t.exporting}
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            {t.exportPDF}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Interactions by Persona - Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">{t.interactionsByPersona}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsData.byPersona.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RechartsBarChart data={analyticsData.byPersona}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#002D62" />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">{t.noLogs}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Feedback Distribution - Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">{t.feedbackDistribution}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsData.feedbackDist.some(d => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={analyticsData.feedbackDist}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {analyticsData.feedbackDist.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={
                                                        entry.name.includes('Positivo') || entry.name.includes('Positive') ? '#10b981' :
                                                        entry.name.includes('Negativo') || entry.name.includes('Negative') ? '#ef4444' :
                                                        '#6b7280'
                                                    } />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        {lang === 'pt' ? 'Nenhum feedback ainda' : 'No feedback yet'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline Metrics - Composed Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">{t.timelineMetrics}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {analyticsData.timeline.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ComposedChart data={analyticsData.timeline}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="interactions" fill="#002D62" name={t.interactions} />
                                            <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#D4AF37" strokeWidth={2} name={t.avgTime} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">{t.noLogs}</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Create Persona Dialog */}
                <Dialog open={personaDialogOpen} onOpenChange={setPersonaDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{t.createPersona}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>{t.personaName}</Label>
                                <Input
                                    value={newPersona.name}
                                    onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                                    placeholder="ex: CFO Advisor"
                                />
                            </div>
                            <div>
                                <Label>{t.personaRole}</Label>
                                <Input
                                    value={newPersona.role}
                                    onChange={(e) => setNewPersona({...newPersona, role: e.target.value})}
                                    placeholder="ex: Chief Financial Officer"
                                />
                            </div>
                            <div>
                                <Label>{t.personaDesc}</Label>
                                <Textarea
                                    value={newPersona.description}
                                    onChange={(e) => setNewPersona({...newPersona, description: e.target.value})}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label>{t.systemPrompt}</Label>
                                <Textarea
                                    value={newPersona.system_prompt}
                                    onChange={(e) => setNewPersona({...newPersona, system_prompt: e.target.value})}
                                    rows={6}
                                    placeholder="Define como esta persona deve se comportar..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{t.temperature}: {newPersona.temperature}</Label>
                                    <Slider
                                        value={[newPersona.temperature]}
                                        onValueChange={([val]) => setNewPersona({...newPersona, temperature: val})}
                                        min={0}
                                        max={1}
                                        step={0.05}
                                    />
                                </div>
                                <div>
                                    <Label>{t.topP}: {newPersona.top_p}</Label>
                                    <Slider
                                        value={[newPersona.top_p]}
                                        onValueChange={([val]) => setNewPersona({...newPersona, top_p: val})}
                                        min={0}
                                        max={1}
                                        step={0.05}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setPersonaDialogOpen(false)}>
                                    {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                                </Button>
                                <Button onClick={handleCreatePersona}>
                                    {t.createPersona}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}