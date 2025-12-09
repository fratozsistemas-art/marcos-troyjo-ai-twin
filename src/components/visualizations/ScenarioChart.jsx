import React, { useRef } from 'react';
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export default function ScenarioChart({ scenarios, lang = 'pt' }) {
    const chartRef = useRef(null);
    const [exporting, setExporting] = React.useState(false);

    const t = {
        pt: {
            title: 'Análise Comparativa de Cenários',
            barView: 'Barras',
            radarView: 'Radar',
            marketImpact: 'Impacto no Mercado',
            economicImpact: 'Impacto Econômico',
            geopoliticalImpact: 'Impacto Geopolítico',
            likelihood: 'Probabilidade',
            exportImage: 'Exportar PNG',
            exportPDF: 'Exportar PDF',
            exporting: 'Exportando...'
        },
        en: {
            title: 'Scenario Comparative Analysis',
            barView: 'Bar',
            radarView: 'Radar',
            marketImpact: 'Market Impact',
            economicImpact: 'Economic Impact',
            geopoliticalImpact: 'Geopolitical Impact',
            likelihood: 'Likelihood',
            exportImage: 'Export PNG',
            exportPDF: 'Export PDF',
            exporting: 'Exporting...'
        }
    }[lang];

    const chartData = scenarios?.map(scenario => ({
        name: scenario.name,
        market: scenario.impacts?.market || 0,
        economic: scenario.impacts?.economic || 0,
        geopolitical: scenario.impacts?.geopolitical || 0,
        likelihood: scenario.likelihood || 0
    })) || [];

    const radarData = scenarios?.flatMap(scenario => 
        Object.entries(scenario.impacts || {}).map(([key, value]) => ({
            subject: key.charAt(0).toUpperCase() + key.slice(1),
            value: value || 0,
            scenario: scenario.name
        }))
    ) || [];

    const exportAsImage = async () => {
        if (!chartRef.current) return;
        setExporting(true);
        
        try {
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#ffffff',
                scale: 2
            });
            
            const link = document.createElement('a');
            link.download = `scenario-analysis-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            toast.success(lang === 'pt' ? 'Gráfico exportado!' : 'Chart exported!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error(lang === 'pt' ? 'Erro ao exportar' : 'Export failed');
        } finally {
            setExporting(false);
        }
    };

    const exportAsPDF = async () => {
        if (!chartRef.current) return;
        setExporting(true);
        
        try {
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#ffffff',
                scale: 2
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 280;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save(`scenario-analysis-${Date.now()}.pdf`);
            
            toast.success(lang === 'pt' ? 'PDF exportado!' : 'PDF exported!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error(lang === 'pt' ? 'Erro ao exportar' : 'Export failed');
        } finally {
            setExporting(false);
        }
    };

    if (!chartData.length) {
        return (
            <div className="text-center py-8 text-gray-500">
                {lang === 'pt' ? 'Sem dados para visualização' : 'No data for visualization'}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[#002D62]">{t.title}</h4>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportAsImage}
                        disabled={exporting}
                    >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {exporting ? t.exporting : t.exportImage}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportAsPDF}
                        disabled={exporting}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {exporting ? t.exporting : t.exportPDF}
                    </Button>
                </div>
            </div>

            <div ref={chartRef} className="bg-white p-6 rounded-lg border">
                <Tabs defaultValue="bar" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                        <TabsTrigger value="bar">{t.barView}</TabsTrigger>
                        <TabsTrigger value="radar">{t.radarView}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="bar">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="market" fill="#10b981" name={t.marketImpact} />
                                <Bar dataKey="economic" fill="#3b82f6" name={t.economicImpact} />
                                <Bar dataKey="geopolitical" fill="#ef4444" name={t.geopoliticalImpact} />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="radar">
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart data={chartData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="name" stroke="#6b7280" />
                                <PolarRadiusAxis domain={[0, 100]} stroke="#6b7280" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#ffffff', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Radar name={t.marketImpact} dataKey="market" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Radar name={t.economicImpact} dataKey="economic" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <Radar name={t.geopoliticalImpact} dataKey="geopolitical" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}