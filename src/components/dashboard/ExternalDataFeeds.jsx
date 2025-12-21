import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Newspaper, TrendingUp, MessageCircle, ExternalLink, ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExternalDataFeeds({ lang = 'pt' }) {
    const [data, setData] = useState({ news: [], indicators: [], sentiment: [] });
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const t = {
        pt: {
            title: 'Feeds de Dados Externos',
            description: 'Notícias, indicadores econômicos e análise de sentimento em tempo real',
            news: 'Notícias',
            economic: 'Indicadores',
            sentiment: 'Sentimento',
            refresh: 'Atualizar',
            lastUpdated: 'Atualizado',
            loading: 'Carregando dados...',
            noData: 'Nenhum dado disponível',
            relevance: 'Relevância',
            source: 'Fonte',
            readMore: 'Ler mais',
            gdpGrowth: 'PIB',
            inflation: 'Inflação',
            unemployment: 'Desemprego',
            positive: 'Positivo',
            negative: 'Negativo',
            neutral: 'Neutro',
            volume: 'Volume',
            trending: 'Em alta'
        },
        en: {
            title: 'External Data Feeds',
            description: 'Real-time news, economic indicators and sentiment analysis',
            news: 'News',
            economic: 'Indicators',
            sentiment: 'Sentiment',
            refresh: 'Refresh',
            lastUpdated: 'Updated',
            loading: 'Loading data...',
            noData: 'No data available',
            relevance: 'Relevance',
            source: 'Source',
            readMore: 'Read more',
            gdpGrowth: 'GDP',
            inflation: 'Inflation',
            unemployment: 'Unemployment',
            positive: 'Positive',
            negative: 'Negative',
            neutral: 'Neutral',
            volume: 'Volume',
            trending: 'Trending'
        }
    }[lang];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('fetchExternalDataSources', {
                method: 'all'
            });

            if (response.data.success) {
                setData(response.data.data);
                setLastUpdated(new Date(response.data.timestamp));
                toast.success(lang === 'pt' ? 'Dados atualizados' : 'Data updated');
            }
        } catch (error) {
            console.error('Error loading external data:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar dados' : 'Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const getSentimentColor = (score) => {
        if (score > 0.3) return 'text-green-600 bg-green-50';
        if (score < -0.3) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <ArrowUp className="w-4 h-4 text-green-600" />;
        if (trend === 'down') return <ArrowDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-gray-600" />;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <TrendingUp className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {lastUpdated && (
                            <span className="text-xs text-gray-500">
                                {t.lastUpdated}: {lastUpdated.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                            </span>
                        )}
                        <Button onClick={loadData} disabled={loading} variant="outline" size="sm">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62] mr-2" />
                        <span className="text-sm text-gray-600">{t.loading}</span>
                    </div>
                ) : (
                    <Tabs defaultValue="news">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="news">
                                <Newspaper className="w-4 h-4 mr-2" />
                                {t.news}
                            </TabsTrigger>
                            <TabsTrigger value="economic">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                {t.economic}
                            </TabsTrigger>
                            <TabsTrigger value="sentiment">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {t.sentiment}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="news" className="space-y-3 mt-4">
                            {data.news?.length > 0 ? (
                                data.news.map((item, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm text-[#002D62] mb-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    {item.summary}
                                                </p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant="outline" className="text-xs">
                                                        {t.source}: {item.source}
                                                    </Badge>
                                                    {item.relevance_score && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {t.relevance}: {item.relevance_score}/10
                                                        </Badge>
                                                    )}
                                                    {item.regions?.map((region, i) => (
                                                        <Badge key={i} className="text-xs bg-blue-50 text-blue-700">
                                                            {region}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            {item.url && (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-8">{t.noData}</p>
                            )}
                        </TabsContent>

                        <TabsContent value="economic" className="space-y-3 mt-4">
                            {data.indicators?.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {data.indicators.map((item, idx) => (
                                        <div key={idx} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <h4 className="font-semibold text-sm text-[#002D62]">
                                                    {item.region}
                                                </h4>
                                                {getTrendIcon(item.trend)}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                {item.gdp_growth !== undefined && (
                                                    <div>
                                                        <span className="text-gray-500">{t.gdpGrowth}:</span>
                                                        <span className="font-semibold ml-1">{item.gdp_growth}%</span>
                                                    </div>
                                                )}
                                                {item.inflation !== undefined && (
                                                    <div>
                                                        <span className="text-gray-500">{t.inflation}:</span>
                                                        <span className="font-semibold ml-1">{item.inflation}%</span>
                                                    </div>
                                                )}
                                                {item.unemployment !== undefined && (
                                                    <div>
                                                        <span className="text-gray-500">{t.unemployment}:</span>
                                                        <span className="font-semibold ml-1">{item.unemployment}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-8">{t.noData}</p>
                            )}
                        </TabsContent>

                        <TabsContent value="sentiment" className="space-y-3 mt-4">
                            {data.sentiment?.length > 0 ? (
                                data.sentiment.map((item, idx) => (
                                    <div key={idx} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <h4 className="font-semibold text-sm text-[#002D62]">
                                                {item.topic}
                                            </h4>
                                            <Badge className={getSentimentColor(item.sentiment_score)}>
                                                {item.sentiment_score?.toFixed(2)}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-500 h-2 rounded-full" 
                                                        style={{ width: `${item.positive_percentage || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-gray-600 w-12 text-right">
                                                    {item.positive_percentage?.toFixed(0)}%
                                                </span>
                                            </div>
                                            {item.volume && (
                                                <Badge variant="outline" className="text-xs">
                                                    {t.volume}: {item.volume}
                                                </Badge>
                                            )}
                                            {item.trending_hashtags?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {item.trending_hashtags.slice(0, 3).map((tag, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-8">{t.noData}</p>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}