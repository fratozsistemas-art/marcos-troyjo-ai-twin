import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Download, Loader2, FileSpreadsheet, Calendar, Shield, Users, Globe } from 'lucide-react';

const translations = {
    pt: {
        title: 'Relatórios SSOT',
        subtitle: 'Gere relatórios personalizados com dados mestres',
        selectEntities: 'Selecionar Entidades',
        forums: 'Fóruns',
        events: 'Eventos',
        keyActors: 'Atores Chave',
        filters: 'Filtros',
        dateRange: 'Período de Eventos',
        startDate: 'Data Início',
        endDate: 'Data Fim',
        strategicImportance: 'Importância Estratégica',
        all: 'Todas',
        critical: 'Crítica',
        high: 'Alta',
        medium: 'Média',
        low: 'Baixa',
        fields: 'Campos do Relatório',
        selectFields: 'Selecione os campos a incluir',
        generate: 'Gerar Relatório',
        exportCSV: 'Exportar CSV',
        exportPDF: 'Exportar PDF',
        generating: 'Gerando...',
        preview: 'Prévia do Relatório',
        noData: 'Nenhum dado disponível',
        back: 'Voltar'
    },
    en: {
        title: 'SSOT Reports',
        subtitle: 'Generate custom reports with master data',
        selectEntities: 'Select Entities',
        forums: 'Forums',
        events: 'Events',
        keyActors: 'Key Actors',
        filters: 'Filters',
        dateRange: 'Event Period',
        startDate: 'Start Date',
        endDate: 'End Date',
        strategicImportance: 'Strategic Importance',
        all: 'All',
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
        fields: 'Report Fields',
        selectFields: 'Select fields to include',
        generate: 'Generate Report',
        exportCSV: 'Export CSV',
        exportPDF: 'Export PDF',
        generating: 'Generating...',
        preview: 'Report Preview',
        noData: 'No data available',
        back: 'Back'
    }
};

const entityFields = {
    Forum: {
        pt: {
            name: 'Nome',
            full_name: 'Nome Completo',
            acronym: 'Sigla',
            type: 'Tipo',
            members: 'Membros',
            established_year: 'Ano de Criação',
            headquarters: 'Sede',
            key_themes: 'Temas Principais',
            significance: 'Importância'
        },
        en: {
            name: 'Name',
            full_name: 'Full Name',
            acronym: 'Acronym',
            type: 'Type',
            members: 'Members',
            established_year: 'Established Year',
            headquarters: 'Headquarters',
            key_themes: 'Key Themes',
            significance: 'Significance'
        }
    },
    Event: {
        pt: {
            name: 'Nome',
            event_type: 'Tipo',
            start_date: 'Data Início',
            end_date: 'Data Fim',
            location: 'Localização',
            description: 'Descrição',
            key_themes: 'Temas',
            status: 'Status',
            significance: 'Importância'
        },
        en: {
            name: 'Name',
            event_type: 'Type',
            start_date: 'Start Date',
            end_date: 'End Date',
            location: 'Location',
            description: 'Description',
            key_themes: 'Themes',
            status: 'Status',
            significance: 'Significance'
        }
    },
    KeyActor: {
        pt: {
            name: 'Nome',
            type: 'Tipo',
            country: 'País',
            acronym: 'Sigla',
            full_name: 'Nome Completo',
            description: 'Descrição',
            role: 'Papel',
            areas_of_influence: 'Áreas de Influência',
            strategic_importance: 'Importância Estratégica'
        },
        en: {
            name: 'Name',
            type: 'Type',
            country: 'Country',
            acronym: 'Acronym',
            full_name: 'Full Name',
            description: 'Description',
            role: 'Role',
            areas_of_influence: 'Areas of Influence',
            strategic_importance: 'Strategic Importance'
        }
    }
};

