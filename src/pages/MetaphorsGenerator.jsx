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
import { ArrowLeft, Loader2, Sparkles, Upload, X } from 'lucide-react';
import MetaphorVisualizer from '@/components/metaphors/MetaphorVisualizer';
import DocumentSelector from '@/components/documents/DocumentSelector';

export default function MetaphorsGenerator() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        context: '',
        topic: '',
        audience: 'Executivos C-level',
        format: 'Metáforas, storytelling e analogias'
    });
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);

    const translations = {
        pt: {
            title: 'Gerador de Metáforas Troyjo',
            subtitle: 'Crie ferramentas de comunicação visual e narrativa para executivos',
            back: 'Voltar',
            context: 'Contexto',
            contextPlaceholder: 'Descreva o cenário, tema ou questão que deseja comunicar...',
            topic: 'Tópico Principal',
            topicPlaceholder: 'Ex: Competitividade brasileira, BRICS, Cadeias globais de valor',
            audience: 'Audiência',
            format: 'Formato Desejado',
            uploadFiles: 'Upload de Documentos',
            uploadDesc: 'Adicione documentos para contexto adicional',
            generate: 'Gerar Ferramentas Visuais',
            generating: 'Gerando...',
            removeFile: 'Remover'
        },
        en: {
            title: 'Troyjo Metaphor Generator',
            subtitle: 'Create visual communication tools and narratives for executives',
            back: 'Back',
            context: 'Context',
            contextPlaceholder: 'Describe the scenario, theme or issue you want to communicate...',
            topic: 'Main Topic',
            topicPlaceholder: 'E.g.: Brazilian competitiveness, BRICS, Global value chains',
            audience: 'Audience',
            format: 'Desired Format',
            uploadFiles: 'Upload Documents',
            uploadDesc: 'Add documents for additional context',
            generate: 'Generate Visual Tools',
            generating: 'Generating...',
            removeFile: 'Remove'
        }
    };

    const t = translations[lang];

    const handleFileUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        setUploading(true);

        try {
            const uploadedFiles = await Promise.all(
                selectedFiles.map(async (file) => {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    return { name: file.name, url: file_url };
                })
            );

            setFiles([...files, ...uploadedFiles]);
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!formData.context && files.length === 0 && selectedDocuments.length === 0) {
            alert(lang === 'pt' ? 'Adicione contexto ou documentos' : 'Add context or documents');
            return;
        }

        setLoading(true);
        try {
            const allFileUrls = [
                ...files.map(f => f.url),
                ...selectedDocuments.map(d => d.file_url)
            ].filter(Boolean);

            const response = await base44.functions.invoke('generateTroyjoMetaphors', {
                context: formData.context,
                topic: formData.topic,
                audience: formData.audience,
                format: formData.format,
                file_urls: allFileUrls.length > 0 ? allFileUrls : undefined
            });

            setResult(response.data.content);

            // Save to history
            await base44.entities.AIHistory.create({
                function_type: 'metaphors',
                title: formData.topic || 'Geração de Metáforas',
                inputs: formData,
                outputs: response.data.content,
                documents_used: selectedDocuments.map(d => ({
                    id: d.id,
                    title: d.title,
                    file_url: d.file_url
                }))
            });
        } catch (error) {
            console.error('Error generating metaphors:', error);
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                <Sparkles className="w-5 h-5" />
                                {t.title}
                            </CardTitle>
                            <CardDescription>{t.subtitle}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t.context}</Label>
                                <Textarea
                                    value={formData.context}
                                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                                    placeholder={t.contextPlaceholder}
                                    className="min-h-32"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t.topic}</Label>
                                    <Input
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        placeholder={t.topicPlaceholder}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t.audience}</Label>
                                    <Select
                                        value={formData.audience}
                                        onValueChange={(value) => setFormData({ ...formData, audience: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Executivos C-level">Executivos C-level</SelectItem>
                                            <SelectItem value="Conselho de Administração">Conselho de Administração</SelectItem>
                                            <SelectItem value="Mídia e Analistas">Mídia e Analistas</SelectItem>
                                            <SelectItem value="Acadêmicos">Acadêmicos</SelectItem>
                                            <SelectItem value="Público Geral">Público Geral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DocumentSelector
                                selectedDocuments={selectedDocuments}
                                onSelectionChange={setSelectedDocuments}
                                lang={lang}
                            />

                            <div className="space-y-2">
                                <Label>{t.uploadFiles}</Label>
                                <CardDescription>{t.uploadDesc}</CardDescription>
                                <div className="flex flex-col gap-3">
                                    <label className="cursor-pointer">
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#002D62]/50 transition-colors text-center">
                                            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600">
                                                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept=".pdf,.docx,.txt,.doc"
                                        />
                                    </label>

                                    {files.length > 0 && (
                                        <div className="space-y-2">
                                            {files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <span className="text-sm text-gray-700">{file.name}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={loading || (!formData.context && files.length === 0 && selectedDocuments.length === 0)}
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
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        {t.generate}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Button
                            onClick={() => setResult(null)}
                            variant="outline"
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Nova Geração
                        </Button>
                        <MetaphorVisualizer data={result} lang={lang} />
                    </div>
                )}
            </main>
        </div>
    );
}