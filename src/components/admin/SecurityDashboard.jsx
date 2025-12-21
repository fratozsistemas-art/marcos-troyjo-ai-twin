import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    Shield, AlertTriangle, Activity, Eye, TrendingUp, 
    User, Clock, MapPin, Flag, CheckCircle2, XCircle, Search, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const translations = {
    pt: {
        title: 'AEGIS Security Dashboard',
        description: 'Monitoramento de tentativas de acesso a informações protegidas',
        overview: 'Visão Geral',
        logs: 'Logs de Auditoria',
        flagged: 'Marcados para Revisão',
        stats: 'Estatísticas',
        totalAttempts: 'Total de Tentativas',
        criticalAlerts: 'Alertas Críticos',
        flaggedReviews: 'Aguardando Revisão',
        avgThreatScore: 'Score Médio de Ameaça',
        recentActivity: 'Atividade Recente',
        user: 'Usuário',
        type: 'Tipo',
        severity: 'Severidade',
        threatScore: 'Score',
        actions: 'Ações',
        viewDetails: 'Ver Detalhes',
        markReviewed: 'Marcar como Revisado',
        search: 'Buscar por usuário ou mensagem...',
        filter: 'Filtrar',
        all: 'Todos',
        details: 'Detalhes da Tentativa',
        message: 'Mensagem do Usuário',
        response: 'Resposta Enviada',
        attemptCount: 'Número da Tentativa',
        conversationId: 'ID da Conversa',
        timestamp: 'Data/Hora',
        reviewNotes: 'Notas da Revisão',
        saveReview: 'Salvar Revisão',
        close: 'Fechar'
    },
    en: {
        title: 'AEGIS Security Dashboard',
        description: 'Monitoring access attempts to protected information',
        overview: 'Overview',
        logs: 'Audit Logs',
        flagged: 'Flagged for Review',
        stats: 'Statistics',
        totalAttempts: 'Total Attempts',
        criticalAlerts: 'Critical Alerts',
        flaggedReviews: 'Awaiting Review',
        avgThreatScore: 'Avg Threat Score',
        recentActivity: 'Recent Activity',
        user: 'User',
        type: 'Type',
        severity: 'Severity',
        threatScore: 'Score',
        actions: 'Actions',
        viewDetails: 'View Details',
        markReviewed: 'Mark as Reviewed',
        search: 'Search by user or message...',
        filter: 'Filter',
        all: 'All',
        details: 'Attempt Details',
        message: 'User Message',
        response: 'Response Sent',
        attemptCount: 'Attempt Number',
        conversationId: 'Conversation ID',
        timestamp: 'Date/Time',
        reviewNotes: 'Review Notes',
        saveReview: 'Save Review',
        close: 'Close'
    }
};

const severityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
};

const attemptTypeLabels = {
    pt: {
        'architecture_query': 'Consulta de Arquitetura',
        'methodology_query': 'Consulta de Metodologia',
        'system_prompt_query': 'Consulta de System Prompt',
        'implementation_query': 'Consulta de Implementação',
        'protocol_query': 'Consulta de Protocolos',
        'jailbreak_attempt': 'Tentativa de Jailbreak',
        'social_engineering': 'Engenharia Social',
        'indirect_probe': 'Sonda Indireta',
        'multiple_attempts': 'Múltiplas Tentativas'
    },
    en: {
        'architecture_query': 'Architecture Query',
        'methodology_query': 'Methodology Query',
        'system_prompt_query': 'System Prompt Query',
        'implementation_query': 'Implementation Query',
        'protocol_query': 'Protocol Query',
        'jailbreak_attempt': 'Jailbreak Attempt',
        'social_engineering': 'Social Engineering',
        'indirect_probe': 'Indirect Probe',
        'multiple_attempts': 'Multiple Attempts'
    }
};