export default function SSOTReports() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const t = translations[lang];

    const [config, setConfig] = useState({
        entities: { Forum: true, Event: false, KeyActor: false },
        filters: {
            startDate: '',
            endDate: '',
            strategicImportance: 'all'
        },
        fields: {
            Forum: ['name', 'type', 'members', 'key_themes'],
            Event: ['name', 'event_type', 'start_date', 'location', 'status'],
            KeyActor: ['name', 'type', 'country', 'role', 'strategic_importance']
        }
    });

    const [reportData, setReportData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleEntityToggle = (entity) => {
        setConfig(prev => ({
            ...prev,
            entities: { ...prev.entities, [entity]: !prev.entities[entity] }
        }));
    };

    const handleFieldToggle = (entity, field) => {
        setConfig(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [entity]: prev.fields[entity].includes(field)
                    ? prev.fields[entity].filter(f => f !== field)
                    : [...prev.fields[entity], field]
            }
        }));
    };

    const handleGenerate = async () => {
        const selectedEntities = Object.keys(config.entities).filter(e => config.entities[e]);
        if (selectedEntities.length === 0) {
            toast.error(lang === 'pt' ? 'Selecione pelo menos uma entidade' : 'Select at least one entity');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await base44.functions.invoke('generateSSOTReport', {
                entities: selectedEntities,
                filters: config.filters,
                fields: config.fields
            });

            if (response.data?.data) {
                setReportData(response.data.data);
                toast.success(lang === 'pt' ? 'Relatório gerado!' : 'Report generated!');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar relatório' : 'Error generating report');
        } finally {
            setIsGenerating(false);
        }
    };

    const exportCSV = () => {
        if (!reportData) return;

        let csvContent = '';
        
        Object.keys(reportData).forEach(entity => {
            const data = reportData[entity];
            if (data.length === 0) return;

            csvContent += `\n${entity}\n`;
            const headers = Object.keys(data[0]);
            csvContent += headers.join(',') + '\n';
            
            data.forEach(row => {
                const values = headers.map(h => {
                    const val = row[h];
                    if (Array.isArray(val)) return `"${val.join('; ')}"`;
                    if (typeof val === 'object') return `"${JSON.stringify(val)}"`;
                    return `"${val || ''}"`;
                });
                csvContent += values.join(',') + '\n';
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ssot_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'CSV exportado!' : 'CSV exported!');
    };

    const exportPDF = async () => {
        if (!reportData) return;

        try {
            const response = await base44.functions.invoke('exportSSOTReportPDF', {
                reportData,
                config,
                lang
            });

            if (response.data?.pdf_url) {
                window.open(response.data.pdf_url, '_blank');
                toast.success(lang === 'pt' ? 'PDF exportado!' : 'PDF exported!');
            }
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error(lang === 'pt' ? 'Erro ao exportar PDF' : 'Error exporting PDF');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#002D62] mb-2">{t.title}</h1>
                        <p className="text-[#6B6B6B]">{t.subtitle}</p>
                    </div>
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {t.back}
                        </Button>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Configuration Panel */}
                    <div className="space-y-6">
                        {/* Entity Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#002D62]" />
                                    {t.selectEntities}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    { key: 'Forum', label: t.forums, icon: Globe },
                                    { key: 'Event', label: t.events, icon: Calendar },
                                    { key: 'KeyActor', label: t.keyActors, icon: Users }
                                ].map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={key}
                                            checked={config.entities[key]}
                                            onCheckedChange={() => handleEntityToggle(key)}
                                        />
                                        <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                                            <Icon className="w-4 h-4 text-[#002D62]" />
                                            {label}
                                        </Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t.filters}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {config.entities.Event && (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold">{t.dateRange}</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs">{t.startDate}</Label>
                                                <Input
                                                    type="date"
                                                    value={config.filters.startDate}
                                                    onChange={(e) => setConfig(prev => ({
                                                        ...prev,
                                                        filters: { ...prev.filters, startDate: e.target.value }
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">{t.endDate}</Label>
                                                <Input
                                                    type="date"
                                                    value={config.filters.endDate}
                                                    onChange={(e) => setConfig(prev => ({
                                                        ...prev,
                                                        filters: { ...prev.filters, endDate: e.target.value }
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {config.entities.KeyActor && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold">{t.strategicImportance}</Label>
                                        <Select
                                            value={config.filters.strategicImportance}
                                            onValueChange={(value) => setConfig(prev => ({
                                                ...prev,
                                                filters: { ...prev.filters, strategicImportance: value }
                                            }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t.all}</SelectItem>
                                                <SelectItem value="critical">{t.critical}</SelectItem>
                                                <SelectItem value="high">{t.high}</SelectItem>
                                                <SelectItem value="medium">{t.medium}</SelectItem>
                                                <SelectItem value="low">{t.low}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Field Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t.fields}</CardTitle>
                                <CardDescription>{t.selectFields}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.keys(config.entities).filter(e => config.entities[e]).map(entity => (
                                    <div key={entity} className="space-y-2">
                                        <Label className="text-sm font-semibold text-[#002D62]">
                                            {entity === 'Forum' ? t.forums : entity === 'Event' ? t.events : t.keyActors}
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.keys(entityFields[entity][lang]).map(field => (
                                                <div key={field} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${entity}-${field}`}
                                                        checked={config.fields[entity].includes(field)}
                                                        onCheckedChange={() => handleFieldToggle(entity, field)}
                                                    />
                                                    <Label
                                                        htmlFor={`${entity}-${field}`}
                                                        className="text-xs cursor-pointer"
                                                    >
                                                        {entityFields[entity][lang][field]}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="flex-1 bg-[#002D62] hover:bg-[#001d42]"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.generating}
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        {t.generate}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Report Preview */}
                    <Card className="lg:sticky lg:top-6 h-fit">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t.preview}</CardTitle>
                                {reportData && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={exportCSV}>
                                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                                            {t.exportCSV}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={exportPDF}>
                                            <Download className="w-4 h-4 mr-2" />
                                            {t.exportPDF}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!reportData ? (
                                <div className="text-center py-12 text-[#6B6B6B]">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">{t.noData}</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {Object.keys(reportData).map(entity => (
                                        <div key={entity}>
                                            <h3 className="font-semibold text-[#002D62] mb-2 flex items-center gap-2">
                                                {entity === 'Forum' && <Globe className="w-4 h-4" />}
                                                {entity === 'Event' && <Calendar className="w-4 h-4" />}
                                                {entity === 'KeyActor' && <Users className="w-4 h-4" />}
                                                {entity === 'Forum' ? t.forums : entity === 'Event' ? t.events : t.keyActors}
                                                <Badge variant="outline">{reportData[entity].length}</Badge>
                                            </h3>
                                            <div className="space-y-2">
                                                {reportData[entity].slice(0, 5).map((item, idx) => (
                                                    <div key={idx} className="text-xs p-2 bg-gray-50 rounded border border-gray-100">
                                                        <div className="font-semibold text-[#002D62]">{item.name}</div>
                                                        {Object.entries(item).slice(1, 4).map(([key, value]) => (
                                                            <div key={key} className="text-[#6B6B6B]">
                                                                <span className="font-medium">{entityFields[entity][lang][key]}:</span>{' '}
                                                                {Array.isArray(value) ? value.join(', ') : 
                                                                 typeof value === 'object' ? JSON.stringify(value) : value}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                                {reportData[entity].length > 5 && (
                                                    <p className="text-xs text-[#6B6B6B] italic">
                                                        + {reportData[entity].length - 5} {lang === 'pt' ? 'mais registros' : 'more records'}
                                                    </p>
                                                )}
                                            </div>
                                            <Separator className="my-4" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}