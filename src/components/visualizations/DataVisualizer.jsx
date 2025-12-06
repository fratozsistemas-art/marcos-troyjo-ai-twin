import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

const COLORS = ['#002D62', '#00654A', '#B8860B', '#4A90E2', '#50C878', '#FF6B6B'];

export default function DataVisualizer({ data, title, description, lang = 'pt' }) {
    const [chartType, setChartType] = useState('bar');
    const chartRef = React.useRef(null);

    const translations = {
        pt: {
            chartType: 'Tipo de Gráfico',
            bar: 'Barras',
            line: 'Linhas',
            pie: 'Pizza',
            export: 'Exportar',
            noData: 'Sem dados para visualizar'
        },
        en: {
            chartType: 'Chart Type',
            bar: 'Bar',
            line: 'Line',
            pie: 'Pie',
            export: 'Export',
            noData: 'No data to visualize'
        }
    };

    const t = translations[lang];

    const exportChart = async () => {
        if (!chartRef.current) return;
        
        const canvas = await html2canvas(chartRef.current, {
            backgroundColor: '#ffffff',
            scale: 2
        });
        
        const link = document.createElement('a');
        link.download = `${title.replace(/\s+/g, '_')}_chart.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <p className="text-gray-500">{t.noData}</p>
                </CardContent>
            </Card>
        );
    }

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#002D62" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#002D62" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => entry.name}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-[#002D62]">{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={chartType} onValueChange={setChartType}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4" />
                                        {t.bar}
                                    </div>
                                </SelectItem>
                                <SelectItem value="line">
                                    <div className="flex items-center gap-2">
                                        <LineChartIcon className="w-4 h-4" />
                                        {t.line}
                                    </div>
                                </SelectItem>
                                <SelectItem value="pie">
                                    <div className="flex items-center gap-2">
                                        <PieChartIcon className="w-4 h-4" />
                                        {t.pie}
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={exportChart}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {t.export}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div ref={chartRef} className="bg-white p-4">
                    {renderChart()}
                </div>
            </CardContent>
        </Card>
    );
}