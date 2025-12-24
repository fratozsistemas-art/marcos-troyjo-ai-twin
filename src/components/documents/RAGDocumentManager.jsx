import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Upload, Loader2, Database, Trash2, Search, CheckCircle, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Documentos RAG',
        description: 'Gerenciar documentos indexados para busca vetorial',
        upload: 'Upload & Indexar',
        search: 'Buscar',
        indexed: 'Indexado',
        notIndexed: 'Não indexado',
        chunks: 'chunks',
        tokens: 'tokens',
        index: 'Indexar',
        delete: 'Excluir',
        indexing: 'Indexando...',
        searching: 'Buscando...',
        noResults: 'Nenhum resultado',
        similarity: 'Similaridade',
        generateSummary: 'Gerar Resumo',
        generatingSummary: 'Gerando...',
        viewSummary: 'Ver Resumo',
        summaryTitle: 'Resumo do Documento',
        executiveSummary: 'Resumo Executivo',
        keyInsights: 'Insights-Chave',
        strategicImplications: 'Implicações Estratégicas',
        recommendations: 'Recomendações',
        frameworksApplied: 'Frameworks Aplicados'
    },
    en: {
        title: 'RAG Documents',
        description: 'Manage indexed documents for vector search',
        upload: 'Upload & Index',
        search: 'Search',
        indexed: 'Indexed',
        notIndexed: 'Not indexed',
        chunks: 'chunks',
        tokens: 'tokens',
        index: 'Index',
        delete: 'Delete',
        indexing: 'Indexing...',
        searching: 'Searching...',
        noResults: 'No results',
        similarity: 'Similarity',
        generateSummary: 'Generate Summary',
        generatingSummary: 'Generating...',
        viewSummary: 'View Summary',
        summaryTitle: 'Document Summary',
        executiveSummary: 'Executive Summary',
        keyInsights: 'Key Insights',
        strategicImplications: 'Strategic Implications',
        recommendations: 'Recommendations',
        frameworksApplied: 'Frameworks Applied'
    }
};

