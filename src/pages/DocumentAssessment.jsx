import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, FileCheck, AlertCircle } from 'lucide-react';
import DocumentSelector from '@/components/documents/DocumentSelector';
import { Badge } from '@/components/ui/badge';

export default function DocumentAssessment() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [assessmentCriteria, setAssessmentCriteria] = useState('');
    const [selectedDocuments, setSelectedDocuments] = useState([]);

    const translations = {
        pt: {
            title: 'Avaliação de Documentos',
            subtitle: 'Avalie documentos sob a perspectiva Troyjo: análise estratégica, geoeconômica e de competitividade',
            back: 'Voltar',
            criteria: 'Critérios de Avaliação (Opcional)',
            criteriaPlaceholder: 'Ex: Viabilidade geopolítica, Alinhamento com competitividade brasileira, Impacto nos BRICS',
            assess: 'Avaliar Documentos',
            assessing: 'Avaliando...',
            newAssessment: 'Nova Avaliação',
            selectDocs: 'Selecione pelo menos um documento para avaliar'
        },
        en: {
            title: 'Document Assessment',
            subtitle: 'Assess documents from Troyjo perspective: strategic, geoeconomic and competitiveness analysis',
            back: 'Back',
            criteria: 'Assessment Criteria (Optional)',
            criteriaPlaceholder: 'E.g.: Geopolitical viability, Alignment with Brazilian competitiveness, Impact on BRICS',
            assess: 'Assess Documents',
            assessing: 'Assessing...',
            newAssessment: 'New Assessment',
            selectDocs: 'Select at least one document to assess'
        }
    };

    const t = translations[lang];

    const handleAssess = async () => {
        if (selectedDocuments.length === 0) {
            alert(t.selectDocs);
            return;
        }

        setLoading(true);
        try {
            const fileUrls = selectedDocuments.map(d => d.file_url).filter(Boolean);

            const response = await base44.functions.invoke('assessDocuments', {
                file_urls: fileUrls,
                assessment_criteria: assessmentCriteria
            });

            setResult(response.data);
        } catch (error) {
            console.error('Error assessing documents:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 8) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{t.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{t.subtitle}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {!result ? (
                    <div className="space-y-6">
                        <DocumentSelector
                            selectedDocuments={selectedDocuments}
                            onSelectionChange={setSelectedDocuments}
                            lang={lang}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                    <FileCheck className="w-5 h-5" />
                                    {t.title}
                                </CardTitle>
                                <CardDescription>{t.subtitle}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>{t.criteria}</Label>
                                    <Textarea
                                        value={assessmentCriteria}
                                        onChange={(e) => setAssessmentCriteria(e.target.value)}
                                        placeholder={t.criteriaPlaceholder}
                                        className="min-h-24"
                                    />
                                </div>

                                <Button
                                    onClick={handleAssess}
                                    disabled={loading || selectedDocuments.length === 0}
                                    className="w-full bg-[#002D62] hover:bg-[#001d42]"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            {t.assessing}
                                        </>
                                    ) : (
                                        <>
                                            <FileCheck className="w-5 h-5 mr-2" />
                                            {t.assess}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Button onClick={() => setResult(null)} variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {t.newAssessment}
                        </Button>

                        {result.assessments?.map((assessment, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-[#002D62]">{assessment.document_name}</CardTitle>
                                        <Badge className={`text-lg px-4 py-1 ${getScoreColor(assessment.overall_score)}`}>
                                            {assessment.overall_score}/10
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-[#002D62] mb-3">Resumo Executivo</h3>
                                        <p className="text-sm text-[#333F48] leading-relaxed">{assessment.executive_summary}</p>
                                    </div>

                                    {assessment.strengths && (
                                        <div>
                                            <h3 className="font-semibold text-green-700 mb-3">✅ Pontos Fortes</h3>
                                            <ul className="space-y-2">
                                                {assessment.strengths.map((strength, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-[#333F48]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                                                        {strength}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {assessment.weaknesses && (
                                        <div>
                                            <h3 className="font-semibold text-red-700 mb-3">⚠️ Pontos Fracos</h3>
                                            <ul className="space-y-2">
                                                {assessment.weaknesses.map((weakness, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-[#333F48]">
                                                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                        {weakness}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {assessment.recommendations && (
                                        <div>
                                            <h3 className="font-semibold text-[#002D62] mb-3">💡 Recomendações</h3>
                                            <ul className="space-y-2">
                                                {assessment.recommendations.map((rec, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-[#333F48]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-1.5 flex-shrink-0" />
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {assessment.troyjo_perspective && (
                                        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 border border-[#002D62]/10">
                                            <h3 className="font-semibold text-[#002D62] mb-2">🎯 Perspectiva Troyjo</h3>
                                            <p className="text-sm text-[#333F48] leading-relaxed italic">
                                                {assessment.troyjo_perspective}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}