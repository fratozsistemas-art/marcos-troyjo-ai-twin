import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function PersonaAdaptationChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const history = await base44.entities.PersonaInteractionHistory.filter({
                persona_profile_id: { $exists: true }
            }, '-interaction_date', 20);

            if (history.length === 0) {
                setLoading(false);
                return;
            }

            // Calculate averages
            const metrics = {
                technicality: 0,
                formality: 0,
                depth: 0,
                engagement: 0,
                satisfaction: 0
            };

            let count = 0;
            history.forEach(h => {
                if (h.context_effectiveness) {
                    metrics.technicality += h.context_effectiveness.technicality_match || 0;
                    metrics.depth += h.context_effectiveness.depth_match || 0;
                    count++;
                }
                if (h.user_satisfaction) {
                    metrics.satisfaction += h.user_satisfaction / 5;
                }
            });

            const avg = count > 0 ? {
                technicality: (metrics.technicality / count) * 100,
                formality: 70, // Default
                depth: (metrics.depth / count) * 100,
                engagement: 75, // Default
                satisfaction: (metrics.satisfaction / history.length) * 100
            } : null;

            if (avg) {
                setData([
                    { metric: 'Tecnicidade', value: avg.technicality },
                    { metric: 'Formalidade', value: avg.formality },
                    { metric: 'Profundidade', value: avg.depth },
                    { metric: 'Engajamento', value: avg.engagement },
                    { metric: 'Satisfação', value: avg.satisfaction }
                ]);
            }
        } catch (error) {
            console.error('Error loading persona data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportChart = async () => {
        const element = document.getElementById('persona-chart');
        if (!element) return;

        const canvas = await html2canvas(element);
        const link = document.createElement('a');
        link.download = `persona-adaptation-${new Date().toISOString().split('T')[0]}.png`;
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

    if (data.length === 0) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64 text-gray-500">
                    Dados insuficientes para visualização
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Padrões de Adaptação de Persona</CardTitle>
                    <Button size="sm" variant="outline" onClick={exportChart}>
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div id="persona-chart">
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Performance" dataKey="value" stroke="#002D62" fill="#002D62" fillOpacity={0.6} />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}