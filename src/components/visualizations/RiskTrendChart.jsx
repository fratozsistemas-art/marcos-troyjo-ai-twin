import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, RefreshCw, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function RiskTrendChart({ timeRange = '30d' }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        loadData();
    }, [timeRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            const risks = await base44.entities.GeopoliticalRisk.list('-last_updated', 100);
            
            // Aggregate by date and severity
            const aggregated = {};
            risks.forEach(risk => {
                const date = new Date(risk.last_updated || risk.created_date).toISOString().split('T')[0];
                if (!aggregated[date]) {
                    aggregated[date] = { date, critical: 0, high: 0, medium: 0, low: 0 };
                }
                aggregated[date][risk.severity]++;
            });

            const sorted = Object.values(aggregated).sort((a, b) => 
                new Date(a.date) - new Date(b.date)
            );

            setData(sorted.slice(-30));
        } catch (error) {
            console.error('Error loading risk data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportChart = async () => {
        const element = document.getElementById('risk-chart');
        if (!element) return;

        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `risk-trends-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Tendências de Risco Geopolítico</CardTitle>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}>
                            {chartType === 'line' ? 'Barras' : 'Linha'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={loadData}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={exportChart}>
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div id="risk-chart">
                    <ResponsiveContainer width="100%" height={300}>
                        {chartType === 'line' ? (
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="critical" stroke="#dc2626" strokeWidth={2} />
                                <Line type="monotone" dataKey="high" stroke="#ea580c" strokeWidth={2} />
                                <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} />
                                <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} />
                            </LineChart>
                        ) : (
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="critical" fill="#dc2626" />
                                <Bar dataKey="high" fill="#ea580c" />
                                <Bar dataKey="medium" fill="#eab308" />
                                <Bar dataKey="low" fill="#22c55e" />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}