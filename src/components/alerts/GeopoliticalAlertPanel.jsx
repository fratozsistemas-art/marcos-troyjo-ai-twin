import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AlertConfigurationPanel from './AlertConfigurationPanel';

const SEVERITY_LEVELS = { low: 1, medium: 2, high: 3, critical: 4 };

export default function GeopoliticalAlertPanel({ userContext, personaMode, lang = 'pt' }) {
    const [alerts, setAlerts] = useState([]);
    const [dismissed, setDismissed] = useState([]);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        loadConfig();
        loadAlerts();
        const interval = setInterval(loadAlerts, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadConfig = async () => {
        try {
            const user = await base44.auth.me();
            const configs = await base44.entities.AlertConfiguration.filter({
                user_email: user.email
            });
            if (configs.length > 0) {
                setConfig(configs[0]);
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
    };

    const loadAlerts = async () => {
        try {
            // Load user config
            const user = await base44.auth.me();
            const configs = await base44.entities.AlertConfiguration.filter({
                user_email: user.email
            });
            const userConfig = configs.length > 0 ? configs[0] : null;

            // If alerts disabled, return
            if (userConfig && !userConfig.enabled) {
                setAlerts([]);
                return;
            }

            // Build filter based on configuration
            const severityThreshold = userConfig?.severity_threshold || 'medium';
            const severityFilter = ['critical', 'high', 'medium', 'low']
                .filter(s => SEVERITY_LEVELS[s] >= SEVERITY_LEVELS[severityThreshold]);

            let filter = {
                severity: { $in: severityFilter },
                active: true
            };

            // Apply risk type filter
            if (userConfig?.risk_types?.length > 0) {
                filter.risk_type = { $in: userConfig.risk_types };
            }

            const risks = await base44.entities.GeopoliticalRisk.filter(filter, '-last_updated', 20);

            // Apply additional filters
            let filteredRisks = risks.filter(r => !dismissed.includes(r.id));

            // Filter by regions
            if (userConfig?.regions?.length > 0) {
                filteredRisks = filteredRisks.filter(risk => 
                    userConfig.regions.some(region => 
                        risk.region?.includes(region) || risk.country?.includes(region)
                    )
                );
            }

            // Filter by countries
            if (userConfig?.countries?.length > 0) {
                filteredRisks = filteredRisks.filter(risk =>
                    userConfig.countries.some(country =>
                        risk.country?.includes(country) || risk.region?.includes(country)
                    )
                );
            }

            // Filter by keywords
            if (userConfig?.keywords?.length > 0) {
                filteredRisks = filteredRisks.filter(risk => {
                    const searchText = `${risk.title} ${risk.description} ${risk.summary}`.toLowerCase();
                    return userConfig.keywords.some(keyword => 
                        searchText.includes(keyword.toLowerCase())
                    );
                });
            }

            setAlerts(filteredRisks.slice(0, 5));

            // Send notification if enabled
            if (userConfig?.notification_preferences?.push_enabled && filteredRisks.length > 0) {
                sendPushNotifications(filteredRisks.slice(0, 3), userConfig);
            }
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    };

    const sendPushNotifications = async (newAlerts, userConfig) => {
        try {
            // Check quiet hours
            if (userConfig.notification_preferences?.quiet_hours?.enabled) {
                const now = new Date();
                const hour = now.getHours();
                const start = parseInt(userConfig.notification_preferences.quiet_hours.start);
                const end = parseInt(userConfig.notification_preferences.quiet_hours.end);
                
                if (hour >= start && hour < end) {
                    return;
                }
            }

            // Check frequency
            if (userConfig.notification_preferences?.frequency !== 'immediate') {
                const lastNotified = userConfig.last_notified ? new Date(userConfig.last_notified) : null;
                const now = new Date();
                
                if (lastNotified) {
                    const hoursSince = (now - lastNotified) / (1000 * 60 * 60);
                    if (userConfig.notification_preferences.frequency === 'daily' && hoursSince < 24) {
                        return;
                    }
                    if (userConfig.notification_preferences.frequency === 'weekly' && hoursSince < 168) {
                        return;
                    }
                }
            }

            // Send browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                newAlerts.forEach(alert => {
                    new Notification(`Alerta Geopolítico: ${alert.title}`, {
                        body: alert.summary || alert.description?.substring(0, 100),
                        icon: '/icon.png',
                        tag: alert.id
                    });
                });

                // Update last_notified
                await base44.entities.AlertConfiguration.update(userConfig.id, {
                    last_notified: new Date().toISOString()
                });
            } else if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (error) {
            console.error('Error sending notifications:', error);
        }
    };

    const dismissAlert = (id) => {
        setDismissed([...dismissed, id]);
        setAlerts(alerts.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#002D62]">
                    {lang === 'pt' ? 'Alertas Geopolíticos' : 'Geopolitical Alerts'}
                </h3>
                <AlertConfigurationPanel lang={lang} />
            </div>
            
            {!config?.enabled && (
                <Alert className="border-gray-300 bg-gray-50">
                    <AlertDescription className="text-sm text-gray-600">
                        {lang === 'pt' 
                            ? 'Alertas desativados. Configure suas preferências para receber notificações.'
                            : 'Alerts disabled. Configure your preferences to receive notifications.'}
                    </AlertDescription>
                </Alert>
            )}

            {alerts.length === 0 && config?.enabled && (
                <Alert className="border-blue-300 bg-blue-50">
                    <AlertDescription className="text-sm text-blue-700">
                        {lang === 'pt' 
                            ? 'Nenhum alerta no momento com base nas suas configurações.'
                            : 'No alerts at this time based on your settings.'}
                    </AlertDescription>
                </Alert>
            )}

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