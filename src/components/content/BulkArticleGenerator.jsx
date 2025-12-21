import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Loader2, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Geração em Massa de Artigos',
        description: 'Gerar artigos profundos automaticamente para tópicos mapeados',
        batchSize: 'Quantidade por Lote',
        filterByFreq: 'Filtrar por Frequência',
        minFrequency: 'Frequência Mínima',
        generate: 'Gerar Artigos',
        generating: 'Gerando...',
        results: 'Resultados',
        success: 'Sucesso',
        failed: 'Falhou',
        skipped: 'Ignorado',
        topic: 'Tópico',
        status: 'Status',
        reason: 'Motivo',
        wordCount: 'Palavras',
        viewArticle: 'Ver Artigo',
        noResults: 'Nenhum resultado ainda',
        total: 'Total de Tópicos',
        processed: 'Processados'
    },
    en: {
        title: 'Bulk Article Generation',
        description: 'Automatically generate deep articles for mapped topics',
        batchSize: 'Batch Size',
        filterByFreq: 'Filter by Frequency',
        minFrequency: 'Minimum Frequency',
        generate: 'Generate Articles',
        generating: 'Generating...',
        results: 'Results',
        success: 'Success',
        failed: 'Failed',
        skipped: 'Skipped',
        topic: 'Topic',
        status: 'Status',
        reason: 'Reason',
        wordCount: 'Words',
        viewArticle: 'View Article',
        noResults: 'No results yet',
        total: 'Total Topics',
        processed: 'Processed'
    }
};

export default function BulkArticleGenerator({ lang = 'pt' }) {
    const [batchSize, setBatchSize] = useState(5);
    const [filterByFreq, setFilterByFreq] = useState(true);
    const [minFrequency, setMinFrequency] = useState(3);
    const [generating, setGenerating] = useState(false);
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState(0);
    const t = translations[lang];

    const handleGenerate = async () => {
        setGenerating(true);
        setProgress(10);
        setResults(null);

        try {
            const response = await base44.functions.invoke('generateArticlesFromTopics', {
                batch_size: batchSize,
                filter_by_frequency: filterByFreq,
                min_frequency: minFrequency
            });

            setProgress(100);
            setResults(response.data);
            toast.success(
                lang === 'pt' 
                    ? `${response.data.summary.success} artigos gerados com sucesso!`
                    : `${response.data.summary.success} articles generated successfully!`
            );
        } catch (error) {
            console.error('Error generating articles:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar artigos' : 'Error generating articles');
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        if (generating && progress < 90) {
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [generating, progress]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'skipped':
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            success: 'default',
            failed: 'destructive',
            skipped: 'secondary'
        };
        return (
            <Badge variant={variants[status] || 'outline'}>
                {t[status] || status}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Sparkles className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Configuration */}
                <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t.batchSize}</Label>
                        <Input
                            type="number"
                            min="1"
                            max="20"
                            value={batchSize}
                            onChange={(e) => setBatchSize(parseInt(e.target.value))}
                            disabled={generating}
                        />
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">{t.minFrequency}</Label>
                        <Input
                            type="number"
                            min="1"
                            max="50"
                            value={minFrequency}
                            onChange={(e) => setMinFrequency(parseInt(e.target.value))}
                            disabled={generating || !filterByFreq}
                        />
                    </div>

                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Switch
                                checked={filterByFreq}
                                onCheckedChange={setFilterByFreq}
                                disabled={generating}
                            />
                            <span className="text-sm font-medium">{t.filterByFreq}</span>
                        </label>
                    </div>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full bg-[#002D62] hover:bg-[#001d42]"
                    size="lg"
                >
                    {generating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t.generating}
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 mr-2" />
                            {t.generate}
                        </>
                    )}
                </Button>

                {/* Progress */}
                {generating && (
                    <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-center text-gray-500">
                            {lang === 'pt' 
                                ? 'Gerando artigos profundos com Modelo Mental v2.4...'
                                : 'Generating deep articles with Mental Model v2.4...'}
                        </p>
                    </div>
                )}

                {/* Results */}
                {results && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-900">{results.total_topics}</div>
                                    <div className="text-xs text-blue-600">{t.total}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-900">{results.processed}</div>
                                    <div className="text-xs text-blue-600">{t.processed}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{results.summary.success}</div>
                                    <div className="text-xs text-gray-600">{t.success}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                                    <div className="text-xs text-gray-600">{t.failed}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{results.summary.skipped}</div>
                                    <div className="text-xs text-gray-600">{t.skipped}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-[#002D62]">{t.results}</h4>
                            {results.results.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">{t.noResults}</p>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {results.results.map((result, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                {getStatusIcon(result.status)}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {result.topic}
                                                    </p>
                                                    {result.reason && (
                                                        <p className="text-xs text-gray-500">
                                                            {result.reason === 'article_exists' 
                                                                ? (lang === 'pt' ? 'Artigo já existe' : 'Article already exists')
                                                                : result.reason}
                                                        </p>
                                                    )}
                                                    {result.error && (
                                                        <p className="text-xs text-red-600">{result.error}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {result.word_count && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        {result.word_count} {t.wordCount.toLowerCase()}
                                                    </Badge>
                                                )}
                                                {getStatusBadge(result.status)}
                                                {result.article_id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(`/article/${result.article_id}`, '_blank')}
                                                    >
                                                        {t.viewArticle}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}