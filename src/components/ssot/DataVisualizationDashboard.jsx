import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, Globe, Loader2 } from 'lucide-react';

const translations = {
    pt: {
        title: 'Dashboard de Visualização',
        description: 'Gráficos interativos dos dados do SSOT',
        indicator: 'Indicador',
        countries: 'Países',
        chartType: 'Tipo de Gráfico',
        line: 'Linha',
        bar: 'Barra',
        generate: 'Gerar Gráfico',
        generating: 'Gerando...',
        noData: 'Sem dados disponíveis',
        year: 'Ano',
        value: 'Valor'
    },
    en: {
        title: 'Visualization Dashboard',
        description: 'Interactive charts from SSOT data',
        indicator: 'Indicator',
        countries: 'Countries',
        chartType: 'Chart Type',
        line: 'Line',
        bar: 'Bar',
        generate: 'Generate Chart',
        generating: 'Generating...',
        noData: 'No data available',
        year: 'Year',
        value: 'Value'
    }
};

const COUNTRIES = ['BRA', 'CHN', 'IND', 'RUS', 'ZAF', 'USA', 'WLD'];
const COUNTRY_NAMES = {
    BRA: 'Brasil',
    CHN: 'China',
    IND: 'Índia',
    RUS: 'Rússia',
    ZAF: 'África do Sul',
    USA: 'EUA',
    WLD: 'Mundo'
};

const COLORS = ['#002D62', '#00654A', '#8B1538', '#B8860B', '#4169E1', '#DC143C'];

export default function DataVisualizationDashboard({ lang = 'pt' }) {
    const [indicators, setIndicators] = useState([]);
    const [selectedIndicator, setSelectedIndicator] = useState('');
    const [selectedCountries, setSelectedCountries] = useState(['BRA', 'CHN', 'IND']);
    const [chartType, setChartType] = useState('line');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadIndicators();
    }, []);

    const loadIndicators = async () => {
        try {
            const facts = await base44.entities.CorporateFact.filter({
                category: 'economic_indicator'
            });
            
            const uniqueIndicators = [...new Set(facts.map(f => f.indicator_name))];
            setIndicators(uniqueIndicators);
            
            if (uniqueIndicators.length > 0) {
                setSelectedIndicator(uniqueIndicators[0]);
            }
        } catch (error) {
            console.error('Error loading indicators:', error);
        }
    };

    const generateChart = async () => {
        if (!selectedIndicator) return;
        
        setLoading(true);
        try {
            const facts = await base44.entities.CorporateFact.filter({
                indicator_name: selectedIndicator
            });

            // Filter by selected countries
            const filtered = facts.filter(f => selectedCountries.includes(f.country));

            // Group by year
            const groupedByYear = {};
            filtered.forEach(fact => {
                if (!groupedByYear[fact.year]) {
                    groupedByYear[fact.year] = { year: fact.year };
                }
                groupedByYear[fact.year][COUNTRY_NAMES[fact.country] || fact.country] = fact.numeric_value;
            });

            const data = Object.values(groupedByYear).sort((a, b) => a.year - b.year);
            setChartData(data);
        } catch (error) {
            console.error('Error generating chart:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCountry = (country) => {
        setSelectedCountries(prev => 
            prev.includes(country) 
                ? prev.filter(c => c !== country)
                : [...prev, country]
        );
    };

    const ChartComponent = chartType === 'line' ? LineChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : Bar;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <BarChart3 className="w-5 h-5" />
                    {t.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Controls */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-semibold mb-2 block">{t.indicator}</label>
                            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {indicators.map(ind => (
                                        <SelectItem key={ind} value={ind}>
                                            {ind.length > 40 ? ind.substring(0, 40) + '...' : ind}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold mb-2 block">{t.chartType}</label>
                            <Select value={chartType} onValueChange={setChartType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="line">{t.line}</SelectItem>
                                    <SelectItem value="bar">{t.bar}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button 
                                onClick={generateChart} 
                                disabled={loading || !selectedIndicator}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.generating}
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        {t.generate}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Country Selection */}
                    <div>
                        <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {t.countries}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COUNTRIES.map(country => (
                                <Badge
                                    key={country}
                                    variant={selectedCountries.includes(country) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleCountry(country)}
                                >
                                    {COUNTRY_NAMES[country] || country}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Chart */}
                    {chartData.length > 0 ? (
                        <div className="mt-6">
                            <ResponsiveContainer width="100%" height={400}>
                                <ChartComponent data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    {selectedCountries.map((country, idx) => (
                                        <DataComponent
                                            key={country}
                                            type="monotone"
                                            dataKey={COUNTRY_NAMES[country] || country}
                                            stroke={COLORS[idx % COLORS.length]}
                                            fill={COLORS[idx % COLORS.length]}
                                        />
                                    ))}
                                </ChartComponent>
                            </ResponsiveContainer>
                        </div>
                    ) : !loading && (
                        <div className="text-center py-12 text-gray-500">
                            {t.noData}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}