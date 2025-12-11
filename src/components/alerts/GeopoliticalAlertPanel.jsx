import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GeopoliticalAlertPanel({ userContext, personaMode }) {
    const [alerts, setAlerts] = useState([]);
    const [dismissed, setDismissed] = useState([]);

    useEffect(() => {
        loadAlerts();
        const interval = setInterval(loadAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadAlerts = async () => {
        try {
            const risks = await base44.entities.GeopoliticalRisk.filter({
                severity: { $in: ['high', 'critical'] },
                active: true
            }, '-last_updated', 5);

            setAlerts(risks.filter(r => !dismissed.includes(r.id)));
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    };

    const dismissAlert = (id) => {
        setDismissed([...dismissed, id]);
        setAlerts(alerts.filter(a => a.id !== id));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="space-y-2">
            <AnimatePresence>
                {alerts.slice(0, 3).map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <Alert className={
                            alert.severity === 'critical' 
                                ? 'border-red-500 bg-red-50' 
                                : 'border-orange-500 bg-orange-50'
                        }>
                            <AlertTriangle className={
                                alert.severity === 'critical'
                                    ? 'h-4 w-4 text-red-600'
                                    : 'h-4 w-4 text-orange-600'
                            } />
                            <AlertTitle className="flex items-center justify-between">
                                <span className={
                                    alert.severity === 'critical'
                                        ? 'text-red-900'
                                        : 'text-orange-900'
                                }>
                                    {alert.title}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                                        {alert.severity}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => dismissAlert(alert.id)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </AlertTitle>
                            <AlertDescription className="text-sm text-gray-700">
                                {alert.summary || alert.description?.substring(0, 150)}
                                {alert.source_url && (
                                    <a
                                        href={alert.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Fonte
                                    </a>
                                )}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}