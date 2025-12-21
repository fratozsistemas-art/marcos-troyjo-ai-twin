import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
    TrendingUp, BarChart3, PieChart as PieIcon, AreaChart as AreaIcon,
    Download, Filter, ZoomIn, Loader2, Plus, X
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Criador de Gráficos Customizados',
        description: 'Crie visualizações interativas com drill-down e filtragem',
        selectIndicator: 'Selecionar Indicador',
        selectCountries: 'Selecionar Países',
        selectYears: 'Filtrar Anos',
        chartType: 'Tipo de Gráfico',
        line: 'Linha',
        bar: 'Barra',
        area: 'Área',
        pie: 'Pizza',
        createChart: 'Criar Gráfico',
        export: 'Exportar',
        filters: 'Filtros',
        applyFilters: 'Aplicar Filtros',
        clearFilters: 'Limpar Filtros',
        loading: 'Carregando...',
        noData: 'Sem dados',
        drillDown: 'Drill-down',
        allCountries: 'Todos os Países',
        allYears: 'Todos os Anos'
    },
    en: {
        title: 'Custom Chart Builder',
        description: 'Create interactive visualizations with drill-down and filtering',
        selectIndicator: 'Select Indicator',
        selectCountries: 'Select Countries',
        selectYears: 'Filter Years',
        chartType: 'Chart Type',
        line: 'Line',
        bar: 'Bar',
        area: 'Area',
        pie: 'Pie',
        createChart: 'Create Chart',
        export: 'Export',
        filters: 'Filters',
        applyFilters: 'Apply Filters',
        clearFilters: 'Clear Filters',
        loading: 'Loading...',
        noData: 'No data',
        drillDown: 'Drill-down',
        allCountries: 'All Countries',
        allYears: 'All Years'
    }
};

const CHART_COLORS = [
    '#002D62', '#00654A', '#8B1538', '#D4AF37', '#B8860B',
    '#4169E1', '#32CD32', '#FF6347', '#FFD700', '#9370DB'
];

