import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Download, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import InteractiveChart from './InteractiveChart';
import { toast } from 'sonner';
import { useDebounce } from '@/components/optimization/useDebounce';

const translations = {
    pt: {
        title: 'Gerador de Relatórios com IA',
        subtitle: 'Descreva em linguagem natural o relatório que deseja criar',
        placeholder: 'Exemplo: "Análise das principais tendências geopolíticas dos últimos 3 meses" ou "Comparativo de riscos econômicos por região"',
        generate: 'Gerar Relatório',
        generating: 'Gerando...',
        insights: 'Insights Automáticos',
        recommendations: 'Recomendações',
        download: 'Baixar PDF',
        trend: 'Tendência',
        warning: 'Alerta',
        opportunity: 'Oportunidade'
    },
    en: {
        title: 'AI Report Generator',
        subtitle: 'Describe in natural language the report you want to create',
        placeholder: 'Example: "Analysis of main geopolitical trends from last 3 months" or "Comparative economic risks by region"',
        generate: 'Generate Report',
        generating: 'Generating...',
        insights: 'Automatic Insights',
        recommendations: 'Recommendations',
        download: 'Download PDF',
        trend: 'Trend',
        warning: 'Warning',
        opportunity: 'Opportunity'
    }
};

const insightIcons = {
    trend: TrendingUp,
    warning: AlertTriangle,
    opportunity: Lightbulb
};

const insightColors = {
    trend: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-red-100 text-red-800 border-red-200',
    opportunity: 'bg-green-100 text-green-800 border-green-200'
};

export default function AIReportGenerator({ lang = 'pt' }) {
    const [request, setRequest] = useState('');
    const [report, setReport] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const t = translations[lang];
    const debouncedRequest = useDebounce(request, 500);

    const handleGenerate = async () => {
        if (!request.trim()) return;

        setIsGenerating(true);
        try {
            const response = await base44.functions.invoke('generateAIReport', {
                request: request.trim(),
                entities: [] // Auto-detect
            });

            setReport(response.data);
            toast.success(lang === 'pt' ? 'Relatório gerado!' : 'Report generated!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar relatório' : 'Error generating report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!report) return;

        try {
            const response = await base44.functions.invoke('exportReportPDF', {
                report_id: report.id
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${report.title}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error downloading:', error);
            toast.error(lang === 'pt' ? 'Erro ao baixar' : 'Error downloading');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        {t.title}
                    </CardTitle>
                    <CardDescription>{t.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                        placeholder={t.placeholder}
                        rows={4}
                        className="resize-none"
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={!request.trim() || isGenerating}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.generating}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t.generate}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {report && (
                <>
                    {/* Report Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{report.title}</CardTitle>
                                    <CardDescription className="mt-2">{report.summary}</CardDescription>
                                </div>
                                <Button onClick={handleDownload} variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    {t.download}
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Insights */}
                    {report.insights && report.insights.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t.insights}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {report.insights.map((insight, idx) => {
                                        const Icon = insightIcons[insight.type] || Lightbulb;
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-start gap-3 p-4 rounded-lg border ${insightColors[insight.type]}`}
                                            >
                                                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm leading-relaxed">{insight.message}</p>
                                                    {insight.confidence && (
                                                        <Badge variant="outline" className="mt-2">
                                                            {Math.round(insight.confidence * 100)}% {lang === 'pt' ? 'confiança' : 'confidence'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Report Sections with Charts */}
                    {report.sections && report.sections.map((section, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>
                                {section.chart_data && (
                                    <InteractiveChart
                                        type={section.chart_type}
                                        data={section.chart_data}
                                        title={section.title}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Recommendations */}
                    {report.recommendations && report.recommendations.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">{t.recommendations}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {report.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm text-gray-700">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}