import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Loader2, Database, Trash2, Search, CheckCircle, AlertCircle } from 'lucide-react';
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
        similarity: 'Similaridade'
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
        similarity: 'Similarity'
    }
};

export default function RAGDocumentManager({ lang = 'pt' }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [indexing, setIndexing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
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
            // Delete chunks
            const chunks = await base44.entities.DocumentChunk.filter({ document_id: documentId });
            for (const chunk of chunks) {
                await base44.entities.DocumentChunk.delete(chunk.id);
            }

            // Delete document
            await base44.entities.Document.delete(documentId);
            
            toast.success(lang === 'pt' ? 'Documento excluído' : 'Document deleted');
            loadDocuments();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const isIndexed = (doc) => doc.metadata?.indexed === true;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Database className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
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

                {/* Search Results */}
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

                {/* Documents List */}
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
                                            {doc.name}
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
    );
}