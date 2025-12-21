import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, FileText, Globe, Loader2, X, Database, Newspaper, Sparkles, Link as LinkIcon, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const translations = {
    pt: {
        title: 'RAG Multi-Modal Avançado',
        description: 'Busca integrada: Entrevistas + SSOT + World Bank + Notícias',
        query: 'Sua pergunta',
        search: 'Buscar',
        searching: 'Buscando...',
        addSource: 'Adicionar Fonte Externa',
        sourceUrl: 'URL do documento',
        uploadFile: 'Upload de arquivo',
        results: 'Resultados',
        transcripts: 'Entrevistas',
        external: 'Fontes Externas',
        crossRef: 'Referências Cruzadas',
        noResults: 'Nenhum resultado encontrado',
        sources: 'Fontes de Dados',
        corporateFacts: 'Dados Corporativos (SSOT)',
        worldBank: 'World Bank',
        news: 'Notícias Financeiras',
        synthesis: 'Síntese Inteligente'
    },
    en: {
        title: 'Advanced Multi-Modal RAG',
        description: 'Integrated search: Interviews + SSOT + World Bank + News',
        query: 'Your question',
        search: 'Search',
        searching: 'Searching...',
        addSource: 'Add External Source',
        sourceUrl: 'Document URL',
        uploadFile: 'Upload file',
        results: 'Results',
        transcripts: 'Interviews',
        external: 'External Sources',
        crossRef: 'Cross References',
        noResults: 'No results found',
        sources: 'Data Sources',
        corporateFacts: 'Corporate Data (SSOT)',
        worldBank: 'World Bank',
        news: 'Financial News',
        synthesis: 'Intelligent Synthesis'
    }
};

