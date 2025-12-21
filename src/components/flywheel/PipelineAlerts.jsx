import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Alertas de Pipeline',
        description: 'Monitoramento e notificações',
        noAlerts: 'Nenhum alerta',
        dismiss: 'Dispensar'
    },
    en: {
        title: 'Pipeline Alerts',
        description: 'Monitoring and notifications',
        noAlerts: 'No alerts',
        dismiss: 'Dismiss'
    }
};

const severityConfig = {
    high: { icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-300' },
    medium: { icon: AlertTriangle, color: 'bg-amber-100 text-amber-800 border-amber-300' },
    low: { icon: Info, color: 'bg-blue-100 text-blue-800 border-blue-300' }
};

export default function PipelineAlerts({ siteId, lang = 'pt' }) {
    const [alerts, setAlerts] = useState([]);
    const t = translations[lang];

    const dismissAlert = (index) => {
        setAlerts(alerts.filter((_, i) => i !== index));
    };

    // Listen for new alerts from parent components
    useEffect(() => {
        const handleAlert = (event) => {
            if (event.detail) {
                setAlerts(prev => [event.detail, ...prev].slice(0, 10));
            }
        };

        window.addEventListener('pipeline-alert', handleAlert);
        return () => window.removeEventListener('pipeline-alert', handleAlert);
    }, []);

    if (alerts.length === 0) return null;

    return (
        <Card className="border-amber-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                        {alerts.map((alert, index) => {
                            const config = severityConfig[alert.severity] || severityConfig.low;
                            const Icon = config.icon;

                            return (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-3 ${config.color}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-2 flex-1">
                                            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{alert.message}</p>
                                                {alert.details && (
                                                    <p className="text-xs mt-1 opacity-80">{alert.details}</p>
                                                )}
                                                <p className="text-xs mt-1 opacity-60">
                                                    {new Date(alert.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => dismissAlert(index)}
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}