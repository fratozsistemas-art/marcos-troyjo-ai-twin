import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const COLORS = ['#002D62', '#00654A', '#8B1538', '#D4AF37', '#4A90E2'];

export default function ObservatoryAnalytics({ lang = 'pt' }) {
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('getObservatoryAnalytics', {});
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    if (!analytics) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Value by Category */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        {lang === 'pt' ? 'Valor por Categoria' : 'Value by Category'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.by_category || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#002D62" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        {lang === 'pt' ? 'Distribuição de Riscos' : 'Risk Distribution'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics.risk_distribution || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {(analytics.risk_distribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Trend Over Time */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">
                        {lang === 'pt' ? 'Tendência ao Longo do Tempo' : 'Trend Over Time'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.trend || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="contracts" stroke="#002D62" strokeWidth={2} />
                            <Line type="monotone" dataKey="value" stroke="#00654A" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}