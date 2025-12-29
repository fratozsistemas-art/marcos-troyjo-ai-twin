import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
    FileText, Download, Loader2, Calendar, Filter,
    CheckCircle, Settings, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ReportBuilder({ lang = 'pt', onReportGenerated }) {
    const [config, setConfig] = useState({
        title: '',
        include_facts: true,
        include_risks: true,
        include_articles: true,
        include_interactions: true,
        include_documents: false,
        include_predictions: true,
        date_range: {
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0]
        },
        regions: [],
        include_ai_summary: true
    });
    const [generating, setGenerating] = useState(false);
    const [exportFormat, setExportFormat] = useState('json');

    const t = {
        pt: {
            title: 'Construtor de Relatórios',
            subtitle: 'Crie relatórios analíticos personalizados',
            reportTitle: 'Título do Relatório',
            titlePlaceholder: 'Ex: Análise Geopolítica Q4 2024',
            dataSelection: 'Seleção de Dados',
            dateRange: 'Período',
            filters: 'Filtros',
            options: 'Opções',
            includeFacts: 'Incluir Fatos Estratégicos',
            includeRisks: 'Incluir Riscos Geopolíticos',
            includeArticles: 'Incluir Artigos',
            includeInteractions: 'Incluir Interações do Usuário',
            includeDocuments: 'Incluir Documentos',
            includePredictions: 'Incluir Previsões ML',
            aiSummary: 'Gerar Resumo Executivo com IA',
            regions: 'Regiões',
            exportFormat: 'Formato de Exportação',
            generate: 'Gerar Relatório',
            generating: 'Gerando...',
            download: 'Baixar',
            preview: 'Visualizar',
            success: 'Relatório gerado com sucesso!'
        },
        en: {
            title: 'Report Builder',
            subtitle: 'Create custom analytical reports',
            reportTitle: 'Report Title',
            titlePlaceholder: 'e.g. Geopolitical Analysis Q4 2024',
            dataSelection: 'Data Selection',
            dateRange: 'Date Range',
            filters: 'Filters',
            options: 'Options',
            includeFacts: 'Include Strategic Facts',
            includeRisks: 'Include Geopolitical Risks',
            includeArticles: 'Include Articles',
            includeInteractions: 'Include User Interactions',
            includeDocuments: 'Include Documents',
            includePredictions: 'Include ML Predictions',
            aiSummary: 'Generate AI Executive Summary',
            regions: 'Regions',
            exportFormat: 'Export Format',
            generate: 'Generate Report',
            generating: 'Generating...',
            download: 'Download',
            preview: 'Preview',
            success: 'Report generated successfully!'
        }
    }[lang];

    const REGIONS = [
        'América Latina', 'América do Norte', 'Europa', 'Ásia-Pacífico',
        'China', 'Índia', 'África', 'Oriente Médio', 'Brasil', 'BRICS'
    ];

    const toggleRegion = (region) => {
        setConfig(prev => ({
            ...prev,
            regions: prev.regions.includes(region)
                ? prev.regions.filter(r => r !== region)
                : [...prev.regions, region]
        }));
    };

    const handleGenerate = async () => {
        if (!config.title.trim()) {
            toast.error(lang === 'pt' ? 'Por favor, adicione um título' : 'Please add a title');
            return;
        }

        setGenerating(true);
        try {
            const response = await base44.functions.invoke('generateAnalyticalReport', {
                report_config: config,
                format: exportFormat,
                include_ai_summary: config.include_ai_summary
            });

            if (exportFormat === 'json') {
                toast.success(t.success);
                if (onReportGenerated) {
                    onReportGenerated(response.data.report);
                }
            } else {
                // For PDF/CSV, the download will start automatically
                toast.success(t.success);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(error.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="config" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="config">{t.dataSelection}</TabsTrigger>
                        <TabsTrigger value="filters">{t.filters}</TabsTrigger>
                        <TabsTrigger value="options">{t.options}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="config" className="space-y-4">
                        <div>
                            <Label>{t.reportTitle}</Label>
                            <Input
                                value={config.title}
                                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                placeholder={t.titlePlaceholder}
                            />
                        </div>

                        <div className="space-y-3 border rounded-lg p-4">
                            {[
                                { key: 'include_facts', label: t.includeFacts, icon: FileText },
                                { key: 'include_risks', label: t.includeRisks, icon: Settings },
                                { key: 'include_articles', label: t.includeArticles, icon: FileText },
                                { key: 'include_interactions', label: t.includeInteractions, icon: CheckCircle },
                                { key: 'include_documents', label: t.includeDocuments, icon: FileText },
                                { key: 'include_predictions', label: t.includePredictions, icon: Sparkles }
                            ].map(({ key, label, icon: Icon }) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-gray-500" />
                                        <Label className="text-sm">{label}</Label>
                                    </div>
                                    <Switch
                                        checked={config[key]}
                                        onCheckedChange={(checked) => setConfig({ ...config, [key]: checked })}
                                    />
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="filters" className="space-y-4">
                        <div>
                            <Label className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4" />
                                {t.dateRange}
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="date"
                                    value={config.date_range.start_date}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        date_range: { ...config.date_range, start_date: e.target.value }
                                    })}
                                />
                                <Input
                                    type="date"
                                    value={config.date_range.end_date}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        date_range: { ...config.date_range, end_date: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="flex items-center gap-2 mb-2">
                                <Filter className="w-4 h-4" />
                                {t.regions}
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {REGIONS.map(region => (
                                    <Badge
                                        key={region}
                                        variant={config.regions.includes(region) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => toggleRegion(region)}
                                    >
                                        {region}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="options" className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                <div>
                                    <Label className="text-sm font-semibold">{t.aiSummary}</Label>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {lang === 'pt' 
                                            ? 'Resumo executivo gerado por IA'
                                            : 'AI-generated executive summary'}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={config.include_ai_summary}
                                onCheckedChange={(checked) => setConfig({ ...config, include_ai_summary: checked })}
                            />
                        </div>

                        <div>
                            <Label className="mb-2 block">{t.exportFormat}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {['json', 'pdf', 'csv'].map(format => (
                                    <Button
                                        key={format}
                                        variant={exportFormat === format ? "default" : "outline"}
                                        onClick={() => setExportFormat(format)}
                                        className="uppercase"
                                    >
                                        {format}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 pt-6 border-t">
                    <Button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full"
                        size="lg"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {t.generating}
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5 mr-2" />
                                {t.generate}
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}