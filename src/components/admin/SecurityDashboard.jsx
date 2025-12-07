import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Eye, Lock, TrendingUp } from 'lucide-react';

export default function SecurityDashboard({ lang = 'pt' }) {
    const [accessLogs, setAccessLogs] = useState([]);
    const [watermarks, setWatermarks] = useState([]);
    const [stats, setStats] = useState({
        totalAccess: 0,
        suspiciousActivity: 0,
        watermarkedContent: 0,
        violations: 0
    });

    const t = {
        pt: {
            title: 'Painel de Segurança',
            desc: 'Monitoramento de acesso e proteção de IP',
            recentActivity: 'Atividade Recente',
            watermarkedContent: 'Conteúdo Protegido',
            suspiciousActivity: 'Atividade Suspeita',
            accessStats: 'Estatísticas de Acesso',
            noData: 'Nenhum dado disponível'
        },
        en: {
            title: 'Security Dashboard',
            desc: 'Access monitoring and IP protection',
            recentActivity: 'Recent Activity',
            watermarkedContent: 'Protected Content',
            suspiciousActivity: 'Suspicious Activity',
            accessStats: 'Access Statistics',
            noData: 'No data available'
        }
    }[lang];

    useEffect(() => {
        loadSecurityData();
    }, []);

    const loadSecurityData = async () => {
        try {
            const logs = await base44.entities.AccessLog.list('-created_date', 50);
            const marks = await base44.entities.ContentWatermark.list('-created_date', 50);
            
            setAccessLogs(logs || []);
            setWatermarks(marks || []);
            
            // Calculate stats
            const violations = marks.filter(m => m.detected_violations?.length > 0);
            const suspicious = logs.filter(l => {
                // Detect patterns: multiple rapid requests, exports, etc.
                return l.action === 'export' || l.action === 'share';
            });
            
            setStats({
                totalAccess: logs.length,
                suspiciousActivity: suspicious.length,
                watermarkedContent: marks.length,
                violations: violations.length
            });
        } catch (error) {
            console.error('Error loading security data:', error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <Shield className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                    <CardDescription>{t.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg border border-gray-200 bg-blue-50">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-blue-600" />
                                <p className="text-xs text-blue-900 font-medium">Total</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{stats.totalAccess}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg border border-gray-200 bg-green-50">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="w-4 h-4 text-green-600" />
                                <p className="text-xs text-green-900 font-medium">{t.watermarkedContent}</p>
                            </div>
                            <p className="text-2xl font-bold text-green-900">{stats.watermarkedContent}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg border border-gray-200 bg-amber-50">
                            <div className="flex items-center gap-2 mb-2">
                                <Eye className="w-4 h-4 text-amber-600" />
                                <p className="text-xs text-amber-900 font-medium">{t.suspiciousActivity}</p>
                            </div>
                            <p className="text-2xl font-bold text-amber-900">{stats.suspiciousActivity}</p>
                        </div>
                        
                        <div className="p-4 rounded-lg border border-gray-200 bg-red-50">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <p className="text-xs text-red-900 font-medium">Violations</p>
                            </div>
                            <p className="text-2xl font-bold text-red-900">{stats.violations}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {stats.violations > 0 && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {stats.violations} detected violation(s) of watermarked content. Review immediately.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">{t.recentActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                    {accessLogs.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">{t.noData}</p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {accessLogs.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 text-xs">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={log.action === 'export' ? 'destructive' : 'outline'}>
                                            {log.action}
                                        </Badge>
                                        <span className="text-gray-600">{log.user_email}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="text-gray-600">{log.resource_type}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">{log.ip_address}</span>
                                        <span className="text-gray-400">
                                            {new Date(log.created_date).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}