import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { base44 } from '@/api/base44Client';
import { Globe, Calendar, Users, Loader2, FileSpreadsheet, Download } from 'lucide-react';

export default function ReportPreview({ 
    config, 
    onExportCSV, 
    onExportPDF, 
    lang = 'pt' 
}) {
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (config?.entities) {
            fetchPreview();
        }
    }, [config]);

    const fetchPreview = async () => {
        const selectedEntities = Object.keys(config.entities).filter(e => config.entities[e]);
        if (selectedEntities.length === 0) return;

        setIsLoading(true);
        try {
            const response = await base44.functions.invoke('generateSSOTReport', {
                entities: selectedEntities,
                filters: config.advancedFilters || [],
                fields: config.fields
            });

            if (response.data?.data) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching preview:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const entityIcons = {
        Forum: Globe,
        Event: Calendar,
        KeyActor: Users
    };

    const entityLabels = {
        Forum: lang === 'pt' ? 'Fóruns' : 'Forums',
        Event: lang === 'pt' ? 'Eventos' : 'Events',
        KeyActor: lang === 'pt' ? 'Atores Chave' : 'Key Actors'
    };

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full py-12">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62] mx-auto mb-3" />
                        <p className="text-sm text-[#6B6B6B]">
                            {lang === 'pt' ? 'Carregando prévia...' : 'Loading preview...'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                        {lang === 'pt' ? 'Prévia em Tempo Real' : 'Real-Time Preview'}
                    </CardTitle>
                    {reportData && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={onExportCSV}>
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={onExportPDF}>
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {!reportData ? (
                    <div className="text-center py-12 text-[#6B6B6B]">
                        <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">
                            {lang === 'pt' ? 'Configure o relatório para ver a prévia' : 'Configure the report to see preview'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {Object.keys(reportData).map(entity => {
                                const Icon = entityIcons[entity];
                                return (
                                    <div key={entity} className="text-center p-3 bg-gray-50 rounded-lg border">
                                        <Icon className="w-5 h-5 mx-auto mb-1 text-[#002D62]" />
                                        <div className="text-xl font-bold text-[#002D62]">
                                            {reportData[entity].length}
                                        </div>
                                        <div className="text-xs text-[#6B6B6B]">
                                            {entityLabels[entity]}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Separator />

                        {/* Data Preview */}
                        {Object.keys(reportData).map(entity => (
                            <div key={entity}>
                                <h3 className="font-semibold text-[#002D62] mb-2 flex items-center gap-2">
                                    {React.createElement(entityIcons[entity], { className: "w-4 h-4" })}
                                    {entityLabels[entity]}
                                    <Badge variant="outline">{reportData[entity].length}</Badge>
                                </h3>
                                <div className="space-y-2">
                                    {reportData[entity].slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="text-xs p-3 bg-white rounded border border-gray-100 hover:border-[#002D62] transition-colors">
                                            <div className="font-semibold text-[#002D62] mb-1">{item.name}</div>
                                            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                                {Object.entries(item).slice(1).map(([key, value]) => (
                                                    <div key={key} className="text-[#6B6B6B]">
                                                        <span className="font-medium">{key.replace(/_/g, ' ')}:</span>{' '}
                                                        {Array.isArray(value) ? value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : '') : 
                                                         typeof value === 'object' ? JSON.stringify(value).slice(0, 30) : 
                                                         String(value).slice(0, 30)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {reportData[entity].length > 3 && (
                                        <p className="text-xs text-[#6B6B6B] italic text-center py-2">
                                            + {reportData[entity].length - 3} {lang === 'pt' ? 'mais registros' : 'more records'}
                                        </p>
                                    )}
                                </div>
                                {Object.keys(reportData).indexOf(entity) < Object.keys(reportData).length - 1 && (
                                    <Separator className="my-4" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}