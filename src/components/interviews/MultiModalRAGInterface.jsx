import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Link as LinkIcon, Upload, Search, Loader2, X, CheckCircle } from 'lucide-react';
import TranscriptResultCard from '@/components/interviews/TranscriptResultCard';
import { toast } from 'sonner';

export default function MultiModalRAGInterface({ lang = 'pt' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [externalDocs, setExternalDocs] = useState([]);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [urlInput, setUrlInput] = useState('');

    const t = {
        pt: {
            title: 'Busca Multi-Modal RAG',
            query: 'Sua pergunta',
            search: 'Buscar',
            addUrl: 'Adicionar URL',
            uploadFile: 'Upload Arquivo',
            externalSources: 'Fontes Externas',
            results: 'Resultados',
            crossRef: 'Correlações',
            corroborating: 'Pontos Corroborantes',
            conflicting: 'Pontos Conflitantes',
            complementary: 'Insights Complementares'
        },
        en: {
            title: 'Multi-Modal RAG Search',
            query: 'Your question',
            search: 'Search',
            addUrl: 'Add URL',
            uploadFile: 'Upload File',
            externalSources: 'External Sources',
            results: 'Results',
            crossRef: 'Cross-References',
            corroborating: 'Corroborating Points',
            conflicting: 'Conflicting Points',
            complementary: 'Complementary Insights'
        }
    };

    const text = t[lang];

    const handleAddUrl = async () => {
        if (!urlInput.trim()) return;

        setUploadingDoc(true);
        try {
            const response = await base44.functions.invoke('analyzeExternalDocument', {
                document_url: urlInput
            });

            if (response.data.success) {
                setExternalDocs([...externalDocs, {
                    type: 'url',
                    url: urlInput,
                    title: urlInput,
                    ...response.data
                }]);
                setUrlInput('');
                toast.success('URL adicionado');
            }
        } catch (error) {
            console.error('Error adding URL:', error);
            toast.error('Erro ao processar URL');
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingDoc(true);
        try {
            // Upload file
            const uploadResult = await base44.integrations.Core.UploadFile({ file });
            
            // Analyze
            const response = await base44.functions.invoke('analyzeExternalDocument', {
                file_url: uploadResult.file_url
            });

            if (response.data.success) {
                setExternalDocs([...externalDocs, {
                    type: 'file',
                    title: file.name,
                    url: uploadResult.file_url,
                    ...response.data
                }]);
                toast.success('Arquivo processado');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Erro ao processar arquivo');
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        setSearching(true);
        try {
            const response = await base44.functions.invoke('semanticSearchTranscripts', {
                query,
                max_results: 5,
                external_documents: externalDocs,
                include_external: externalDocs.length > 0
            });

            setResults(response.data);
        } catch (error) {
            console.error('Error searching:', error);
            toast.error('Erro na busca');
        } finally {
            setSearching(false);
        }
    };

    const removeDoc = (index) => {
        setExternalDocs(externalDocs.filter((_, i) => i !== index));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Search className="w-5 h-5" />
                    {text.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* External Sources */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{text.externalSources}:</h4>
                    <div className="flex gap-2">
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="https://exemplo.com/artigo"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                            />
                            <Button
                                onClick={handleAddUrl}
                                disabled={uploadingDoc || !urlInput.trim()}
                                size="sm"
                            >
                                <LinkIcon className="w-4 h-4" />
                            </Button>
                        </div>
                        <input
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="doc-upload"
                        />
                        <Button
                            onClick={() => document.getElementById('doc-upload')?.click()}
                            disabled={uploadingDoc}
                            size="sm"
                            variant="outline"
                        >
                            {uploadingDoc ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    {externalDocs.length > 0 && (
                        <div className="space-y-1">
                            {externalDocs.map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded p-2 text-sm">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span className="flex-1 truncate">{doc.title}</span>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeDoc(idx)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="space-y-2">
                    <Textarea
                        placeholder={text.query}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        rows={2}
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={searching || !query.trim()}
                        className="w-full"
                    >
                        {searching ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Buscando...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4 mr-2" />
                                {text.search}
                            </>
                        )}
                    </Button>
                </div>

                {/* Results */}
                {results && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">{text.results}</h4>
                            {results.sources_used && (
                                <div className="flex gap-2">
                                    <Badge variant="secondary">
                                        {results.sources_used.transcripts} entrevistas
                                    </Badge>
                                    {results.sources_used.external > 0 && (
                                        <Badge variant="secondary">
                                            {results.sources_used.external} externos
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>

                        <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                                {results.results?.map((result, idx) => (
                                    <TranscriptResultCard
                                        key={idx}
                                        result={result}
                                        query={query}
                                    />
                                ))}
                            </div>
                        </ScrollArea>

                        {/* Cross References */}
                        {results.cross_references && (
                            <Card className="bg-blue-50 border-blue-200">
                                <CardHeader>
                                    <CardTitle className="text-sm">{text.crossRef}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    {results.cross_references.corroborating_points?.length > 0 && (
                                        <div>
                                            <h5 className="font-semibold text-green-700 mb-1">
                                                {text.corroborating}:
                                            </h5>
                                            <ul className="space-y-1">
                                                {results.cross_references.corroborating_points.map((p, i) => (
                                                    <li key={i} className="text-gray-700">
                                                        • <strong>{p.topic}:</strong> {p.agreement}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {results.cross_references.conflicting_points?.length > 0 && (
                                        <div>
                                            <h5 className="font-semibold text-orange-700 mb-1">
                                                {text.conflicting}:
                                            </h5>
                                            <ul className="space-y-1">
                                                {results.cross_references.conflicting_points.map((p, i) => (
                                                    <li key={i} className="text-gray-700">
                                                        • <strong>{p.topic}:</strong>
                                                        <br />
                                                        <span className="ml-4 text-xs">
                                                            Troyjo: {p.troyjo_position}
                                                        </span>
                                                        <br />
                                                        <span className="ml-4 text-xs">
                                                            Externo: {p.external_position}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {results.cross_references.complementary_insights?.length > 0 && (
                                        <div>
                                            <h5 className="font-semibold text-blue-700 mb-1">
                                                {text.complementary}:
                                            </h5>
                                            <ul className="space-y-1">
                                                {results.cross_references.complementary_insights.map((insight, i) => (
                                                    <li key={i} className="text-gray-700">• {insight}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}