export default function CustomChartBuilder({ lang = 'pt' }) {
    const [indicators, setIndicators] = useState([]);
    const [selectedIndicator, setSelectedIndicator] = useState('');
    const [chartType, setChartType] = useState('line');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [drillDownData, setDrillDownData] = useState(null);
    const [drillDownOpen, setDrillDownOpen] = useState(false);
    
    // Filters
    const [selectedCountries, setSelectedCountries] = useState(['BRA', 'CHN', 'USA']);
    const [selectedYears, setSelectedYears] = useState([]);
    const [availableCountries, setAvailableCountries] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    
    const t = translations[lang];

    const countries = [
        { code: 'BRA', name: 'Brasil' },
        { code: 'CHN', name: 'China' },
        { code: 'IND', name: 'India' },
        { code: 'RUS', name: 'Russia' },
        { code: 'ZAF', name: 'South Africa' },
        { code: 'USA', name: 'USA' },
        { code: 'WLD', name: 'World' }
    ];

    useEffect(() => {
        loadIndicators();
    }, []);

    const loadIndicators = async () => {
        try {
            const facts = await base44.entities.CorporateFact.filter({
                source: 'world_bank'
            });
            
            const uniqueIndicators = [...new Set(facts.map(f => f.indicator_name))];
            setIndicators(uniqueIndicators);
            
            const uniqueCountries = [...new Set(facts.map(f => f.region))];
            setAvailableCountries(uniqueCountries);
            
            const uniqueYears = [...new Set(facts.map(f => f.year))].sort((a, b) => b - a);
            setAvailableYears(uniqueYears);
            
            if (uniqueYears.length > 0) {
                setSelectedYears(uniqueYears.slice(0, 5));
            }
        } catch (error) {
            console.error('Error loading indicators:', error);
        }
    };

    const handleCreateChart = async () => {
        if (!selectedIndicator) {
            toast.error(lang === 'pt' ? 'Selecione um indicador' : 'Select an indicator');
            return;
        }

        setLoading(true);
        try {
            const facts = await base44.entities.CorporateFact.filter({
                indicator_name: selectedIndicator,
                source: 'world_bank'
            });

            let filtered = facts;
            
            if (selectedCountries.length > 0) {
                filtered = filtered.filter(f => selectedCountries.includes(f.region));
            }
            
            if (selectedYears.length > 0) {
                filtered = filtered.filter(f => selectedYears.includes(f.year));
            }

            if (chartType === 'pie') {
                // Aggregate by country for pie chart
                const aggregated = {};
                filtered.forEach(f => {
                    if (!aggregated[f.country]) {
                        aggregated[f.country] = 0;
                    }
                    aggregated[f.country] += f.numeric_value || 0;
                });
                
                const pieData = Object.entries(aggregated).map(([name, value]) => ({
                    name,
                    value
                }));
                setChartData(pieData);
            } else {
                // Time series data
                const grouped = {};
                filtered.forEach(f => {
                    const key = `${f.year}`;
                    if (!grouped[key]) {
                        grouped[key] = { year: f.year };
                    }
                    grouped[key][f.country] = f.numeric_value;
                });
                
                const timeSeriesData = Object.values(grouped).sort((a, b) => a.year - b.year);
                setChartData(timeSeriesData);
            }
        } catch (error) {
            console.error('Error creating chart:', error);
            toast.error(lang === 'pt' ? 'Erro ao criar gráfico' : 'Error creating chart');
        } finally {
            setLoading(false);
        }
    };

    const handleDrillDown = (data) => {
        setDrillDownData(data);
        setDrillDownOpen(true);
    };

    const handleExport = () => {
        const csv = [
            ['Year', ...selectedCountries],
            ...chartData.map(row => [
                row.year,
                ...selectedCountries.map(country => row[countries.find(c => c.code === country)?.name] || '')
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedIndicator}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'Exportado com sucesso!' : 'Exported successfully!');
    };

    const toggleCountry = (code) => {
        setSelectedCountries(prev => 
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const toggleYear = (year) => {
        setSelectedYears(prev => 
            prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
        );
    };

    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div className="h-96 flex items-center justify-center text-gray-500">
                    {t.noData}
                </div>
            );
        }

        const commonProps = {
            data: chartData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        switch (chartType) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedCountries.map((code, idx) => {
                                const country = countries.find(c => c.code === code);
                                return (
                                    <Line
                                        key={code}
                                        type="monotone"
                                        dataKey={country?.name}
                                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6, onClick: (e, payload) => handleDrillDown(payload) }}
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedCountries.map((code, idx) => {
                                const country = countries.find(c => c.code === code);
                                return (
                                    <Bar
                                        key={code}
                                        dataKey={country?.name}
                                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                        onClick={(data) => handleDrillDown(data)}
                                    />
                                );
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedCountries.map((code, idx) => {
                                const country = countries.find(c => c.code === code);
                                return (
                                    <Area
                                        key={code}
                                        type="monotone"
                                        dataKey={country?.name}
                                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                        fillOpacity={0.6}
                                    />
                                );
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                onClick={(data) => handleDrillDown(data)}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <BarChart3 className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Controls */}
                        <div className="grid md:grid-cols-4 gap-4">
                            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t.selectIndicator} />
                                </SelectTrigger>
                                <SelectContent>
                                    {indicators.map(ind => (
                                        <SelectItem key={ind} value={ind}>
                                            {ind.length > 40 ? ind.substring(0, 40) + '...' : ind}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={chartType} onValueChange={setChartType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="line">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            {t.line}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="bar">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4" />
                                            {t.bar}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="area">
                                        <div className="flex items-center gap-2">
                                            <AreaIcon className="w-4 h-4" />
                                            {t.area}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="pie">
                                        <div className="flex items-center gap-2">
                                            <PieIcon className="w-4 h-4" />
                                            {t.pie}
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                onClick={() => setFilterDialogOpen(true)}
                                className="gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                {t.filters}
                            </Button>

                            <Button
                                onClick={handleCreateChart}
                                disabled={loading || !selectedIndicator}
                                className="bg-[#002D62] gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t.loading}
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        {t.createChart}
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Active Filters */}
                        {(selectedCountries.length > 0 || selectedYears.length > 0) && (
                            <div className="flex flex-wrap gap-2">
                                {selectedCountries.map(code => {
                                    const country = countries.find(c => c.code === code);
                                    return (
                                        <Badge key={code} variant="outline" className="gap-1">
                                            {country?.name}
                                            <X 
                                                className="w-3 h-3 cursor-pointer" 
                                                onClick={() => toggleCountry(code)}
                                            />
                                        </Badge>
                                    );
                                })}
                                {selectedYears.slice(0, 3).map(year => (
                                    <Badge key={year} variant="outline" className="gap-1">
                                        {year}
                                        <X 
                                            className="w-3 h-3 cursor-pointer" 
                                            onClick={() => toggleYear(year)}
                                        />
                                    </Badge>
                                ))}
                                {selectedYears.length > 3 && (
                                    <Badge variant="outline">
                                        +{selectedYears.length - 3} {lang === 'pt' ? 'anos' : 'years'}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Chart */}
                        <div className="border rounded-lg p-4 bg-white">
                            {selectedIndicator && (
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-[#002D62]">{selectedIndicator}</h3>
                                    {chartData.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleExport}
                                            className="gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            {t.export}
                                        </Button>
                                    )}
                                </div>
                            )}
                            {renderChart()}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filter Dialog */}
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t.filters}</DialogTitle>
                        <DialogDescription>
                            {lang === 'pt' ? 'Selecione países e anos para filtrar os dados' : 'Select countries and years to filter data'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-3">{t.selectCountries}</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {countries.map(country => (
                                    <div key={country.code} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={country.code}
                                            checked={selectedCountries.includes(country.code)}
                                            onCheckedChange={() => toggleCountry(country.code)}
                                        />
                                        <label htmlFor={country.code} className="text-sm cursor-pointer">
                                            {country.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">{t.selectYears}</h4>
                            <div className="grid grid-cols-4 gap-3">
                                {availableYears.map(year => (
                                    <div key={year} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`year-${year}`}
                                            checked={selectedYears.includes(year)}
                                            onCheckedChange={() => toggleYear(year)}
                                        />
                                        <label htmlFor={`year-${year}`} className="text-sm cursor-pointer">
                                            {year}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => {
                                setSelectedCountries([]);
                                setSelectedYears([]);
                            }}>
                                {t.clearFilters}
                            </Button>
                            <Button onClick={() => setFilterDialogOpen(false)}>
                                {t.applyFilters}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Drill-down Dialog */}
            <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ZoomIn className="w-5 h-5" />
                            {t.drillDown}
                        </DialogTitle>
                    </DialogHeader>
                    {drillDownData && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(drillDownData).map(([key, value]) => (
                                    <div key={key} className="border rounded-lg p-3">
                                        <p className="text-sm text-gray-500 mb-1">{key}</p>
                                        <p className="font-semibold text-[#002D62]">
                                            {typeof value === 'number' ? value.toLocaleString() : value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}