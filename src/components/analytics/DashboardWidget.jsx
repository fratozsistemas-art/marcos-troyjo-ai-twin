import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Settings, Maximize2 } from 'lucide-react';
import QuarterlyDataView from '@/components/ssot/QuarterlyDataView';
import CustomChartBuilder from '@/components/ssot/CustomChartBuilder';
import GeopoliticalRiskMonitor from '@/components/dashboard/GeopoliticalRiskMonitor';

export default function DashboardWidget({ widget, onRemove, onUpdate, lang = 'pt' }) {
    const [expanded, setExpanded] = useState(false);

    const renderWidgetContent = () => {
        switch (widget.type) {
            case 'quarterly_data':
                return <QuarterlyDataView lang={lang} compact />;
            
            case 'custom_chart':
                return <CustomChartBuilder lang={lang} embedded config={widget.config} />;
            
            case 'risk_monitor':
                return <GeopoliticalRiskMonitor lang={lang} compact />;
            
            case 'text_note':
                return (
                    <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{widget.config?.text || ''}</p>
                    </div>
                );
            
            default:
                return <div className="text-gray-500">Widget não suportado</div>;
        }
    };

    const getWidgetTitle = () => {
        const titles = {
            quarterly_data: lang === 'pt' ? 'Dados Trimestrais' : 'Quarterly Data',
            custom_chart: widget.config?.title || (lang === 'pt' ? 'Gráfico Customizado' : 'Custom Chart'),
            risk_monitor: lang === 'pt' ? 'Monitor de Riscos' : 'Risk Monitor',
            text_note: widget.config?.title || (lang === 'pt' ? 'Nota' : 'Note')
        };
        return titles[widget.type] || 'Widget';
    };

    return (
        <Card className="relative group">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[#002D62] text-base">{getWidgetTitle()}</CardTitle>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className="h-8 w-8 p-0"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(widget.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className={expanded ? 'min-h-[600px]' : ''}>
                {renderWidgetContent()}
            </CardContent>
        </Card>
    );
}