import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const translations = {
    pt: {
        title: 'Dados Trimestrais',
        description: 'Último trimestre com comparações q-o-q e y-o-y',
        selectCountry: 'Selecionar País',
        lastQuarter: 'Último Trimestre',
        qoq: 'Q-o-Q',
        yoy: 'Y-o-Y Acumulado',
        loading: 'Carregando...',
        noData: 'Sem dados disponíveis'
    },
    en: {
        title: 'Quarterly Data',
        description: 'Latest quarter with q-o-q and y-o-y comparisons',
        selectCountry: 'Select Country',
        lastQuarter: 'Last Quarter',
        qoq: 'Q-o-Q',
        yoy: 'Y-o-Y Cumulative',
        loading: 'Loading...',
        noData: 'No data available'
    }
};

export default function QuarterlyDataView({ lang = 'pt' }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('BRA');
    const t = translations[lang];

    const countries = [
        { code: 'BRA', name: 'Brasil', flag: '🇧🇷' },
        { code: 'CHN', name: 'China', flag: '🇨🇳' },
        { code: 'IND', name: 'India', flag: '🇮🇳' },
        { code: 'RUS', name: 'Russia', flag: '🇷🇺' },
        { code: 'ZAF', name: 'South Africa', flag: '🇿🇦' },
        { code: 'USA', name: 'USA', flag: '🇺🇸' },
        { code: 'WLD', name: 'World', flag: '🌍' }
    ];

    useEffect(() => {
        loadData();
    }, [selectedCountry]);

    const loadData = async () => {
        setLoading(true);
        try {
            const facts = await base44.entities.CorporateFact.filter({
                source: 'world_bank',
                region: selectedCountry
            });

            // Group by indicator
            const grouped = {};
            facts.forEach(fact => {
                if (!grouped[fact.indicator_name]) {
                    grouped[fact.indicator_name] = [];
                }
                grouped[fact.indicator_name].push(fact);
            });

            // Calculate comparisons for each indicator
            const processed = Object.entries(grouped).map(([indicator, values]) => {
                const sorted = values.sort((a, b) => b.year - a.year);
                const latest = sorted[0];
                const prevYear = sorted.find(v => v.year === latest.year - 1);
                const prevQuarter = sorted[1]; // Simplified - assumes quarterly data

                let qoqChange = null;
                let qoqPercent = null;
                if (prevQuarter && latest.numeric_value && prevQuarter.numeric_value) {
                    qoqChange = latest.numeric_value - prevQuarter.numeric_value;
                    qoqPercent = (qoqChange / prevQuarter.numeric_value) * 100;
                }

                let yoyChange = null;
                let yoyPercent = null;
                if (prevYear && latest.numeric_value && prevYear.numeric_value) {
                    yoyChange = latest.numeric_value - prevYear.numeric_value;
                    yoyPercent = (yoyChange / prevYear.numeric_value) * 100;
                }

                return {
                    indicator: indicator,
                    latest: latest,
                    qoqChange,
                    qoqPercent,
                    yoyChange,
                    yoyPercent
                };
            });

            setData(processed);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatValue = (value, unit) => {
        if (!value) return 'N/A';
        if (Math.abs(value) >= 1e12) {
            return `${(value / 1e12).toFixed(2)}T ${unit}`;
        }
        if (Math.abs(value) >= 1e9) {
            return `${(value / 1e9).toFixed(2)}B ${unit}`;
        }
        if (Math.abs(value) >= 1e6) {
            return `${(value / 1e6).toFixed(2)}M ${unit}`;
        }
        return `${value.toFixed(2)} ${unit}`;
    };

    const formatPercent = (percent) => {
        if (percent === null || percent === undefined) return null;
        return percent.toFixed(2);
    };

    const getTrendIcon = (value) => {
        if (!value) return <Minus className="w-4 h-4 text-gray-400" />;
        if (value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getTrendColor = (value) => {
        if (!value) return 'text-gray-600';
        if (value > 0) return 'text-green-600';
        if (value < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <BarChart3 className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map(country => (
                                <SelectItem key={country.code} value={country.code}>
                                    {country.flag} {country.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-8 text-gray-500">{t.loading}</div>
                ) : data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{t.noData}</div>
                ) : (
                    <div className="space-y-4">
                        {data.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[#002D62] text-sm mb-1">
                                            {item.indicator}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            <span>{item.latest.year} Q{Math.ceil(new Date().getMonth() / 3)}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-lg font-bold">
                                        {formatValue(item.latest.numeric_value, item.latest.unit)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Q-o-Q */}
                                    <div className="bg-blue-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-blue-900">{t.qoq}</span>
                                            {getTrendIcon(item.qoqPercent)}
                                        </div>
                                        {item.qoqPercent !== null ? (
                                            <div className="space-y-1">
                                                <p className={`text-lg font-bold ${getTrendColor(item.qoqPercent)}`}>
                                                    {item.qoqPercent > 0 ? '+' : ''}{formatPercent(item.qoqPercent)}%
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {item.qoqChange > 0 ? '+' : ''}{formatValue(item.qoqChange, item.latest.unit)}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">N/A</p>
                                        )}
                                    </div>

                                    {/* Y-o-Y */}
                                    <div className="bg-purple-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-purple-900">{t.yoy}</span>
                                            {getTrendIcon(item.yoyPercent)}
                                        </div>
                                        {item.yoyPercent !== null ? (
                                            <div className="space-y-1">
                                                <p className={`text-lg font-bold ${getTrendColor(item.yoyPercent)}`}>
                                                    {item.yoyPercent > 0 ? '+' : ''}{formatPercent(item.yoyPercent)}%
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {item.yoyChange > 0 ? '+' : ''}{formatValue(item.yoyChange, item.latest.unit)}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">N/A</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}