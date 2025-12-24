import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileText, Wand2 } from 'lucide-react';
import ReportBuilder from '../components/reports/ReportBuilder';
import AdvancedFilters from '../components/reports/AdvancedFilters';
import ReportPreview from '../components/reports/ReportPreview';
import PDFCustomizer from '../components/reports/PDFCustomizer';

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
        fields: {
            Forum: ['name', 'type', 'members', 'key_themes'],
            Event: ['name', 'event_type', 'start_date', 'location', 'status'],
            KeyActor: ['name', 'type', 'country', 'role', 'strategic_importance']
        },
        advancedFilters: [],
        pdfConfig: {
            title: lang === 'pt' ? 'Relatório SSOT' : 'SSOT Report',
            orientation: 'portrait',
            fontSize: 'medium',
            includeHeader: true,
            includeFooter: true,
            includeDate: true,
            includeAuthor: true,
            colorScheme: 'default',
            logoPosition: 'top-left'
        }
    });

    const handleEntityToggle = (entity) => {
        setConfig(prev => ({
            ...prev,
            entities: { ...prev.entities, [entity]: !prev.entities[entity] }
        }));
    };

    const selectedEntities = Object.keys(config.entities).filter(e => config.entities[e]);

    const exportCSV = async () => {
        try {
            const response = await base44.functions.invoke('generateSSOTReport', {
                entities: selectedEntities,
                filters: config.advancedFilters,
                fields: config.fields
            });

            if (!response.data?.data) return;
            const reportData = response.data.data;

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
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toast.error(lang === 'pt' ? 'Erro ao exportar CSV' : 'Error exporting CSV');
        }
    };

    const exportPDF = async () => {
        try {
            const response = await base44.functions.invoke('generateSSOTReport', {
                entities: selectedEntities,
                filters: config.advancedFilters,
                fields: config.fields
            });

            if (!response.data?.data) return;

            const pdfResponse = await base44.functions.invoke('exportSSOTReportPDF', {
                reportData: response.data.data,
                pdfConfig: config.pdfConfig,
                lang
            });

            if (pdfResponse.data?.pdf_url) {
                window.open(pdfResponse.data.pdf_url, '_blank');
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

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Entity Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Wand2 className="w-5 h-5 text-[#002D62]" />
                                    {t.selectEntities}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="Forum"
                                        checked={config.entities.Forum}
                                        onCheckedChange={() => handleEntityToggle('Forum')}
                                    />
                                    <Label htmlFor="Forum" className="cursor-pointer text-sm">
                                        {t.forums}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="Event"
                                        checked={config.entities.Event}
                                        onCheckedChange={() => handleEntityToggle('Event')}
                                    />
                                    <Label htmlFor="Event" className="cursor-pointer text-sm">
                                        {t.events}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="KeyActor"
                                        checked={config.entities.KeyActor}
                                        onCheckedChange={() => handleEntityToggle('KeyActor')}
                                    />
                                    <Label htmlFor="KeyActor" className="cursor-pointer text-sm">
                                        {t.keyActors}
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Report Builder with Drag-Drop */}
                        {selectedEntities.length > 0 && (
                            <ReportBuilder
                                selectedEntities={selectedEntities}
                                selectedFields={config.fields}
                                onFieldsChange={(fields) => setConfig(prev => ({ ...prev, fields }))}
                                lang={lang}
                            />
                        )}

                        {/* Advanced Filters */}
                        {selectedEntities.length > 0 && (
                            <AdvancedFilters
                                selectedEntities={selectedEntities}
                                filters={config.advancedFilters}
                                onFiltersChange={(filters) => setConfig(prev => ({ ...prev, advancedFilters: filters }))}
                                lang={lang}
                            />
                        )}

                        {/* PDF Customizer */}
                        <PDFCustomizer
                            config={config.pdfConfig}
                            onConfigChange={(pdfConfig) => setConfig(prev => ({ ...prev, pdfConfig }))}
                            lang={lang}
                        />
                    </div>

                    {/* Real-Time Report Preview */}
                    <div className="lg:col-span-3 lg:sticky lg:top-6 h-fit">
                        <ReportPreview
                            config={config}
                            onExportCSV={exportCSV}
                            onExportPDF={exportPDF}
                            lang={lang}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}