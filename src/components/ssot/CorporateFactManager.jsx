import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Database, Download, Upload, Search, Filter, 
    TrendingUp, Globe, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import SyncMonitor from '@/components/ssot/SyncMonitor';
import CorporateFactHistory from '@/components/ssot/CorporateFactHistory';
import DataVisualizationDashboard from '@/components/ssot/DataVisualizationDashboard';
import SSOTDocumentAnalyzer from '@/components/ssot/SSOTDocumentAnalyzer';
import SSOTChatbot from '@/components/ssot/SSOTChatbot';
import DataSourceManager from '@/components/ssot/DataSourceManager';

const translations = {
    pt: {
        title: 'SSOT - Fatos Corporativos',
        description: 'Base única de verdade para dados econômicos e corporativos',
        import: 'Importar World Bank',
        importing: 'Importando...',
        search: 'Buscar fatos...',
        filter: 'Filtrar',
        allFacts: 'Todos os Fatos',
        verified: 'Verificados',
        pending: 'Pendentes',
        history: 'Histórico',
        visualization: 'Visualização',
        source: 'Fonte',
        year: 'Ano',
        country: 'País',
        value: 'Valor',
        verify: 'Verificar',
        viewSource: 'Ver Fonte',
        noData: 'Nenhum dado encontrado',
        export: 'Exportar CSV'
    },
    en: {
        title: 'SSOT - Corporate Facts',
        description: 'Single source of truth for economic and corporate data',
        import: 'Import World Bank',
        importing: 'Importing...',
        search: 'Search facts...',
        filter: 'Filter',
        allFacts: 'All Facts',
        verified: 'Verified',
        pending: 'Pending',
        history: 'History',
        visualization: 'Visualization',
        source: 'Source',
        year: 'Year',
        country: 'Country',
        value: 'Value',
        verify: 'Verify',
        viewSource: 'View Source',
        noData: 'No data found',
        export: 'Export CSV'
    }
};

const sourceColors = {
    world_bank: 'bg-blue-100 text-blue-800',
    imf: 'bg-green-100 text-green-800',
    wto: 'bg-purple-100 text-purple-800',
    ndb: 'bg-amber-100 text-amber-800',
    other: 'bg-gray-100 text-gray-800'
};

