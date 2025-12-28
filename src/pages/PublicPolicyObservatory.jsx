import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, TrendingUp, AlertTriangle, Search, Filter, Download, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ObservatoryWidget from '@/components/observatory/ObservatoryWidget';
import ObservatoryAnalytics from '@/components/observatory/ObservatoryAnalytics';
import ObservatoryFilters from '@/components/observatory/ObservatoryFilters';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Observatório de Políticas Públicas',
        subtitle: 'Monitoramento e análise inteligente de licitações e contratos',
        back: 'Voltar',
        search: 'Buscar por termo, órgão ou categoria...',
        filters: 'Filtros',
        analytics: 'Analytics',
        export: 'Exportar',
        askAI: 'Perguntar à IA',
        tabs: {
            overview: 'Visão Geral',
            contracts: 'Contratos',
            bids: 'Licitações',
            risks: 'Riscos',
            insights: 'Insights'
        },
        stats: {
            totalContracts: 'Contratos Ativos',
            totalValue: 'Valor Total',
            criticalRisks: 'Riscos Críticos',
            recentBids: 'Licitações Recentes'
        }
    },
    en: {
        title: 'Public Policy Observatory',
        subtitle: 'Intelligent monitoring and analysis of tenders and contracts',
        back: 'Back',
        search: 'Search by term, agency or category...',
        filters: 'Filters',
        analytics: 'Analytics',
        export: 'Export',
        askAI: 'Ask AI',
        tabs: {
            overview: 'Overview',
            contracts: 'Contracts',
            bids: 'Bids',
            risks: 'Risks',
            insights: 'Insights'
        },
        stats: {
            totalContracts: 'Active Contracts',
            totalValue: 'Total Value',
            criticalRisks: 'Critical Risks',
            recentBids: 'Recent Bids'
        }
    }
};

export default function PublicPolicyObservatory() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('queryObservatoryAPI', {
                endpoint: '/context',
                method: 'GET'
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error loading stats:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar estatísticas' : 'Error loading statistics');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAIQuery = async () => {
        if (!searchQuery.trim()) return;
        
        try {
            const response = await base44.functions.invoke('queryObservatoryAI', {
                query: searchQuery,
                context: activeTab
            });
            
            toast.success(lang === 'pt' ? 'Consulta processada!' : 'Query processed!');
            // Results will be shown in the widget
        } catch (error) {
            console.error('Error querying AI:', error);
            toast.error(lang === 'pt' ? 'Erro ao processar consulta' : 'Error processing query');
        }
    };

    const handleExport = async () => {
        try {
            const response = await base44.functions.invoke('exportObservatoryData', {
                tab: activeTab,
                filters: {}
            });
            
            toast.success(lang === 'pt' ? 'Dados exportados!' : 'Data exported!');
        } catch (error) {
            console.error('Error exporting:', error);
            toast.error(lang === 'pt' ? 'Erro ao exportar' : 'Export error');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-[#002D62]">{t.title}</h1>
                            <p className="text-xs text-gray-500">{t.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)}>
                            <Filter className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
                {/* Search Bar */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder={t.search}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                                className="flex-1"
                            />
                            <Button onClick={handleAIQuery} className="bg-[#002D62] hover:bg-[#001d42]">
                                <Search className="w-4 h-4 mr-2" />
                                {t.askAI}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {t.stats.totalContracts}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#002D62]">
                                {isLoading ? '...' : stats?.total_contracts || '0'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {t.stats.totalValue}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#00654A]">
                                {isLoading ? '...' : `R$ ${stats?.total_value || '0'}M`}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {t.stats.criticalRisks}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {isLoading ? '...' : stats?.critical_risks || '0'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {t.stats.recentBids}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-[#8B1538]">
                                {isLoading ? '...' : stats?.recent_bids || '0'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">{t.tabs.overview}</TabsTrigger>
                        <TabsTrigger value="contracts">{t.tabs.contracts}</TabsTrigger>
                        <TabsTrigger value="bids">{t.tabs.bids}</TabsTrigger>
                        <TabsTrigger value="risks">{t.tabs.risks}</TabsTrigger>
                        <TabsTrigger value="insights">{t.tabs.insights}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <ObservatoryWidget lang={lang} />
                        <ObservatoryAnalytics lang={lang} />
                    </TabsContent>

                    <TabsContent value="contracts">
                        <ObservatoryWidget lang={lang} context="contracts" />
                    </TabsContent>

                    <TabsContent value="bids">
                        <ObservatoryWidget lang={lang} context="bids" />
                    </TabsContent>

                    <TabsContent value="risks">
                        <ObservatoryWidget lang={lang} context="risks" />
                    </TabsContent>

                    <TabsContent value="insights">
                        <ObservatoryWidget lang={lang} context="insights" />
                    </TabsContent>
                </Tabs>

                {/* Filters Sidebar */}
                {filtersOpen && (
                    <ObservatoryFilters
                        lang={lang}
                        onClose={() => setFiltersOpen(false)}
                        onApply={(filters) => {
                            console.log('Filters applied:', filters);
                            setFiltersOpen(false);
                        }}
                    />
                )}
            </main>
        </div>
    );
}