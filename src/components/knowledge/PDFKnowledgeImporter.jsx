import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Loader2, CheckCircle2, BookOpen, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Importar PDF para Base de Conhecimento',
        subtitle: 'Faça upload de PDFs e extraia conteúdo automaticamente',
        selectFile: 'Selecionar PDF',
        importType: 'Tipo de Importação',
        article: 'Artigo',
        document: 'Documento',
        studyModule: 'Módulo de Estudo',
        process: 'Processar',
        processing: 'Processando...',
        uploading: 'Enviando arquivo...',
        success: 'PDF importado com sucesso!',
        error: 'Erro ao processar PDF',
        dragDrop: 'Arraste um PDF ou clique para selecionar',
        extracting: 'Extraindo conteúdo...',
        creating: 'Criando entrada...'
    },
    en: {
        title: 'Import PDF to Knowledge Base',
        subtitle: 'Upload PDFs and extract content automatically',
        selectFile: 'Select PDF',
        importType: 'Import Type',
        article: 'Article',
        document: 'Document',
        studyModule: 'Study Module',
        process: 'Process',
        processing: 'Processing...',
        uploading: 'Uploading file...',
        success: 'PDF imported successfully!',
        error: 'Error processing PDF',
        dragDrop: 'Drag a PDF or click to select',
        extracting: 'Extracting content...',
        creating: 'Creating entry...'
    }
};

export default function PDFKnowledgeImporter({ lang = 'pt', onImportComplete }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [importType, setImportType] = useState('article');
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [result, setResult] = useState(null);
    const t = translations[lang];

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setResult(null);
        } else {
            toast.error(lang === 'pt' ? 'Selecione um arquivo PDF válido' : 'Select a valid PDF file');
        }
    };

    const handleProcess = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setProcessingStep(t.uploading);

        try {
            // Upload file
            const uploadResult = await base44.integrations.Core.UploadFile({ file: selectedFile });
            
            setIsUploading(false);
            setIsProcessing(true);
            setProcessingStep(t.extracting);

            // Process PDF
            const response = await base44.functions.invoke('processPDFToKnowledge', {
                file_url: uploadResult.file_url,
                import_type: importType
            });

            setProcessingStep(t.creating);

            if (response.data.success) {
                setResult(response.data);
                toast.success(t.success);
                onImportComplete?.(response.data.entity);
            } else {
                throw new Error('Processing failed');
            }

        } catch (error) {
            console.error('Error processing PDF:', error);
            toast.error(t.error);
        } finally {
            setIsUploading(false);
            setIsProcessing(false);
            setProcessingStep('');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-600" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* File Input */}
                <div>
                    <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-1">
                            {selectedFile ? selectedFile.name : t.dragDrop}
                        </p>
                        {selectedFile && (
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        )}
                    </label>
                </div>

                {/* Import Type */}
                <div>
                    <label className="text-sm font-medium mb-2 block">{t.importType}</label>
                    <Select value={importType} onValueChange={setImportType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="article">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {t.article}
                                </div>
                            </SelectItem>
                            <SelectItem value="document">
                                <div className="flex items-center gap-2">
                                    <FileCheck className="w-4 h-4" />
                                    {t.document}
                                </div>
                            </SelectItem>
                            <SelectItem value="study_module">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {t.studyModule}
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Process Button */}
                <Button
                    onClick={handleProcess}
                    disabled={!selectedFile || isUploading || isProcessing}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                    {isUploading || isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {processingStep}
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            {t.process}
                        </>
                    )}
                </Button>

                {/* Result */}
                {result && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium text-green-900 mb-1">
                                    {result.extraction_summary.title}
                                </p>
                                <div className="text-sm text-green-700 space-y-1">
                                    <p>{result.extraction_summary.sections_count} {lang === 'pt' ? 'seções extraídas' : 'sections extracted'}</p>
                                    {result.extraction_summary.tags && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {result.extraction_summary.tags.map((tag, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}