export default function CorporateFactManager({ lang = 'pt' }) {
    const [facts, setFacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedFact, setSelectedFact] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sourceFilter, setSourceFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const itemsPerPage = 20;
    const t = translations[lang];

    useEffect(() => {
        loadFacts();
    }, []);

    const loadFacts = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.CorporateFact.list('-last_updated', 100);
            setFacts(data);
        } catch (error) {
            console.error('Error loading facts:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleImportWorldBank = async () => {
        setImporting(true);
        try {
            const response = await base44.functions.invoke('syncWorldBankData', {
                force_sync: true
            });

            if (response.data.success) {
                toast.success(`${response.data.new_records} novos registros, ${response.data.updated_records} atualizados`);
                loadFacts();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error importing:', error);
            toast.error('Erro ao sincronizar dados');
        } finally {
            setImporting(false);
        }
    };

    const handleVerifyFact = async (factId) => {
        try {
            const user = await base44.auth.me();
            
            // Log verification in history
            await base44.entities.CorporateFactHistory.create({
                fact_id: factId,
                action_type: 'verify',
                changed_by: user.email,
                change_reason: 'Fact verified by user'
            });

            await base44.entities.CorporateFact.update(factId, {
                verified: true,
                verified_by: user.email,
                verification_date: new Date().toISOString()
            });
            
            toast.success('Fato verificado!');
            loadFacts();
        } catch (error) {
            console.error('Error verifying fact:', error);
            toast.error('Erro ao verificar');
        }
    };

    const handleViewHistory = (fact) => {
        setSelectedFact(fact);
        setHistoryOpen(true);
    };

    const handleExportCSV = () => {
        const filteredFacts = getFilteredFacts();
        const headers = ['Indicator', 'Value', 'Country', 'Year', 'Source', 'Verified'];
        const rows = filteredFacts.map(f => [
            f.indicator_name,
            f.value,
            f.country,
            f.year,
            f.source,
            f.verified ? 'Yes' : 'No'
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `corporate-facts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Exportado com sucesso!');
    };

    const getFilteredFacts = () => {
        let filtered = facts;

        if (activeTab === 'verified') {
            filtered = filtered.filter(f => f.verified);
        } else if (activeTab === 'pending') {
            filtered = filtered.filter(f => !f.verified);
        }

        if (searchQuery) {
            filtered = filtered.filter(f => 
                f.indicator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (sourceFilter !== 'all') {
            filtered = filtered.filter(f => f.source === sourceFilter);
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(f => f.category === categoryFilter);
        }

        return filtered;
    };

    const filteredFacts = getFilteredFacts();
    const totalPages = Math.ceil(filteredFacts.length / itemsPerPage);
    const paginatedFacts = filteredFacts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <SyncMonitor lang={lang} />

            <DataSourceManager lang={lang} />

            <div className="grid lg:grid-cols-2 gap-6">
                <SSOTDocumentAnalyzer onFactsExtracted={loadFacts} lang={lang} />
                <SSOTChatbot lang={lang} />
            </div>
            
            <DataVisualizationDashboard lang={lang} />
            
            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Database className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleExportCSV} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            {t.export}
                        </Button>
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleImportWorldBank}
                                disabled={importing}
                                className="bg-[#002D62]"
                            >
                                {importing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.importing}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        {lang === 'pt' ? 'Sincronizar Dados' : 'Sync Data'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-3">
                        <Input
                            placeholder={t.search}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Fonte" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as fontes</SelectItem>
                                <SelectItem value="world_bank">World Bank</SelectItem>
                                <SelectItem value="imf">IMF</SelectItem>
                                <SelectItem value="wto">WTO</SelectItem>
                                <SelectItem value="ndb">NDB</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as categorias</SelectItem>
                                <SelectItem value="economic_indicator">Indicador Econômico</SelectItem>
                                <SelectItem value="trade_data">Dados de Comércio</SelectItem>
                                <SelectItem value="institutional_fact">Fato Institucional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs value={activeTab} onValueChange={(val) => {
                        setActiveTab(val);
                        setCurrentPage(1);
                    }}>
                        <TabsList>
                            <TabsTrigger value="all">{t.allFacts}</TabsTrigger>
                            <TabsTrigger value="verified">{t.verified}</TabsTrigger>
                            <TabsTrigger value="pending">{t.pending}</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                                </div>
                            ) : filteredFacts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    {t.noData}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        {paginatedFacts.map((fact) => (
                                        <div 
                                            key={fact.id}
                                            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm text-[#002D62]">
                                                            {fact.indicator_name}
                                                        </h4>
                                                        {fact.verified ? (
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <AlertCircle className="w-4 h-4 text-amber-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <Globe className="w-3 h-3" />
                                                            {fact.country}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{fact.year}</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-[#00654A]">
                                                            {fact.value} {fact.unit}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Badge className={sourceColors[fact.source] || sourceColors.other}>
                                                            {fact.source.replace('_', ' ')}
                                                        </Badge>
                                                        {fact.tags?.slice(0, 3).map((tag, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleViewHistory(fact)}
                                                    >
                                                        {t.history}
                                                    </Button>
                                                    {!fact.verified && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleVerifyFact(fact.id)}
                                                        >
                                                            {t.verify}
                                                        </Button>
                                                    )}
                                                    {fact.source_url && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => window.open(fact.source_url, '_blank')}
                                                        >
                                                            {t.viewSource}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="text-sm text-gray-600">
                                                {lang === 'pt' 
                                                    ? `Página ${currentPage} de ${totalPages} (${filteredFacts.length} itens)`
                                                    : `Page ${currentPage} of ${totalPages} (${filteredFacts.length} items)`}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    {lang === 'pt' ? 'Anterior' : 'Previous'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    {lang === 'pt' ? 'Próxima' : 'Next'}
                                                </Button>
                                            </div>
                                        </div>
                                        )}
                                        </div>
                                        )}
                                        </TabsContent>
                                        </Tabs>
                                        </div>
                                        </CardContent>
                                        </Card>

                                        <CorporateFactHistory
                                        fact={selectedFact}
                                        isOpen={historyOpen}
                                        onClose={() => setHistoryOpen(false)}
                                        lang={lang}
                                        />
                                        </div>
                                        );
                                        }