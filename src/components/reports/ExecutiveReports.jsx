import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, Loader2, FileCheck, Target, TrendingUp, FileSpreadsheet, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx';
import InlineFeedback from '@/components/feedback/InlineFeedback';

const translations = {
    pt: {
        title: 'Relatórios Executivos',
        description: 'Gerar análises estratégicas formatadas com o Modelo Mental v2.4',
        scenario: 'Cenário ou Pergunta Estratégica',
        scenarioPlaceholder: 'Ex: Impacto das tarifas da UE sobre exportações brasileiras de aço verde em 2026',
        reportType: 'Tipo de Relatório',
        template: 'Template',
        format: 'Formato',
        sections: 'Seções a Incluir',
        selectAll: 'Selecionar todas',
        selectDocuments: 'Documentos Base (opcional)',
        generate: 'Gerar Relatório',
        generating: 'Gerando...',
        types: {
            risk_opportunity: 'Análise de Risco/Oportunidade',
            strategic_vectors: 'Vetores Estratégicos',
            general: 'Análise Geral'
        },
        templates: {
            executive_summary: 'Sumário Executivo (conciso)',
            complete: 'Análise Completa'
        },
        formats: {
            pdf: 'PDF',
            docx: 'Word (DOCX)',
            markdown: 'Markdown'
        },
        sectionsList: {
            risk_opportunity: [
                'O QUE MUDOU?',
                'QUEM GANHA?',
                'QUEM PERDE?',
                'ESPAÇO PARA O BRASIL',
                'TIMING E AÇÃO'
            ],
            strategic_vectors: [
                'CONTEXTO GLOBAL',
                'FLUXOS E REALINHAMENTOS',
                'RISCOS E OPORTUNIDADES',
                'IMPLICAÇÕES BRASIL',
                'PRESCRIÇÃO ESTRATÉGICA'
            ]
        }
    },
    en: {
        title: 'Executive Reports',
        description: 'Generate formatted strategic analyses with Mental Model v2.4',
        scenario: 'Scenario or Strategic Question',
        scenarioPlaceholder: 'e.g., Impact of EU tariffs on Brazilian green steel exports in 2026',
        reportType: 'Report Type',
        template: 'Template',
        format: 'Format',
        sections: 'Sections to Include',
        selectAll: 'Select all',
        selectDocuments: 'Base Documents (optional)',
        generate: 'Generate Report',
        generating: 'Generating...',
        types: {
            risk_opportunity: 'Risk/Opportunity Analysis',
            strategic_vectors: 'Strategic Vectors',
            general: 'General Analysis'
        },
        templates: {
            executive_summary: 'Executive Summary (concise)',
            complete: 'Complete Analysis'
        },
        formats: {
            pdf: 'PDF',
            docx: 'Word (DOCX)',
            markdown: 'Markdown'
        },
        sectionsList: {
            risk_opportunity: [
                'WHAT CHANGED?',
                'WHO WINS?',
                'WHO LOSES?',
                'SPACE FOR BRAZIL',
                'TIMING AND ACTION'
            ],
            strategic_vectors: [
                'GLOBAL CONTEXT',
                'FLOWS AND REALIGNMENTS',
                'RISKS AND OPPORTUNITIES',
                'BRAZIL IMPLICATIONS',
                'STRATEGIC PRESCRIPTION'
            ]
        }
    }
};

