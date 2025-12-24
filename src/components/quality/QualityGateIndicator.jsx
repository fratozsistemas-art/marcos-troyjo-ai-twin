import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function QualityGateIndicator({ lang = 'pt' }) {
    const [recentBlocks, setRecentBlocks] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [stats, setStats] = useState({ total: 0, blocked: 0, approved: 0, blockRate: 0 });

    const t = {
        pt: {
            title: 'Protocolo AEGIS - Quality Gate',
            subtitle: 'Bloqueios e validações de qualidade em tempo real',
            approved: 'Aprovado',
            blocked: 'Bloqueado',
            blockRate: 'Taxa de Bloqueio',
            recentBlocks: 'Bloqueios Recentes',
            reason: 'Motivo',
            viewDetails: 'Ver Detalhes',
            hideDetails: 'Ocultar',
            crvScore: 'Score CRV',
            confidence: 'Confiança',
            risk: 'Risco',
            value: 'Valor',
            noBlocks: 'Nenhum bloqueio recente',
            systemHealthy: 'Sistema operando normalmente'
        },
        en: {
            title: 'AEGIS Protocol - Quality Gate',
            subtitle: 'Real-time quality blocks and validations',
            approved: 'Approved',
            blocked: 'Blocked',
            blockRate: 'Block Rate',
            recentBlocks: 'Recent Blocks',
            reason: 'Reason',
            viewDetails: 'View Details',
            hideDetails: 'Hide',
            crvScore: 'CRV Score',
            confidence: 'Confidence',
            risk: 'Risk',
            value: 'Value',
            noBlocks: 'No recent blocks',
            systemHealthy: 'System operating normally'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadAegisLogs();
        const interval = setInterval(loadAegisLogs, 30000); // Atualizar a cada 30s
        return () => clearInterval(interval);
    }, []);

    const loadAegisLogs = async () => {
        try {
            const logs = await base44.entities.AegisAuditLog.list('-created_date', 50);
            
            const blockedLogs = logs.filter(l => !l.approved);
            setRecentBlocks(blockedLogs.slice(0, 5));

            const total = logs.length;
            const blocked = blockedLogs.length;
            const approved = total - blocked;
            const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;

            setStats({ total, blocked, approved, blockRate });
        } catch (error) {
            console.error('Error loading AEGIS logs:', error);
        }
    };

    const getCRVColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                    <Shield className="w-5 h-5" />
                    {text.title}
                </CardTitle>
                <CardDescription>{text.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-white border border-gray-200">
                        <div className="text-xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-xs text-gray-600">Total</div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-xl font-bold text-green-900">{stats.approved}</div>
                        <div className="text-xs text-green-700">{text.approved}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <div className="text-xl font-bold text-red-900">{stats.blocked}</div>
                        <div className="text-xs text-red-700">{text.blocked}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="text-xl font-bold text-amber-900">{stats.blockRate}%</div>
                        <div className="text-xs text-amber-700">{text.blockRate}</div>
                    </div>
                </div>

                {/* Recent Blocks */}
                {recentBlocks.length > 0 ? (
                    <div>
                        <h4 className="font-semibold text-sm text-red-900 mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            {text.recentBlocks}
                        </h4>
                        <div className="space-y-2">
                            {recentBlocks.map((block, idx) => (
                                <motion.div
                                    key={block.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="border rounded-lg p-3 bg-white"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="text-xs text-gray-500 mb-1">
                                                {new Date(block.created_date).toLocaleString()}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 mb-1">
                                                {block.user_email}
                                            </div>
                                        </div>
                                        <Badge className="bg-red-100 text-red-800">
                                            {block.crv_score?.total || 0}/100
                                        </Badge>
                                    </div>

                                    <div className="text-xs text-red-700 bg-red-50 rounded p-2 mb-2">
                                        <strong>{text.reason}:</strong> {block.blocked_reason}
                                    </div>

                                    {block.crv_score && (
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className={`font-bold ${getCRVColor(block.crv_score.confidence)}`}>
                                                    {block.crv_score.confidence}
                                                </div>
                                                <div className="text-gray-600">{text.confidence}</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className={`font-bold ${getCRVColor(100 - block.crv_score.risk)}`}>
                                                    {block.crv_score.risk}
                                                </div>
                                                <div className="text-gray-600">{text.risk}</div>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded">
                                                <div className={`font-bold ${getCRVColor(block.crv_score.value)}`}>
                                                    {block.crv_score.value}
                                                </div>
                                                <div className="text-gray-600">{text.value}</div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-1">{text.noBlocks}</p>
                        <p className="text-xs text-gray-500">{text.systemHealthy}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}