export default function SecurityDashboard({ lang = 'pt' }) {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        critical: 0,
        flagged: 0,
        avgThreat: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const t = translations[lang];

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const allLogs = await base44.entities.AegisAuditLog.list('-created_date', 100);
            setLogs(allLogs);

            // Calculate stats
            const critical = allLogs.filter(l => l.severity === 'critical').length;
            const flagged = allLogs.filter(l => l.flagged_for_review && !l.reviewed_by).length;
            const avgThreat = allLogs.length > 0 
                ? allLogs.reduce((sum, l) => sum + (l.threat_score || 0), 0) / allLogs.length 
                : 0;

            setStats({
                total: allLogs.length,
                critical,
                flagged,
                avgThreat: Math.round(avgThreat)
            });
        } catch (error) {
            console.error('Error loading AEGIS logs:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar logs' : 'Error loading logs');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReviewed = async () => {
        if (!selectedLog) return;

        try {
            const user = await base44.auth.me();
            await base44.entities.AegisAuditLog.update(selectedLog.id, {
                reviewed_by: user.email,
                reviewed_at: new Date().toISOString(),
                review_notes: reviewNotes,
                flagged_for_review: false
            });

            toast.success(lang === 'pt' ? 'Revisão salva' : 'Review saved');
            setSelectedLog(null);
            setReviewNotes('');
            loadData();
        } catch (error) {
            console.error('Error saving review:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar revisão' : 'Error saving review');
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = searchQuery === '' || 
            log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user_message.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
        
        return matchesSearch && matchesSeverity;
    });

    const flaggedLogs = logs.filter(l => l.flagged_for_review && !l.reviewed_by);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#002D62]">{t.title}</h2>
                    <p className="text-sm text-gray-600">{t.description}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{t.totalAttempts}</p>
                                    <p className="text-3xl font-bold text-[#002D62]">{stats.total}</p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{t.criticalAlerts}</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{t.flaggedReviews}</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.flagged}</p>
                                </div>
                                <Flag className="w-8 h-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{t.avgThreatScore}</p>
                                    <p className="text-3xl font-bold text-[#002D62]">{stats.avgThreat}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">{t.overview}</TabsTrigger>
                    <TabsTrigger value="logs">{t.logs}</TabsTrigger>
                    <TabsTrigger value="flagged">
                        {t.flagged} {stats.flagged > 0 && <Badge className="ml-2">{stats.flagged}</Badge>}
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.recentActivity}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {logs.slice(0, 10).map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-2 h-2 rounded-full ${
                                                log.severity === 'critical' ? 'bg-red-500' :
                                                log.severity === 'high' ? 'bg-orange-500' :
                                                log.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{log.user_email}</p>
                                                <p className="text-xs text-gray-500">{attemptTypeLabels[lang][log.attempt_type]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={severityColors[log.severity]}>
                                                {log.severity}
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Logs Tab */}
                <TabsContent value="logs">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{t.logs}</CardTitle>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={t.search}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-64"
                                    />
                                    <select
                                        value={severityFilter}
                                        onChange={(e) => setSeverityFilter(e.target.value)}
                                        className="border rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="all">{t.all}</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {filteredLogs.map((log) => (
                                    <div key={log.id} className="grid grid-cols-6 gap-3 p-3 rounded-lg border hover:bg-gray-50 items-center">
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-gray-900">{log.user_email}</p>
                                            <p className="text-xs text-gray-500">
                                                <Clock className="w-3 h-3 inline mr-1" />
                                                {new Date(log.created_date).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">{attemptTypeLabels[lang][log.attempt_type]}</p>
                                        </div>
                                        <div>
                                            <Badge className={severityColors[log.severity]}>
                                                {log.severity}
                                            </Badge>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-sm font-bold">{log.threat_score}</span>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            {log.flagged_for_review && !log.reviewed_by && (
                                                <Flag className="w-4 h-4 text-orange-500" />
                                            )}
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Flagged Tab */}
                <TabsContent value="flagged">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.flagged}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {flaggedLogs.map((log) => (
                                    <div key={log.id} className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                    <span className="font-medium">{log.user_email}</span>
                                                    <Badge className={severityColors[log.severity]}>
                                                        {log.severity}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">Score: {log.threat_score}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 mb-1">
                                                    {attemptTypeLabels[lang][log.attempt_type]} • {new Date(log.created_date).toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-700 bg-white rounded p-2 border">
                                                    {log.user_message}
                                                </p>
                                            </div>
                                        </div>
                                        <Button onClick={() => setSelectedLog(log)} className="w-full">
                                            {t.viewDetails}
                                        </Button>
                                    </div>
                                ))}
                                {flaggedLogs.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                        <p>{lang === 'pt' ? 'Nenhuma entrada aguardando revisão' : 'No entries awaiting review'}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Details Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.details}</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-600">{t.user}</label>
                                    <p className="font-medium">{selectedLog.user_email}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">{t.timestamp}</label>
                                    <p className="font-medium">{new Date(selectedLog.created_date).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">{t.severity}</label>
                                    <Badge className={severityColors[selectedLog.severity]}>
                                        {selectedLog.severity}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">{t.threatScore}</label>
                                    <p className="font-bold text-lg">{selectedLog.threat_score}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">{t.type}</label>
                                    <p className="text-sm">{attemptTypeLabels[lang][selectedLog.attempt_type]}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">{t.attemptCount}</label>
                                    <p className="font-medium">{selectedLog.attempt_count}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-600 block mb-1">{t.message}</label>
                                <div className="bg-gray-50 rounded-lg p-3 border">
                                    <p className="text-sm">{selectedLog.user_message}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-600 block mb-1">{t.response}</label>
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    <p className="text-sm">{selectedLog.blocked_response}</p>
                                </div>
                            </div>

                            {selectedLog.flagged_for_review && !selectedLog.reviewed_by && (
                                <div>
                                    <label className="text-xs text-gray-600 block mb-1">{t.reviewNotes}</label>
                                    <Textarea
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder={lang === 'pt' ? 'Adicione notas sobre esta revisão...' : 'Add notes about this review...'}
                                        rows={3}
                                    />
                                    <Button onClick={handleMarkReviewed} className="mt-2 w-full">
                                        {t.markReviewed}
                                    </Button>
                                </div>
                            )}

                            {selectedLog.reviewed_by && (
                                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                    <p className="text-xs text-green-800 mb-1">
                                        Revisado por {selectedLog.reviewed_by} em {new Date(selectedLog.reviewed_at).toLocaleString()}
                                    </p>
                                    {selectedLog.review_notes && (
                                        <p className="text-sm text-green-900">{selectedLog.review_notes}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}