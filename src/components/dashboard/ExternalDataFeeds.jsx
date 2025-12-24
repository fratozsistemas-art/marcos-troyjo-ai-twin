import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Newspaper, TrendingUp, MessageCircle, ExternalLink, ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExternalDataFeeds({ lang = 'pt' }) {
    const [data, setData] = useState({ news: [], indicators: [], sentiment: [], worldbank: [] });
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null);

    const t = {
        pt: {
            title: 'Feeds de Dados Externos',
            description: 'Notícias, indicadores econômicos e análise de sentimento em tempo real',
            news: 'Notícias',
            economic: 'Indicadores',
            sentiment: 'Sentimento',
            worldbank: 'World Bank',
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
            trending: 'Em alta',
            syncWorldBank: 'Sincronizar World Bank',
            syncing: 'Sincronizando...',
            syncSuccess: 'Sincronização concluída',
            syncError: 'Erro na sincronização',
            indicator: 'Indicador',
            country: 'País',
            value: 'Valor',
            year: 'Ano',
            availableIndicators: 'Indicadores Disponíveis',
            totalCountries: 'Países Disponíveis',
            lastSync: 'Última Sincronização',
            dataPoints: 'Pontos de Dados'
        },
        en: {
            title: 'External Data Feeds',
            description: 'Real-time news, economic indicators and sentiment analysis',
            news: 'News',
            economic: 'Indicators',
            sentiment: 'Sentiment',
            worldbank: 'World Bank',
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
            trending: 'Trending',
            syncWorldBank: 'Sync World Bank',
            syncing: 'Syncing...',
            syncSuccess: 'Sync completed',
            syncError: 'Sync error',
            indicator: 'Indicator',
            country: 'Country',
            value: 'Value',
            year: 'Year',
            availableIndicators: 'Available Indicators',
            totalCountries: 'Available Countries',
            lastSync: 'Last Sync',
            dataPoints: 'Data Points'
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

    const syncWorldBank = async () => {
        setSyncing(true);
        try {
            const response = await base44.functions.invoke('syncWorldBankData', {
                indicators: [
                    'NY.GDP.MKTP.CD', // GDP
                    'FP.CPI.TOTL.ZG', // Inflation
                    'SL.UEM.TOTL.ZS', // Unemployment
                    'NE.EXP.GNFS.ZS', // Exports
                    'NE.IMP.GNFS.ZS', // Imports
                    'GC.DOD.TOTL.GD.ZS', // Government debt
                    'NY.GDP.PCAP.CD', // GDP per capita
                    'SP.POP.TOTL', // Population
                    'EN.ATM.CO2E.PC', // CO2 emissions
                    'SE.XPD.TOTL.GD.ZS' // Education expenditure
                ],
                countries: ['BRA', 'USA', 'CHN', 'IND', 'RUS', 'ZAF', 'ARG', 'MEX', 'DEU', 'JPN', 'GBR', 'FRA'],
                startYear: 2010,
                endYear: 2024
            });

            if (response.data.success) {
                setSyncStatus(response.data);
                toast.success(t.syncSuccess);
                loadData(); // Reload to show synced data
            } else {
                toast.error(t.syncError);
            }
        } catch (error) {
            console.error('Error syncing World Bank data:', error);
            toast.error(t.syncError);
        } finally {
            setSyncing(false);
        }
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
                    <Tabs defaultValue="worldbank">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="worldbank">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                {t.worldbank}
                            </TabsTrigger>
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

                        <TabsContent value="worldbank" className="space-y-4 mt-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-[#002D62] text-lg mb-1">
                                            {t.worldbank} Data Sync
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {lang === 'pt' 
                                                ? 'Sincronize dados econômicos de 12 países com 10 indicadores estratégicos'
                                                : 'Sync economic data from 12 countries with 10 strategic indicators'}
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={syncWorldBank} 
                                        disabled={syncing}
                                        className="bg-[#002D62] hover:bg-[#001d42]"
                                    >
                                        {syncing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t.syncing}
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                {t.syncWorldBank}
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-white rounded-lg p-3 border">
                                        <div className="text-2xl font-bold text-[#002D62]">10</div>
                                        <div className="text-xs text-gray-600">{t.availableIndicators}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border">
                                        <div className="text-2xl font-bold text-[#002D62]">12</div>
                                        <div className="text-xs text-gray-600">{t.totalCountries}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border">
                                        <div className="text-2xl font-bold text-[#002D62]">2010-2024</div>
                                        <div className="text-xs text-gray-600">{lang === 'pt' ? 'Período' : 'Period'}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border">
                                        <div className="text-2xl font-bold text-[#002D62]">
                                            {syncStatus?.total_synced || '-'}
                                        </div>
                                        <div className="text-xs text-gray-600">{t.dataPoints}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm text-[#002D62]">
                                    {t.availableIndicators}:
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    {[
                                        { code: 'NY.GDP.MKTP.CD', name: lang === 'pt' ? 'PIB (USD corrente)' : 'GDP (current USD)' },
                                        { code: 'FP.CPI.TOTL.ZG', name: lang === 'pt' ? 'Inflação (%)' : 'Inflation (%)' },
                                        { code: 'SL.UEM.TOTL.ZS', name: lang === 'pt' ? 'Desemprego (%)' : 'Unemployment (%)' },
                                        { code: 'NE.EXP.GNFS.ZS', name: lang === 'pt' ? 'Exportações (% PIB)' : 'Exports (% GDP)' },
                                        { code: 'NE.IMP.GNFS.ZS', name: lang === 'pt' ? 'Importações (% PIB)' : 'Imports (% GDP)' },
                                        { code: 'GC.DOD.TOTL.GD.ZS', name: lang === 'pt' ? 'Dívida Pública (% PIB)' : 'Govt Debt (% GDP)' },
                                        { code: 'NY.GDP.PCAP.CD', name: lang === 'pt' ? 'PIB per capita' : 'GDP per capita' },
                                        { code: 'SP.POP.TOTL', name: lang === 'pt' ? 'População' : 'Population' },
                                        { code: 'EN.ATM.CO2E.PC', name: lang === 'pt' ? 'Emissões CO2 per capita' : 'CO2 emissions per capita' },
                                        { code: 'SE.XPD.TOTL.GD.ZS', name: lang === 'pt' ? 'Gastos Educação (% PIB)' : 'Education Exp (% GDP)' }
                                    ].map((ind, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                                            <Badge variant="outline" className="text-xs font-mono">
                                                {ind.code}
                                            </Badge>
                                            <span className="text-xs text-gray-700">{ind.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm text-[#002D62]">
                                    {t.totalCountries}:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { code: 'BRA', name: 'Brasil' },
                                        { code: 'USA', name: 'USA' },
                                        { code: 'CHN', name: lang === 'pt' ? 'China' : 'China' },
                                        { code: 'IND', name: lang === 'pt' ? 'Índia' : 'India' },
                                        { code: 'RUS', name: lang === 'pt' ? 'Rússia' : 'Russia' },
                                        { code: 'ZAF', name: lang === 'pt' ? 'África do Sul' : 'South Africa' },
                                        { code: 'ARG', name: 'Argentina' },
                                        { code: 'MEX', name: lang === 'pt' ? 'México' : 'Mexico' },
                                        { code: 'DEU', name: lang === 'pt' ? 'Alemanha' : 'Germany' },
                                        { code: 'JPN', name: lang === 'pt' ? 'Japão' : 'Japan' },
                                        { code: 'GBR', name: lang === 'pt' ? 'Reino Unido' : 'UK' },
                                        { code: 'FRA', name: lang === 'pt' ? 'França' : 'France' }
                                    ].map((country, idx) => (
                                        <Badge key={idx} className="bg-blue-100 text-blue-800">
                                            {country.code} - {country.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {syncStatus && (
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-green-600">
                                            {lang === 'pt' ? 'Sincronizado' : 'Synced'}
                                        </Badge>
                                        <span className="text-sm text-gray-600">
                                            {new Date(syncStatus.timestamp).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {lang === 'pt' 
                                            ? `${syncStatus.total_synced} pontos de dados sincronizados com sucesso`
                                            : `${syncStatus.total_synced} data points synced successfully`}
                                    </p>
                                </div>
                            )}
                        </TabsContent>

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