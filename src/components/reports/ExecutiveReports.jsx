import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Download, Loader2, FileCheck, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Relatórios Executivos',
        description: 'Gerar análises estratégicas formatadas com o Modelo Mental v2.4',
        scenario: 'Cenário ou Pergunta Estratégica',
        scenarioPlaceholder: 'Ex: Impacto das tarifas da UE sobre exportações brasileiras de aço verde em 2026',
        reportType: 'Tipo de Relatório',
        format: 'Formato',
        selectDocuments: 'Documentos Base (opcional)',
        generate: 'Gerar Relatório',
        generating: 'Gerando...',
        types: {
            risk_opportunity: 'Análise de Risco/Oportunidade',
            strategic_vectors: 'Vetores Estratégicos',
            general: 'Análise Geral'
        },
        formats: {
            pdf: 'PDF (download)',
            markdown: 'Markdown (texto)'
        }
    },
    en: {
        title: 'Executive Reports',
        description: 'Generate formatted strategic analyses with Mental Model v2.4',
        scenario: 'Scenario or Strategic Question',
        scenarioPlaceholder: 'e.g., Impact of EU tariffs on Brazilian green steel exports in 2026',
        reportType: 'Report Type',
        format: 'Format',
        selectDocuments: 'Base Documents (optional)',
        generate: 'Generate Report',
        generating: 'Generating...',
        types: {
            risk_opportunity: 'Risk/Opportunity Analysis',
            strategic_vectors: 'Strategic Vectors',
            general: 'General Analysis'
        },
        formats: {
            pdf: 'PDF (download)',
            markdown: 'Markdown (text)'
        }
    }
};

export default function ExecutiveReports({ lang = 'pt' }) {
    const [scenario, setScenario] = useState('');
    const [reportType, setReportType] = useState('risk_opportunity');
    const [format, setFormat] = useState('pdf');
    const [documents, setDocuments] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const t = translations[lang];

    React.useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const user = await base44.auth.me();
            const docs = await base44.entities.Document.filter({
                created_by: user.email
            });
            const indexedDocs = docs.filter(d => d.metadata?.indexed === true);
            setDocuments(indexedDocs);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    const handleGenerate = async () => {
        if (!scenario.trim()) {
            toast.error(lang === 'pt' ? 'Informe o cenário' : 'Provide scenario');
            return;
        }

        setGenerating(true);
        setResult(null);

        try {
            const response = await base44.functions.invoke('generateExecutiveReport', {
                scenario,
                report_type: reportType,
                document_ids: selectedDocs,
                format
            });

            if (format === 'pdf') {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `relatorio_executivo_${Date.now()}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                toast.success(lang === 'pt' ? 'Relatório gerado!' : 'Report generated!');
            } else {
                setResult(response.data.content);
                toast.success(lang === 'pt' ? 'Análise concluída!' : 'Analysis complete!');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar relatório' : 'Error generating report');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopyMarkdown = () => {
        navigator.clipboard.writeText(result);
        toast.success(lang === 'pt' ? 'Copiado!' : 'Copied!');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <FileCheck className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Scenario Input */}
                <div>
                    <Label className="text-sm font-medium text-[#333F48] mb-2 block">
                        {t.scenario}
                    </Label>
                    <Textarea
                        placeholder={t.scenarioPlaceholder}
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                </div>

                {/* Report Type */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-[#333F48] mb-2 block">
                            {t.reportType}
                        </Label>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="risk_opportunity">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        {t.types.risk_opportunity}
                                    </div>
                                </SelectItem>
                                <SelectItem value="strategic_vectors">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        {t.types.strategic_vectors}
                                    </div>
                                </SelectItem>
                                <SelectItem value="general">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {t.types.general}
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Format */}
                    <div>
                        <Label className="text-sm font-medium text-[#333F48] mb-2 block">
                            {t.format}
                        </Label>
                        <Select value={format} onValueChange={setFormat}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pdf">{t.formats.pdf}</SelectItem>
                                <SelectItem value="markdown">{t.formats.markdown}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Document Selection */}
                {documents.length > 0 && (
                    <div>
                        <Label className="text-sm font-medium text-[#333F48] mb-2 block">
                            {t.selectDocuments}
                        </Label>
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <label
                                    key={doc.id}
                                    className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.includes(doc.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedDocs([...selectedDocs, doc.id]);
                                            } else {
                                                setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-[#333F48]">{doc.name}</span>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {doc.metadata?.chunk_count} chunks
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generate Button */}
                <Button
                    onClick={handleGenerate}
                    disabled={generating || !scenario.trim()}
                    className="w-full bg-[#002D62] hover:bg-[#001d42]"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t.generating}
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            {t.generate}
                        </>
                    )}
                </Button>

                {/* Markdown Result */}
                {result && format === 'markdown' && (
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-[#002D62]">
                                {lang === 'pt' ? 'Resultado' : 'Result'}
                            </Label>
                            <Button size="sm" variant="outline" onClick={handleCopyMarkdown}>
                                {lang === 'pt' ? 'Copiar' : 'Copy'}
                            </Button>
                        </div>
                        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 max-h-96 overflow-y-auto">
                            <pre className="text-xs text-[#333F48] whitespace-pre-wrap font-mono">
                                {result}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}