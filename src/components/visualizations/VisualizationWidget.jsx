import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, TrendingUp, MousePointerClick } from 'lucide-react';
import { useDashboard } from './DashboardContext';
import DrillDownModal from './DrillDownModal';

const COLORS = ['#002D62', '#00654A', '#8B1538', '#D4AF37', '#6B6B6B', '#4A90E2', '#E27A3F'];

export default function VisualizationWidget({ config, onRefresh, autoRefresh = false, refreshInterval = 30000, lang = 'pt' }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [drillDown, setDrillDown] = useState({ isOpen: false, filterKey: null, filterValue: null });
    const { globalFilters, activeWidget, applyFilter } = useDashboard();

    useEffect(() => {
        loadData();
        
        if (autoRefresh) {
            const interval = setInterval(loadData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [config, autoRefresh, refreshInterval, globalFilters]);

    const loadData = async () => {
        if (!config.entity) return;
        
        setIsLoading(true);
        try {
            const mergedFilters = { ...config.filters, ...globalFilters };
            const entityData = await base44.entities[config.entity].filter(mergedFilters);
            const processedData = processEntityData(entityData, config);
            setData(processedData);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const processEntityData = (rawData, config) => {
        if (!config.fields || config.fields.length === 0) return [];

        const field = config.fields[0];
        const aggregation = field.aggregation || 'count';

        // Group by field value
        const grouped = {};
        rawData.forEach(item => {
            const value = item[field.name];
            const key = Array.isArray(value) ? value[0] : value || 'N/A';
            
            if (!grouped[key]) {
                grouped[key] = { name: key, value: 0, count: 0 };
            }
            
            grouped[key].count++;
            if (aggregation === 'sum' && typeof value === 'number') {
                grouped[key].value += value;
            }
        });

        return Object.values(grouped).map(item => ({
            name: String(item.name).slice(0, 20),
            value: aggregation === 'count' ? item.count : item.value
        })).slice(0, 10);
    };

    const handleChartClick = (data) => {
        if (!data || !data.activePayload || !data.activePayload[0]) return;
        
        const point = data.activePayload[0].payload;
        const field = config.fields[0];
        
        if (field && point.name) {
            applyFilter(config.id, field.name, point.name);
            setDrillDown({
                isOpen: true,
                filterKey: field.name,
                filterValue: point.name
            });
        }
    };

    const renderChart = () => {
        if (!data || data.length === 0) {
            return (
                <div className="h-64 flex items-center justify-center text-gray-400">
                    No data available
                </div>
            );
        }

        const commonProps = {
            data,
            margin: { top: 10, right: 30, left: 0, bottom: 0 }
        };

        switch (config.chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart {...commonProps} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{ fill: 'rgba(0, 45, 98, 0.1)' }} />
                            <Bar dataKey="value" fill={config.color || '#002D62'} cursor="pointer" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart {...commonProps} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{ stroke: config.color || '#002D62', strokeWidth: 2 }} />
                            <Line type="monotone" dataKey="value" stroke={config.color || '#002D62'} strokeWidth={2} cursor="pointer" />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart {...commonProps} onClick={handleChartClick}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{ stroke: config.color || '#002D62', strokeWidth: 2 }} />
                            <Area type="monotone" dataKey="value" stroke={config.color || '#002D62'} fill={config.color || '#002D62'} fillOpacity={0.6} cursor="pointer" />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart onClick={handleChartClick}>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                cursor="pointer"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <Card className={`h-full ${activeWidget === config.id ? 'ring-2 ring-[#002D62]' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            {config.title || 'Untitled Chart'}
                            <MousePointerClick className="w-3 h-3 text-gray-400" />
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {Object.keys(globalFilters).length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                    Filtered
                                </Badge>
                            )}
                            {autoRefresh && (
                                <Badge variant="outline" className="text-xs">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Live
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadData}
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                    {lastUpdate && (
                        <p className="text-xs text-gray-500">
                            Last update: {lastUpdate.toLocaleTimeString()}
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading && !data.length ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                        </div>
                    ) : (
                        <>
                            {renderChart()}
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                {lang === 'pt' ? 'Clique nos pontos para filtrar' : 'Click data points to filter'}
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            <DrillDownModal
                isOpen={drillDown.isOpen}
                onClose={() => setDrillDown({ isOpen: false, filterKey: null, filterValue: null })}
                entity={config.entity}
                filterKey={drillDown.filterKey}
                filterValue={drillDown.filterValue}
                lang={lang}
            />
        </>
    );
}