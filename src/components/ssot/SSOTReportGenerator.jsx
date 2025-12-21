import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function SSOTReportGenerator({ selectedIndicator, selectedCountries, lang = 'pt' }) {
    const [reportType, setReportType] = useState('executive');
    const [generating, setGenerating] = useState(false);
    const [report, setReport] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const t = {
        pt: {
            title: 'Gerar Relatório AI',
            executive: 'Resumo Executivo',
            technical: 'Relatório Técnico',
            generate: 'Gerar',
            generating: 'Gerando...',
            download: 'Baixar PDF',
            reportTitle: 'Relatório Gerado',
            sources: 'Fontes',
            dataPoints: 'Pontos de Dados'
        },
        en: {
            title: 'Generate AI Report',
            executive: 'Executive Summary',
            technical: 'Technical Report',
            generate: 'Generate',
            generating: 'Generating...',
            download: 'Download PDF',
            reportTitle: 'Generated Report',
            sources: 'Sources',
            dataPoints: 'Data Points'
        }
    }[lang];

    const handleGenerate = async () => {
        if (!selectedIndicator || selectedCountries.length === 0) {
            toast.error(lang === 'pt' ? 'Selecione indicador e países' : 'Select indicator and countries');
            return;
        }

        setGenerating(true);
        try {
            const response = await base44.functions.invoke('generateSSOTReport', {
                indicator: selectedIndicator,
                countries: selectedCountries,
                startYear: 2018,
                endYear: 2023,
                reportType: reportType
            });

            if (response.data.success) {
                setReport(response.data.report);
                setDialogOpen(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar relatório' : 'Error generating report');
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!report) return;
        
        const markdown = `# ${report.title}\n\n**Tipo:** ${report.type}\n**Período:** ${report.period}\n**Países:** ${report.countries.join(', ')}\n**Gerado em:** ${new Date(report.generated_at).toLocaleString()}\n\n---\n\n${report.content}\n\n---\n\n**Fontes:** ${report.sources.join(', ')}\n**Pontos de dados:** ${report.data_points}`;
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <Sparkles className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="executive">{t.executive}</SelectItem>
                            <SelectItem value="technical">{t.technical}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerate} disabled={generating} className="w-full">
                        {generating ? (
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
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>{t.reportTitle}</span>
                            <Button onClick={handleDownload} size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                {t.download}
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    {report && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Badge>{report.type}</Badge>
                                <Badge variant="outline">{report.period}</Badge>
                                <Badge variant="outline">{t.dataPoints}: {report.data_points}</Badge>
                            </div>
                            <div className="prose prose-sm max-w-none">
                                <div className="whitespace-pre-wrap">{report.content}</div>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">{t.sources}:</p>
                                <div className="flex flex-wrap gap-2">
                                    {report.sources.map((source, idx) => (
                                        <Badge key={idx} variant="secondary">{source}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}