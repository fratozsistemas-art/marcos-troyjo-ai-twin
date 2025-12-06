import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import DocumentSelector from '@/components/documents/DocumentSelector';

export default function InterviewPrep() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        interviewer_profile: '',
        topic: '',
        context: ''
    });
    const [selectedDocuments, setSelectedDocuments] = useState([]);

    const translations = {
        pt: {
            title: 'Preparação para Entrevista',
            subtitle: 'Prepare-se para entrevistas com análise de perguntas prováveis e respostas sugeridas',
            back: 'Voltar',
            interviewer: 'Perfil do Entrevistador',
            interviewerPlaceholder: 'Ex: Jornalista especializado em economia, CNN Brasil',
            topic: 'Tópico da Entrevista',
            topicPlaceholder: 'Ex: Futuro dos BRICS, Competitividade brasileira',
            context: 'Contexto Adicional',
            contextPlaceholder: 'Informações relevantes sobre o evento, programa, ou pontos específicos...',
            prepare: 'Gerar Preparação',
            preparing: 'Preparando...',
            newPrep: 'Nova Preparação'
        },
        en: {
            title: 'Interview Preparation',
            subtitle: 'Prepare for interviews with probable questions analysis and suggested answers',
            back: 'Back',
            interviewer: 'Interviewer Profile',
            interviewerPlaceholder: 'E.g.: Economics journalist, CNN Brasil',
            topic: 'Interview Topic',
            topicPlaceholder: 'E.g.: Future of BRICS, Brazilian competitiveness',
            context: 'Additional Context',
            contextPlaceholder: 'Relevant information about the event, program, or specific points...',
            prepare: 'Generate Preparation',
            preparing: 'Preparing...',
            newPrep: 'New Preparation'
        }
    };

    const t = translations[lang];

    const handlePrepare = async () => {
        if (!formData.topic) {
            alert(lang === 'pt' ? 'Adicione o tópico da entrevista' : 'Add interview topic');
            return;
        }

        setLoading(true);
        try {
            const fileUrls = selectedDocuments.map(d => d.file_url).filter(Boolean);

            const response = await base44.functions.invoke('prepareInterview', {
                interviewer_profile: formData.interviewer_profile,
                topic: formData.topic,
                context: formData.context,
                file_urls: fileUrls.length > 0 ? fileUrls : undefined
            });

            setResult(response.data);

            // Save to history
            await base44.entities.AIHistory.create({
                function_type: 'interview',
                title: formData.topic || 'Preparação de Entrevista',
                inputs: formData,
                outputs: response.data,
                documents_used: selectedDocuments.map(d => ({
                    id: d.id,
                    title: d.title,
                    file_url: d.file_url
                }))
            });
        } catch (error) {
            console.error('Error preparing interview:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                    <MessageSquare className="w-5 h-5" />
                                    {t.title}
                                </CardTitle>
                                <CardDescription>{t.subtitle}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>{t.topic} *</Label>
                                    <Input
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder={t.topicPlaceholder}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t.interviewer}</Label>
                                    <Input
                                        value={formData.interviewer_profile}
                                        onChange={(e) => setFormData({ ...formData, interviewer_profile: e.target.value })}
                                        placeholder={t.interviewerPlaceholder}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t.context}</Label>
                                    <Textarea
                                        value={formData.context}
                                        onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                                        placeholder={t.contextPlaceholder}
                                        className="min-h-24"
                                    />
                                </div>

                                <Button
                                    onClick={handlePrepare}
                                    disabled={loading || !formData.topic}
                                    className="w-full bg-[#002D62] hover:bg-[#001d42]"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            {t.preparing}
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare className="w-5 h-5 mr-2" />
                                            {t.prepare}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        <DocumentSelector
                            selectedDocuments={selectedDocuments}
                            onSelectionChange={setSelectedDocuments}
                            lang={lang}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <Button onClick={() => setResult(null)} variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {t.newPrep}
                        </Button>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">Preparação Completa</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {result.interviewer_profile && (
                                    <div>
                                        <h3 className="font-semibold text-[#002D62] mb-3">Perfil do Entrevistador</h3>
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                            <p className="text-sm text-[#333F48] leading-relaxed">{result.interviewer_profile}</p>
                                        </div>
                                    </div>
                                )}

                                {result.probable_questions && (
                                    <div>
                                        <h3 className="font-semibold text-[#002D62] mb-3">Perguntas Prováveis</h3>
                                        <div className="space-y-4">
                                            {result.probable_questions.map((q, index) => (
                                                <Card key={index}>
                                                    <CardContent className="pt-6">
                                                        <p className="font-medium text-[#333F48] mb-3">{q.question}</p>
                                                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                                            <p className="text-sm font-medium text-[#00654A] mb-2">Resposta Sugerida:</p>
                                                            <p className="text-sm text-[#333F48] leading-relaxed">{q.suggested_answer}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.key_messages && (
                                    <div>
                                        <h3 className="font-semibold text-[#002D62] mb-3">Mensagens-Chave</h3>
                                        <div className="space-y-2">
                                            {result.key_messages.map((msg, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                    <span className="text-[#B8860B] font-bold">{index + 1}</span>
                                                    <p className="text-sm text-[#333F48]">{msg}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.red_lines && result.red_lines.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-red-700 mb-3">⚠️ Red Lines (Evitar)</h3>
                                        <div className="space-y-2">
                                            {result.red_lines.map((line, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                    <p className="text-sm text-red-900">{line}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}