export default function RAGDocumentManager({ lang = 'pt' }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [indexing, setIndexing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [summaryDialog, setSummaryDialog] = useState(false);
    const [currentSummary, setCurrentSummary] = useState(null);
    const [generatingSummary, setGeneratingSummary] = useState(null);
    const t = translations[lang];

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const docs = await base44.entities.Document.filter({ 
                created_by: user.email 
            });
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIndex = async (documentId) => {
        setIndexing(documentId);
        try {
            const response = await base44.functions.invoke('ingestDocumentRAG', {
                document_id: documentId
            });

            if (response.data.success) {
                toast.success(`${response.data.chunks_created} ${t.chunks} ${lang === 'pt' ? 'criados' : 'created'}`);
                loadDocuments();
            }
        } catch (error) {
            console.error('Error indexing:', error);
            toast.error(lang === 'pt' ? 'Erro ao indexar' : 'Error indexing');
        } finally {
            setIndexing(null);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setSearching(true);
        try {
            const response = await base44.functions.invoke('searchDocumentsRAG', {
                query: searchQuery,
                top_k: 5
            });

            setSearchResults(response.data.results || []);
        } catch (error) {
            console.error('Error searching:', error);
            toast.error(lang === 'pt' ? 'Erro na busca' : 'Search error');
        } finally {
            setSearching(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!confirm(lang === 'pt' ? 'Excluir documento e chunks?' : 'Delete document and chunks?')) return;

        try {
            const chunks = await base44.entities.DocumentChunk.filter({ document_id: documentId });
            for (const chunk of chunks) {
                await base44.entities.DocumentChunk.delete(chunk.id);
            }

            await base44.entities.Document.delete(documentId);
            
            toast.success(lang === 'pt' ? 'Documento excluído' : 'Document deleted');
            loadDocuments();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const handleGenerateSummary = async (documentId) => {
        setGeneratingSummary(documentId);
        try {
            const response = await base44.functions.invoke('generateDocumentSummary', {
                document_id: documentId
            });

            if (response.data.success) {
                setCurrentSummary({
                    ...response.data.summary,
                    document: response.data.document
                });
                setSummaryDialog(true);
                loadDocuments();
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar resumo' : 'Error generating summary');
        } finally {
            setGeneratingSummary(null);
        }
    };

    const handleViewSummary = (doc) => {
        if (doc.summary_metadata) {
            setCurrentSummary({
                executive_summary: doc.ai_summary,
                key_insights: doc.summary_metadata.key_insights || [],
                strategic_implications: doc.summary_metadata.strategic_implications,
                troyjo_frameworks_applied: doc.summary_metadata.frameworks_applied || [],
                recommendations: doc.summary_metadata.recommendations || [],
                document: { title: doc.title, total_chunks: doc.metadata?.chunk_count }
            });
            setSummaryDialog(true);
        }
    };

    const isIndexed = (doc) => doc.metadata?.indexed === true;

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Database className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder={t.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                </div>

                {searchResults.length > 0 && (
                    <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-semibold text-[#002D62]">
                            {lang === 'pt' ? 'Resultados' : 'Results'}:
                        </h4>
                        {searchResults.map((result, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm font-medium text-[#002D62]">
                                        {result.document_name}
                                    </span>
                                    <Badge variant="outline">
                                        {t.similarity}: {(result.similarity_score * 100).toFixed(0)}%
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-700 line-clamp-3">{result.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{result.citation}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-2">
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#002D62]" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {lang === 'pt' ? 'Nenhum documento' : 'No documents'}
                        </div>
                    ) : (
                        documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-[#333F48] truncate">
                                            {doc.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isIndexed(doc) ? (
                                                <>
                                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        {t.indexed}
                                                    </Badge>
                                                    {doc.metadata?.chunk_count && (
                                                        <span className="text-xs text-gray-500">
                                                            {doc.metadata.chunk_count} {t.chunks}
                                                        </span>
                                                    )}
                                                    {doc.ai_summary && (
                                                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                            <Sparkles className="w-3 h-3 mr-1" />
                                                            {lang === 'pt' ? 'Resumo' : 'Summary'}
                                                        </Badge>
                                                    )}
                                                </>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-600 text-xs">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    {t.notIndexed}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isIndexed(doc) && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleIndex(doc.id)}
                                            disabled={indexing === doc.id}
                                        >
                                            {indexing === doc.id ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    {t.indexing}
                                                </>
                                            ) : (
                                                <>
                                                    <Database className="w-3 h-3 mr-1" />
                                                    {t.index}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {isIndexed(doc) && doc.ai_summary && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewSummary(doc)}
                                            className="text-[#00654A] hover:bg-[#00654A]/10"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </Button>
                                    )}
                                    {isIndexed(doc) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleGenerateSummary(doc.id)}
                                            disabled={generatingSummary === doc.id}
                                            className="text-[#002D62] hover:bg-[#002D62]/10"
                                        >
                                            {generatingSummary === doc.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Sparkles className="w-4 h-4" />
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDelete(doc.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>

        <Dialog open={summaryDialog} onOpenChange={setSummaryDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                        {t.summaryTitle}
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    {currentSummary && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-semibold text-[#002D62] mb-1">
                                    {currentSummary.document.title}
                                </h4>
                                <p className="text-xs text-gray-600">
                                    {currentSummary.document.total_chunks} {t.chunks}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-[#002D62] mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {t.executiveSummary}
                                </h3>
                                <p className="text-[#333F48] leading-relaxed">
                                    {currentSummary.executive_summary}
                                </p>
                            </div>

                            {currentSummary.key_insights?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[#002D62] mb-3">
                                        {t.keyInsights}
                                    </h3>
                                    <div className="space-y-4">
                                        {currentSummary.key_insights.map((insight, idx) => (
                                            <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#00654A]">
                                                <h4 className="font-semibold text-[#00654A] mb-2">
                                                    {insight.insight}
                                                </h4>
                                                <p className="text-sm text-[#333F48] mb-2 leading-relaxed">
                                                    {insight.analysis}
                                                </p>
                                                <p className="text-xs text-gray-500 italic">
                                                    {insight.citation}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentSummary.troyjo_frameworks_applied?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[#002D62] mb-2">
                                        {t.frameworksApplied}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentSummary.troyjo_frameworks_applied.map((framework, idx) => (
                                            <Badge key={idx} className="bg-[#D4AF37] text-[#2D2D2D]">
                                                {framework}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentSummary.strategic_implications && (
                                <div>
                                    <h3 className="font-semibold text-[#002D62] mb-2">
                                        {t.strategicImplications}
                                    </h3>
                                    <p className="text-[#333F48] leading-relaxed">
                                        {currentSummary.strategic_implications}
                                    </p>
                                </div>
                            )}

                            {currentSummary.recommendations?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-[#002D62] mb-2">
                                        {t.recommendations}
                                    </h3>
                                    <ul className="space-y-2">
                                        {currentSummary.recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-[#333F48]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#00654A] mt-2 flex-shrink-0" />
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
        </>
    );
}