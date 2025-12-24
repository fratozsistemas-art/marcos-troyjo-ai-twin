import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Shield, User, Clock, CheckCircle, AlertTriangle, 
    Brain, Search, Download, Filter, ChevronDown, ChevronUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AuditDashboard({ lang = 'pt' }) {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterModel, setFilterModel] = useState('all');
    const [expandedLog, setExpandedLog] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        gpt4: 0,
        deepseek: 0,
        grok: 0,
        avgResponseTime: 0
    });

    const t = {
        pt: {
            title: 'Auditoria de Decisões IA',
            subtitle: 'Rastreamento completo de decisões com responsabilidade humana',
            search: 'Buscar por email, consulta ou resposta...',
            allModels: 'Todos os Modelos',
            operator: 'Operador',
            model: 'Modelo Usado',
            responseTime: 'Tempo',
            query: 'Consulta',
            response: 'Resposta',
            metadata: 'Metadados',
            reasoning: 'Raciocínio de Seleção',
            noLogs: 'Nenhum log encontrado',
            export: 'Exportar CSV',
            stats: 'Estatísticas',
            totalDecisions: 'Decisões Totais',
            avgTime: 'Tempo Médio',
            viewDetails: 'Ver Detalhes',
            hideDetails: 'Ocultar',
            complexity: 'Complexidade',
            queryType: 'Tipo',
            tokens: 'Tokens'
        },
        en: {
            title: 'AI Decision Audit',
            subtitle: 'Complete decision tracking with human accountability',
            search: 'Search by email, query or response...',
            allModels: 'All Models',
            operator: 'Operator',
            model: 'Model Used',
            responseTime: 'Time',
            query: 'Query',
            response: 'Response',
            metadata: 'Metadata',
            reasoning: 'Selection Reasoning',
            noLogs: 'No logs found',
            export: 'Export CSV',
            stats: 'Statistics',
            totalDecisions: 'Total Decisions',
            avgTime: 'Average Time',
            viewDetails: 'View Details',
            hideDetails: 'Hide',
            complexity: 'Complexity',
            queryType: 'Type',
            tokens: 'Tokens'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadLogs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [logs, searchTerm, filterModel]);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const data = await base44.entities.AgentInteractionLog.list('-created_date', 100);
            setLogs(data || []);
            calculateStats(data || []);
        } catch (error) {
            console.error('Error loading audit logs:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar logs' : 'Error loading logs');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const gpt4 = data.filter(l => l.metadata?.model_selected?.includes('gpt-4')).length;
        const deepseek = data.filter(l => l.metadata?.model_selected?.includes('deepseek')).length;
        const grok = data.filter(l => l.metadata?.model_selected?.includes('grok')).length;
        
        const totalTime = data.reduce((sum, l) => sum + (l.response_time_ms || 0), 0);
        const avgResponseTime = total > 0 ? Math.round(totalTime / total) : 0;

        setStats({ total, gpt4, deepseek, grok, avgResponseTime });
    };

    const applyFilters = () => {
        let filtered = logs;

        if (searchTerm) {
            filtered = filtered.filter(log =>
                log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.response?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterModel !== 'all') {
            filtered = filtered.filter(log =>
                log.metadata?.model_selected?.toLowerCase().includes(filterModel)
            );
        }

        setFilteredLogs(filtered);
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Operator', 'Model', 'Query Type', 'Complexity', 'Response Time (ms)', 'Tokens'];
        const rows = filteredLogs.map(log => [
            new Date(log.created_date).toLocaleString(),
            log.user_email,
            log.metadata?.model_selected || 'N/A',
            log.metadata?.query_type || 'N/A',
            log.metadata?.complexity || 'N/A',
            log.response_time_ms || 0,
            log.token_count || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'CSV exportado!' : 'CSV exported!');
    };

    const getModelBadge = (modelName) => {
        if (modelName?.includes('gpt-4')) return 'bg-blue-100 text-blue-800';
        if (modelName?.includes('deepseek')) return 'bg-purple-100 text-purple-800';
        if (modelName?.includes('grok')) return 'bg-green-100 text-green-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getComplexityColor = (complexity) => {
        if (complexity === 'high') return 'text-red-600';
        if (complexity === 'medium') return 'text-yellow-600';
        return 'text-green-600';
    };

    return (
        <Card className="border-[#002D62]/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Shield className="w-5 h-5" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.subtitle}</CardDescription>
                    </div>
                    <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        {text.export}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                        <div className="text-xs text-blue-700">{text.totalDecisions}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="text-2xl font-bold text-purple-900">{stats.gpt4}</div>
                        <div className="text-xs text-purple-700">GPT-4o</div>
                    </div>
                    <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                        <div className="text-2xl font-bold text-indigo-900">{stats.deepseek}</div>
                        <div className="text-xs text-indigo-700">DeepSeek</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-2xl font-bold text-green-900">{stats.grok}</div>
                        <div className="text-xs text-green-700">Grok</div>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="text-2xl font-bold text-amber-900">{stats.avgResponseTime}ms</div>
                        <div className="text-xs text-amber-700">{text.avgTime}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={text.search}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filterModel === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilterModel('all')}
                            size="sm"
                            className={filterModel === 'all' ? 'bg-[#002D62]' : ''}
                        >
                            {text.allModels}
                        </Button>
                        <Button
                            variant={filterModel === 'gpt-4' ? 'default' : 'outline'}
                            onClick={() => setFilterModel('gpt-4')}
                            size="sm"
                            className={filterModel === 'gpt-4' ? 'bg-blue-600' : ''}
                        >
                            GPT-4
                        </Button>
                        <Button
                            variant={filterModel === 'deepseek' ? 'default' : 'outline'}
                            onClick={() => setFilterModel('deepseek')}
                            size="sm"
                            className={filterModel === 'deepseek' ? 'bg-purple-600' : ''}
                        >
                            DeepSeek
                        </Button>
                        <Button
                            variant={filterModel === 'grok' ? 'default' : 'outline'}
                            onClick={() => setFilterModel('grok')}
                            size="sm"
                            className={filterModel === 'grok' ? 'bg-green-600' : ''}
                        >
                            Grok
                        </Button>
                    </div>
                </div>

                {/* Logs */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                        {filteredLogs.map((log, idx) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: idx * 0.05 }}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-[#002D62]" />
                                        <div>
                                            <div className="font-semibold text-sm text-[#002D62]">{log.user_email}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {new Date(log.created_date).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getModelBadge(log.metadata?.model_selected)}>
                                            {log.metadata?.model_selected || 'N/A'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {log.response_time_ms || 0}ms
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <div className="text-xs text-gray-500 mb-1">{text.query}:</div>
                                    <div className="text-sm text-gray-700 line-clamp-2">{log.prompt}</div>
                                </div>

                                {log.metadata && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs">
                                            {text.queryType}: {log.metadata.query_type || 'N/A'}
                                        </Badge>
                                        <Badge variant="outline" className={`text-xs ${getComplexityColor(log.metadata.complexity)}`}>
                                            {text.complexity}: {log.metadata.complexity || 'N/A'}
                                        </Badge>
                                        {log.token_count && (
                                            <Badge variant="outline" className="text-xs">
                                                {text.tokens}: {log.token_count}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                    className="w-full justify-between text-xs"
                                >
                                    {expandedLog === log.id ? text.hideDetails : text.viewDetails}
                                    {expandedLog === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>

                                <AnimatePresence>
                                    {expandedLog === log.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-3 pt-3 border-t"
                                        >
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="text-xs font-semibold text-gray-500 mb-1">{text.response}:</div>
                                                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                                                        {log.response}
                                                    </div>
                                                </div>
                                                {log.metadata?.reasoning && (
                                                    <div>
                                                        <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                                            <Brain className="w-3 h-3" />
                                                            {text.reasoning}:
                                                        </div>
                                                        <div className="text-sm text-gray-700 bg-blue-50 rounded p-2 italic">
                                                            {log.metadata.reasoning}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredLogs.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-gray-500">
                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{text.noLogs}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}