import React, { useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Download, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

export default function RiskTrendChart({ prediction, riskTitle, lang = 'pt' }) {
    const chartRef = useRef(null);

    const t = {
        pt: {
            title: 'Previsão de Tendência de Risco',
            severity: 'Severidade',
            probability: 'Probabilidade',
            month: 'Mês',
            exportImage: 'Exportar PNG',
            exportPDF: 'Exportar PDF',
            exporting: 'Exportando...'
        },
        en: {
            title: 'Risk Trend Prediction',
            severity: 'Severity',
            probability: 'Probability',
            month: 'Month',
            exportImage: 'Export PNG',
            exportPDF: 'Export PDF',
            exporting: 'Exporting...'
        }
    }[lang];

    const [exporting, setExporting] = React.useState(false);

    // Transform prediction data for chart
    const chartData = prediction?.trend_data?.map((point, idx) => ({
        month: `${t.month} ${idx + 1}`,
        severity: point.severity_score || 0,
        probability: point.probability || 0,
        impact: point.impact_score || 0
    })) || [];

    const exportAsImage = async () => {
        if (!chartRef.current) return;
        setExporting(true);
        
        try {
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#ffffff',
                scale: 2
            });
            
            const link = document.createElement('a');
            link.download = `risk-trend-${riskTitle.replace(/\s+/g, '-')}-${Date.now()}.png`;
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
            pdf.save(`risk-trend-${riskTitle.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
            
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
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorSeverity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#ffffff', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="severity"
                            stroke="#DC2626"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSeverity)"
                            name={t.severity}
                        />
                        <Area
                            type="monotone"
                            dataKey="probability"
                            stroke="#2563EB"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorProbability)"
                            name={t.probability}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}