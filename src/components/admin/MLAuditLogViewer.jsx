import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Filter, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Logs de Auditoria ML',
        description: 'Rastreie ações de usuários no sistema ML',
        filterByUser: 'Filtrar por usuário',
        filterByAction: 'Filtrar por ação',
        export: 'Exportar',
        noLogs: 'Nenhum log encontrado',
        user: 'Usuário',
        action: 'Ação',
        resource: 'Recurso',
        timestamp: 'Data/Hora',
        status: 'Status',
        details: 'Detalhes'
    },
    en: {
        title: 'ML Audit Logs',
        description: 'Track user actions in ML system',
        filterByUser: 'Filter by user',
        filterByAction: 'Filter by action',
        export: 'Export',
        noLogs: 'No logs found',
        user: 'User',
        action: 'Action',
        resource: 'Resource',
        timestamp: 'Timestamp',
        status: 'Status',
        details: 'Details'
    }
};

const statusIcons = {
    success: <CheckCircle className="w-4 h-4 text-green-600" />,
    failed: <XCircle className="w-4 h-4 text-red-600" />,
    unauthorized: <AlertCircle className="w-4 h-4 text-amber-600" />
};

export default function MLAuditLogViewer({ lang = 'pt' }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userFilter, setUserFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    const t = translations[lang];

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.MLAuditLog.list('-created_date', 500);
            setLogs(data);
        } catch (error) {
            console.error('Error loading logs:', error);
            toast.error('Erro ao carregar logs');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const filtered = getFilteredLogs();
        const csv = [
            ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Status', 'IP Address'].join(','),
            ...filtered.map(log => [
                new Date(log.created_date).toISOString(),
                log.user_email,
                log.action_type,
                log.resource_type,
                log.resource_id || '',
                log.status,
                log.ip_address || ''
            ].map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ml-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success('Logs exportados!');
    };

    const getFilteredLogs = () => {
        let filtered = logs;

        if (userFilter) {
            filtered = filtered.filter(log => 
                log.user_email.toLowerCase().includes(userFilter.toLowerCase())
            );
        }

        if (actionFilter !== 'all') {
            filtered = filtered.filter(log => log.action_type === actionFilter);
        }

        return filtered;
    };

    const filteredLogs = getFilteredLogs();
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <FileText className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                    </div>
                    <Button onClick={handleExport} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {t.export}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input
                            placeholder={t.filterByUser}
                            value={userFilter}
                            onChange={(e) => {
                                setUserFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select value={actionFilter} onValueChange={(val) => {
                            setActionFilter(val);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder={t.filterByAction} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as ações</SelectItem>
                                <SelectItem value="view_experiment">View Experiment</SelectItem>
                                <SelectItem value="create_experiment">Create Experiment</SelectItem>
                                <SelectItem value="compare_runs">Compare Runs</SelectItem>
                                <SelectItem value="deploy_pipeline">Deploy Pipeline</SelectItem>
                                <SelectItem value="trigger_manual_deploy">Manual Deploy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                        </div>
                    ) : paginatedLogs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {t.noLogs}
                        </div>
                    ) : (
                        <ScrollArea className="h-[500px]">
                            <div className="space-y-2">
                                {paginatedLogs.map(log => (
                                    <div key={log.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {statusIcons[log.status]}
                                                    <span className="font-medium text-sm">{log.action_type}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {log.resource_type}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-gray-600 space-y-1">
                                                    <p><strong>{t.user}:</strong> {log.user_email}</p>
                                                    {log.resource_name && (
                                                        <p><strong>{t.resource}:</strong> {log.resource_name}</p>
                                                    )}
                                                    {log.ip_address && (
                                                        <p><strong>IP:</strong> {log.ip_address}</p>
                                                    )}
                                                    {log.error_message && (
                                                        <p className="text-red-600"><strong>Error:</strong> {log.error_message}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {new Date(log.created_date).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-gray-600">
                                Página {currentPage} de {totalPages} ({filteredLogs.length} itens)
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}