export default function MultiModalRAGInterface({ lang = 'pt' }) {
    const [query, setQuery] = useState('');
    const [externalSources, setExternalSources] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
    const [newSourceUrl, setNewSourceUrl] = useState('');
    const [selectedSources, setSelectedSources] = useState(['transcripts', 'corporate_facts', 'world_bank', 'news']);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const t = translations[lang];

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await base44.functions.invoke('enhancedRAGQuery', {
                query: query,
                sources: selectedSources
            });

            setResults(response.data);
        } catch (error) {
            console.error('Error searching:', error);
            toast.error(lang === 'pt' ? 'Erro na busca' : 'Search error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUrl = async () => {
        if (!newSourceUrl.trim()) return;

        setUploadingDoc(true);
        try {
            const response = await base44.functions.invoke('analyzeExternalDocument', {
                document_url: newSourceUrl
            });

            if (response.data.success) {
                setExternalSources([...externalSources, {
                    type: 'url',
                    url: newSourceUrl,
                    title: newSourceUrl
                }]);
                setNewSourceUrl('');
                setSourceDialogOpen(false);
                toast.success('URL adicionada');
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
            const uploadResult = await base44.integrations.Core.UploadFile({ file });
            
            const response = await base44.functions.invoke('analyzeExternalDocument', {
                file_url: uploadResult.file_url
            });

            if (response.data.success) {
                setExternalSources([...externalSources, {
                    type: 'file',
                    title: file.name,
                    url: uploadResult.file_url
                }]);
                setSourceDialogOpen(false);
                toast.success('Arquivo processado');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Erro ao processar arquivo');
        } finally {
            setUploadingDoc(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <Search className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs mb-2 block">{t.sources}:</Label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {[
                                    { id: 'transcripts', label: t.transcripts, icon: FileText },
                                    { id: 'corporate_facts', label: t.corporateFacts, icon: Database },
                                    { id: 'world_bank', label: t.worldBank, icon: Globe },
                                    { id: 'news', label: t.news, icon: Newspaper }
                                ].map(source => (
                                    <Badge
                                        key={source.id}
                                        variant={selectedSources.includes(source.id) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setSelectedSources(prev =>
                                                prev.includes(source.id)
                                                    ? prev.filter(s => s !== source.id)
                                                    : [...prev, source.id]
                                            );
                                        }}
                                    >
                                        <source.icon className="w-3 h-3 mr-1" />
                                        {source.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Textarea
                                placeholder={t.query}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSearch()}
                                rows={2}
                                className="flex-1"
                            />
                            <Button onClick={handleSearch} disabled={loading || selectedSources.length === 0}>
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        {results && (
                            <div className="space-y-4">
                                {/* Synthesis */}
                                {results.synthesis && (
                                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-blue-600" />
                                                {t.synthesis}
                                            </h4>
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{results.synthesis}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Transcript Results */}
                                {results.data?.transcripts?.results && results.data.transcripts.results.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            {t.transcripts} ({results.data.transcripts.count})
                                        </h4>
                                        <div className="space-y-2">
                                            {results.data.transcripts.results.map((result, idx) => (
                                                <Card key={idx} className="bg-blue-50/50">
                                                    <CardContent className="p-3">
                                                        <p className="text-xs font-semibold text-blue-900 mb-1">
                                                            {result.transcript_title} ({result.date})
                                                        </p>
                                                        {result.chunks.slice(0, 2).map((chunk, ci) => (
                                                            <p key={ci} className="text-xs text-blue-800 mb-1">{chunk.text}</p>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Corporate Facts */}
                                {results.data?.corporate_facts?.results && results.data.corporate_facts.results.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <Database className="w-4 h-4" />
                                            {t.corporateFacts} ({results.data.corporate_facts.count})
                                        </h4>
                                        <div className="grid gap-2">
                                            {results.data.corporate_facts.results.slice(0, 5).map((fact, idx) => (
                                                <Card key={idx} className="bg-green-50/50">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-start justify-between mb-1">
                                                            <p className="text-xs font-semibold text-green-900">{fact.indicator}</p>
                                                            <Badge variant="outline" className="text-xs">{fact.category}</Badge>
                                                        </div>
                                                        <p className="text-sm font-bold text-green-800">{fact.value} {fact.unit}</p>
                                                        <p className="text-xs text-green-700 mt-1">{fact.country} • {fact.year} • {fact.source}</p>
                                                        {fact.verified && <Badge className="mt-1 text-xs bg-green-600">Verified</Badge>}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* World Bank */}
                                {results.data?.world_bank?.results && results.data.world_bank.results.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            {t.worldBank} ({results.data.world_bank.count})
                                        </h4>
                                        <div className="space-y-2">
                                            {results.data.world_bank.results.slice(0, 3).map((indicator, idx) => (
                                                <Card key={idx} className="bg-amber-50/50">
                                                    <CardContent className="p-3">
                                                        <p className="text-xs font-semibold text-amber-900 mb-1">{indicator.name}</p>
                                                        <p className="text-xs text-amber-800">{indicator.description?.substring(0, 150)}...</p>
                                                        <Badge variant="secondary" className="mt-1 text-xs">{indicator.source}</Badge>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* News */}
                                {results.data?.news?.results && results.data.news.results.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <Newspaper className="w-4 h-4" />
                                            {t.news} ({results.data.news.count})
                                        </h4>
                                        <div className="space-y-2">
                                            {results.data.news.results.map((article, idx) => (
                                                <Card key={idx} className="bg-purple-50/50">
                                                    <CardContent className="p-3">
                                                        <p className="text-xs font-semibold text-purple-900 mb-1">{article.title}</p>
                                                        <p className="text-xs text-purple-800 mb-1">{article.summary}</p>
                                                        <p className="text-xs text-purple-700">{article.source} • {article.date}</p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.addSource}</DialogTitle>
                        <DialogDescription>{t.external}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>{t.sourceUrl}</Label>
                            <Input
                                placeholder="https://exemplo.com/artigo"
                                value={newSourceUrl}
                                onChange={(e) => setNewSourceUrl(e.target.value)}
                            />
                            <Button onClick={handleAddUrl} disabled={uploadingDoc} className="mt-2 w-full">
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Adicionar URL
                            </Button>
                        </div>
                        <div className="text-center text-sm text-gray-500">ou</div>
                        <div>
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
                                variant="outline"
                                className="w-full"
                            >
                                {uploadingDoc ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                )}
                                {t.uploadFile}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}