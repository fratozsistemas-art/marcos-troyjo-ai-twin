import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, TrendingUp, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
    pt: {
        title: 'Alertas de Segurança AEGIS',
        monitoring: 'Monitorar Ameaças',
        monitoring_active: 'Monitorando...',
        noAlerts: 'Nenhum alerta ativo',
        viewLogs: 'Ver Logs',
        severity: {
            low: 'Baixa',
            medium: 'Média',
            high: 'Alta',
            critical: 'Crítica'
        },
        alertTypes: {
            multiple_attempts: 'Múltiplas Tentativas',
            escalation_pattern: 'Padrão de Escalação',
            critical_attempt: 'Tentativa Crítica'
        }
    },
    en: {
        title: 'AEGIS Security Alerts',
        monitoring: 'Monitor Threats',
        monitoring_active: 'Monitoring...',
        noAlerts: 'No active alerts',
        viewLogs: 'View Logs',
        severity: {
            low: 'Low',
            medium: 'Medium',
            high: 'High',
            critical: 'Critical'
        },
        alertTypes: {
            multiple_attempts: 'Multiple Attempts',
            escalation_pattern: 'Escalation Pattern',
            critical_attempt: 'Critical Attempt'
        }
    }
};

const severityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
};

export default function AegisAlertPanel({ lang = 'pt' }) {
    const [alerts, setAlerts] = useState([]);
    const [monitoring, setMonitoring] = useState(false);
    const t = translations[lang];

    const handleMonitor = async () => {
        setMonitoring(true);
        try {
            const response = await base44.functions.invoke('monitorAegisThreats', {});
            
            if (response.data.success) {
                setAlerts(response.data.alerts || []);
                if (response.data.alerts_generated > 0) {
                    toast.warning(`${response.data.alerts_generated} novos alertas detectados`);
                } else {
                    toast.success('Nenhuma ameaça detectada');
                }
            }
        } catch (error) {
            console.error('Error monitoring threats:', error);
            toast.error('Erro ao monitorar ameaças');
        } finally {
            setMonitoring(false);
        }
    };

    // Auto-monitor every 5 minutes
    useEffect(() => {
        handleMonitor();
        const interval = setInterval(handleMonitor, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-red-800">
                        <Shield className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                    <Button 
                        onClick={handleMonitor} 
                        disabled={monitoring}
                        size="sm"
                        variant="outline"
                        className="border-red-200"
                    >
                        {monitoring ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.monitoring_active}
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4 mr-2" />
                                {t.monitoring}
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                        {t.noAlerts}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {alerts.map((alert, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`border rounded-lg p-3 ${severityColors[alert.severity]}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="font-semibold text-sm">
                                                {t.alertTypes[alert.type]}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {t.severity[alert.severity]}
                                        </Badge>
                                    </div>
                                    <p className="text-sm mb-2">{alert.message}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs opacity-75">{alert.user_email}</span>
                                        <span className="text-xs opacity-75">
                                            {alert.count && `${alert.count}x`}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}