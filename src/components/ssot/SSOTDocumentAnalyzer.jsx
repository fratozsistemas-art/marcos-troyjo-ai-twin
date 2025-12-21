import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, FileCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SSOTDocumentAnalyzer({ onFactsExtracted, lang = 'pt' }) {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const t = {
        pt: {
            title: 'Analisar Documento',
            description: 'Upload de relatórios para extração automática de fatos',
            upload: 'Upload de Documento',
            analyzing: 'Analisando...',
            extracted: 'Fatos Extraídos',
            saved: 'Salvos no SSOT',
            errors: 'Erros',
            summary: 'Resumo'
        },
        en: {
            title: 'Analyze Document',
            description: 'Upload reports for automatic fact extraction',
            upload: 'Upload Document',
            analyzing: 'Analyzing...',
            extracted: 'Facts Extracted',
            saved: 'Saved to SSOT',
            errors: 'Errors',
            summary: 'Summary'
        }
    }[lang];

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setResult(null);

        try {
            // Upload file
            const uploadResult = await base44.integrations.Core.UploadFile({ file });
            
            // Analyze document
            const response = await base44.functions.invoke('analyzeSSOTDocument', {
                file_url: uploadResult.file_url
            });

            if (response.data.success) {
                setResult(response.data);
                toast.success(`${response.data.facts_saved} fatos adicionados ao SSOT!`);
                if (onFactsExtracted) onFactsExtracted();
            }
        } catch (error) {
            console.error('Error analyzing document:', error);
            toast.error(lang === 'pt' ? 'Erro ao analisar documento' : 'Error analyzing document');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <FileCheck className="w-5 h-5" />
                    {t.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{t.description}</p>
                
                <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="doc-analyzer-upload"
                />
                <Button
                    onClick={() => document.getElementById('doc-analyzer-upload')?.click()}
                    disabled={uploading}
                    className="w-full"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t.analyzing}
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            {t.upload}
                        </>
                    )}
                </Button>

                {result && (
                    <div className="space-y-3 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-xs text-blue-700 mb-1">{t.extracted}</p>
                                <p className="text-2xl font-bold text-blue-900">{result.facts_extracted}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-xs text-green-700 mb-1">{t.saved}</p>
                                <p className="text-2xl font-bold text-green-900">{result.facts_saved}</p>
                            </div>
                            {result.errors?.length > 0 && (
                                <div className="bg-red-50 rounded-lg p-3">
                                    <p className="text-xs text-red-700 mb-1">{t.errors}</p>
                                    <p className="text-2xl font-bold text-red-900">{result.errors.length}</p>
                                </div>
                            )}
                        </div>
                        
                        {result.document_summary && (
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs font-semibold text-gray-700 mb-2">{t.summary}:</p>
                                <p className="text-sm text-gray-600">{result.document_summary}</p>
                            </div>
                        )}

                        {result.saved_facts && result.saved_facts.length > 0 && (
                            <div className="space-y-2">
                                {result.saved_facts.slice(0, 5).map((fact, idx) => (
                                    <div key={idx} className="text-xs border rounded p-2">
                                        <p className="font-semibold text-gray-800">{fact.indicator_name}</p>
                                        <p className="text-gray-600">{fact.value} • {fact.country} • {fact.year}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}