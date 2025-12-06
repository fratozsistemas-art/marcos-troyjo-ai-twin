import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, FileText, Copy, Download } from 'lucide-react';
import DocumentSelector from '@/components/documents/DocumentSelector';
import ReactMarkdown from 'react-markdown';

export default function ArticleGenerator() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        topic: '',
        target_outlet: '',
        word_count: '800',
        angle: '',
        tone: 'analytical'
    });
    const [selectedDocuments, setSelectedDocuments] = useState([]);

    const translations = {
        pt: {
            title: 'Gerador de Artigos',
            subtitle: 'Gere artigos no estilo Troyjo para diferentes veículos e audiências',
            back: 'Voltar',
            topic: 'Tópico do Artigo',
            topicPlaceholder: 'Ex: A reconfiguração das cadeias globais de valor',
            outlet: 'Veículo de Publicação',
            outletPlaceholder: 'Ex: Valor Econômico, Foreign Affairs, Blog pessoal',
            wordCount: 'Número de Palavras',
            angle: 'Ângulo / Enfoque',
            anglePlaceholder: 'Ex: Perspectiva brasileira, Impacto nos BRICS',
            tone: 'Tom',
            generate: 'Gerar Artigo',
            generating: 'Gerando...',
            newArticle: 'Novo Artigo',
            copy: 'Copiar',
            download: 'Download',
            tones: {
                analytical: 'Analítico',
                diplomatic: 'Diplomático',
                provocative: 'Provocativo',
                educational: 'Educacional'
            }
        },
        en: {
            title: 'Article Generator',
            subtitle: 'Generate articles in Troyjo style for different outlets and audiences',
            back: 'Back',
            topic: 'Article Topic',
            topicPlaceholder: 'E.g.: The reconfiguration of global value chains',
            outlet: 'Publication Outlet',
            outletPlaceholder: 'E.g.: Valor Econômico, Foreign Affairs, Personal blog',
            wordCount: 'Word Count',
            angle: 'Angle / Focus',
            anglePlaceholder: 'E.g.: Brazilian perspective, Impact on BRICS',
            tone: 'Tone',
            generate: 'Generate Article',
            generating: 'Generating...',
            newArticle: 'New Article',
            copy: 'Copy',
            download: 'Download',
            tones: {
                analytical: 'Analytical',
                diplomatic: 'Diplomatic',
                provocative: 'Provocative',
                educational: 'Educational'
            }
        }
    };

    const t = translations[lang];

    const handleGenerate = async () => {
        if (!formData.topic) {
            alert(lang === 'pt' ? 'Adicione o tópico do artigo' : 'Add article topic');
            return;
        }

        setLoading(true);
        try {
            const fileUrls = selectedDocuments.map(d => d.file_url).filter(Boolean);

            const response = await base44.functions.invoke('generateArticle', {
                topic: formData.topic,
                target_outlet: formData.target_outlet,
                word_count: parseInt(formData.word_count),
                angle: formData.angle,
                tone: formData.tone,
                file_urls: fileUrls.length > 0 ? fileUrls : undefined
            });

            setResult(response.data);

            // Save to history
            await base44.entities.AIHistory.create({
                function_type: 'article',
                title: response.data.title || formData.topic,
                inputs: formData,
                outputs: response.data,
                documents_used: selectedDocuments.map(d => ({
                    id: d.id,
                    title: d.title,
                    file_url: d.file_url
                }))
            });
        } catch (error) {
            console.error('Error generating article:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result.article);
        alert(lang === 'pt' ? 'Copiado!' : 'Copied!');
    };

    const downloadArticle = () => {
        const blob = new Blob([result.article], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.topic.substring(0, 30).replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span>{t.back}</span>
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
                                    <FileText className="w-5 h-5" />
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

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t.outlet}</Label>
                                        <Input
                                            value={formData.target_outlet}
                                            onChange={(e) => setFormData({ ...formData, target_outlet: e.target.value })}
                                            placeholder={t.outletPlaceholder}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t.wordCount}</Label>
                                        <Select
                                            value={formData.word_count}
                                            onValueChange={(value) => setFormData({ ...formData, word_count: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="500">500</SelectItem>
                                                <SelectItem value="800">800</SelectItem>
                                                <SelectItem value="1200">1200</SelectItem>
                                                <SelectItem value="1500">1500</SelectItem>
                                                <SelectItem value="2000">2000</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t.angle}</Label>
                                        <Input
                                            value={formData.angle}
                                            onChange={(e) => setFormData({ ...formData, angle: e.target.value })}
                                            placeholder={t.anglePlaceholder}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>{t.tone}</Label>
                                        <Select
                                            value={formData.tone}
                                            onValueChange={(value) => setFormData({ ...formData, tone: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(t.tones).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={loading || !formData.topic}
                                    className="w-full bg-[#002D62] hover:bg-[#001d42]"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            {t.generating}
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-5 h-5 mr-2" />
                                            {t.generate}
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
                        <div className="flex items-center justify-between">
                            <Button onClick={() => setResult(null)} variant="outline" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t.newArticle}
                            </Button>
                            <div className="flex gap-2">
                                <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                                    <Copy className="w-4 h-4" />
                                    {t.copy}
                                </Button>
                                <Button onClick={downloadArticle} variant="outline" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    {t.download}
                                </Button>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">{result.title}</CardTitle>
                                {result.subtitle && (
                                    <CardDescription className="text-base">{result.subtitle}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-slate max-w-none">
                                    <ReactMarkdown>{result.article}</ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}