export default function ExecutiveReports({ lang = 'pt' }) {
    const [scenario, setScenario] = useState('');
    const [reportType, setReportType] = useState('risk_opportunity');
    const [template, setTemplate] = useState('complete');
    const [format, setFormat] = useState('pdf');
    const [selectedSections, setSelectedSections] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [reportId, setReportId] = useState(null);
    const t = translations[lang];

    React.useEffect(() => {
        loadDocuments();
    }, []);

    React.useEffect(() => {
        // Auto-select all sections when report type changes
        if (t.sectionsList[reportType]) {
            setSelectedSections([...t.sectionsList[reportType]]);
        } else {
            setSelectedSections([]);
        }
    }, [reportType]);

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
                template,
                sections: template === 'complete' ? selectedSections : [],
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
                toast.success(lang === 'pt' ? 'Relatório PDF gerado!' : 'PDF report generated!');
            } else if (format === 'docx') {
                // Generate DOCX client-side
                await generateDOCXClientSide(response.data);
                toast.success(lang === 'pt' ? 'Relatório DOCX gerado!' : 'DOCX report generated!');
            } else {
                setResult(response.data.content);
                setReportId(`report_${Date.now()}`);
                toast.success(lang === 'pt' ? 'Análise concluída!' : 'Analysis complete!');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar relatório' : 'Error generating report');
        } finally {
            setGenerating(false);
        }
    };

    const generateDOCXClientSide = async (data) => {
        const { content, scenario, user: userName, sources, template: tpl, timestamp } = data;
        
        const paragraphs = [];

        // Title
        paragraphs.push(
            new Paragraph({
                text: 'RELATÓRIO EXECUTIVO',
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 }
            })
        );

        // Metadata
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Template: ', bold: true, color: '8B1538' }),
                    new TextRun(tpl === 'executive_summary' ? 'Sumário Executivo' : 'Análise Completa')
                ],
                spacing: { after: 100 }
            })
        );

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Gerado em: ', bold: true }),
                    new TextRun(new Date(timestamp).toLocaleString('pt-BR'))
                ],
                spacing: { after: 100 }
            })
        );

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: 'Por: ', bold: true }),
                    new TextRun(userName)
                ],
                spacing: { after: 400 }
            })
        );

        // Scenario
        paragraphs.push(
            new Paragraph({
                text: 'CENÁRIO',
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 200 }
            })
        );

        paragraphs.push(
            new Paragraph({
                text: scenario,
                spacing: { after: 400 }
            })
        );

        // Analysis content
        const lines = content.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('# ')) {
                paragraphs.push(
                    new Paragraph({
                        text: line.replace('# ', ''),
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    })
                );
            } else if (line.startsWith('## ')) {
                paragraphs.push(
                    new Paragraph({
                        text: line.replace('## ', ''),
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 250, after: 150 }
                    })
                );
            } else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                paragraphs.push(
                    new Paragraph({
                        text: line.replace(/^[•\-]\s*/, ''),
                        bullet: { level: 0 },
                        spacing: { after: 100 }
                    })
                );
            } else if (line.trim()) {
                paragraphs.push(
                    new Paragraph({
                        text: line,
                        spacing: { after: 150 }
                    })
                );
            }
        }

        // Sources
        if (sources && sources.length > 0) {
            paragraphs.push(
                new Paragraph({
                    text: 'FONTES CONSULTADAS',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 }
                })
            );

            sources.forEach((source, idx) => {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${idx + 1}. ${source.document_name}`, bold: true }),
                            new TextRun(` (${(source.similarity * 100).toFixed(0)}% relevância)`)
                        ],
                        spacing: { after: 100 }
                    })
                );
            });
        }

        // Footer
        paragraphs.push(
            new Paragraph({
                text: 'Troyjo Digital Twin v2.4 | Modelo Mental Superset',
                alignment: AlignmentType.CENTER,
                spacing: { before: 400 }
            })
        );

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(1),
                            right: convertInchesToTwip(1),
                            bottom: convertInchesToTwip(1),
                            left: convertInchesToTwip(1)
                        }
                    }
                },
                children: paragraphs
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_executivo_${Date.now()}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    const handleCopyMarkdown = () => {
        navigator.clipboard.writeText(result);
        toast.success(lang === 'pt' ? 'Copiado!' : 'Copied!');
    };

    const toggleSection = (section) => {
        setSelectedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const toggleAllSections = () => {
        const allSections = t.sectionsList[reportType] || [];
        if (selectedSections.length === allSections.length) {
            setSelectedSections([]);
        } else {
            setSelectedSections([...allSections]);
        }
    };

    const availableSections = t.sectionsList[reportType] || [];

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

                {/* Report Type & Template */}
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

                    <div>
                        <Label className="text-sm font-medium text-[#333F48] mb-2 block">
                            {t.template}
                        </Label>
                        <Select value={template} onValueChange={setTemplate}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="executive_summary">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {t.templates.executive_summary}
                                    </div>
                                </SelectItem>
                                <SelectItem value="complete">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4" />
                                        {t.templates.complete}
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Sections Selection - Only for Complete template */}
                {template === 'complete' && availableSections.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-[#333F48]">
                                {t.sections}
                            </Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleAllSections}
                                className="h-7 text-xs"
                            >
                                {t.selectAll}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {availableSections.map((section) => (
                                <label
                                    key={section}
                                    className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={selectedSections.includes(section)}
                                        onCheckedChange={() => toggleSection(section)}
                                    />
                                    <span className="text-xs text-[#333F48]">{section}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Format */}
                <div>
                    <Label className="text-sm font-medium text-[#333F48] mb-2 block">
                        {t.format}
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                        {['pdf', 'docx', 'markdown'].map((fmt) => (
                            <Button
                                key={fmt}
                                variant={format === fmt ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFormat(fmt)}
                                className={format === fmt ? "bg-[#002D62]" : ""}
                            >
                                {fmt === 'docx' && <FileSpreadsheet className="w-4 h-4 mr-1" />}
                                {t.formats[fmt]}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Document Selection */}
                {documents.length > 0 && (
                    <div>
                        <Label className="text-sm font-medium text-[#333F48] mb-2 block">
                            {t.selectDocuments}
                        </Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {documents.map((doc) => (
                                <label
                                    key={doc.id}
                                    className="flex items-center gap-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                                >
                                    <Checkbox
                                        checked={selectedDocs.includes(doc.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedDocs([...selectedDocs, doc.id]);
                                            } else {
                                                setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                                            }
                                        }}
                                    />
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-[#333F48] flex-1 truncate">{doc.name}</span>
                                    <span className="text-xs text-gray-500">
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
                    disabled={generating || !scenario.trim() || (template === 'complete' && selectedSections.length === 0)}
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
                    <div className="mt-4 space-y-3">
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
                        
                        {/* Report Feedback */}
                        {reportId && (
                            <div className="p-4 rounded-lg border border-gray-200 bg-white">
                                <Label className="text-sm font-medium text-[#002D62] mb-3 block">
                                    {lang === 'pt' ? 'Avaliar relatório' : 'Rate report'}
                                </Label>
                                <InlineFeedback
                                    conversationId={reportId}
                                    messageIndex={0}
                                    messageContent={scenario}
                                    personaMode={reportType}
                                    usedRag={selectedDocs.length > 0}
                                    documentIds={selectedDocs}
                                    lang={lang}
                                />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}