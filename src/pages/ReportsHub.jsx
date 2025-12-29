import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
    FileText, ArrowLeft, Calendar, Download, 
    Eye, Trash2, Plus, Clock, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ReportBuilder from '@/components/reports/ReportBuilder';
import ReportScheduler from '@/components/automation/ReportScheduler';
import { toast } from 'sonner';

export default function ReportsHub() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const t = {
        pt: {
            title: 'Central de Relatórios',
            subtitle: 'Gere e gerencie relatórios analíticos',
            back: 'Voltar',
            createNew: 'Criar Relatório',
            myReports: 'Meus Relatórios',
            scheduled: 'Agendados',
            templates: 'Modelos',
            noReports: 'Nenhum relatório ainda',
            createFirst: 'Crie seu primeiro relatório',
            view: 'Visualizar',
            download: 'Baixar',
            delete: 'Excluir',
            generatedAt: 'Gerado em',
            deleteConfirm: 'Tem certeza que deseja excluir este relatório?'
        },
        en: {
            title: 'Reports Hub',
            subtitle: 'Generate and manage analytical reports',
            back: 'Back',
            createNew: 'Create Report',
            myReports: 'My Reports',
            scheduled: 'Scheduled',
            templates: 'Templates',
            noReports: 'No reports yet',
            createFirst: 'Create your first report',
            view: 'View',
            download: 'Download',
            delete: 'Delete',
            generatedAt: 'Generated at',
            deleteConfirm: 'Are you sure you want to delete this report?'
        }
    }[lang];

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            // In a real scenario, you'd have a Reports entity
            // For now, we'll use a placeholder
            setReports([]);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReportGenerated = (report) => {
        setReports(prev => [report, ...prev]);
        setSelectedReport(report);
        toast.success(t.generatedAt);
    };

    const handleDelete = async (reportId) => {
        if (!confirm(t.deleteConfirm)) return;
        
        try {
            setReports(prev => prev.filter(r => r.id !== reportId));
            toast.success(lang === 'pt' ? 'Relatório excluído!' : 'Report deleted!');
        } catch (error) {
            console.error('Error deleting report:', error);
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t.back}
                            </Button>
                        </Link>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                                <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
                            </div>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="lg" className="gap-2">
                                    <Plus className="w-5 h-5" />
                                    {t.createNew}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <ReportBuilder lang={lang} onReportGenerated={handleReportGenerated} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </motion.div>

                {/* Tabs */}
                <Tabs defaultValue="reports" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="reports">{t.myReports}</TabsTrigger>
                        <TabsTrigger value="scheduled">{t.scheduled}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="reports">
                        {reports.length === 0 ? (
                            <Card>
                                <CardContent className="text-center py-16">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">{t.noReports}</p>
                                    <p className="text-sm text-gray-500 mb-4">{t.createFirst}</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                {t.createNew}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                            <ReportBuilder lang={lang} onReportGenerated={handleReportGenerated} />
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reports.map((report) => (
                                    <motion.div
                                        key={report.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <Card className="hover:shadow-lg transition-all">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-base mb-2">
                                                            {report.title}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(report.generated_at).toLocaleDateString(
                                                                lang === 'pt' ? 'pt-BR' : 'en-US'
                                                            )}
                                                        </div>
                                                    </div>
                                                    {report.ai_summary && (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Sparkles className="w-3 h-3" />
                                                            AI
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-600">
                                                            {lang === 'pt' ? 'Fatos' : 'Facts'}
                                                        </span>
                                                        <span className="font-medium">
                                                            {report.statistics?.total_facts || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-600">
                                                            {lang === 'pt' ? 'Riscos' : 'Risks'}
                                                        </span>
                                                        <span className="font-medium">
                                                            {report.statistics?.total_risks || 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => setSelectedReport(report)}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(report.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="scheduled">
                        <ReportScheduler lang={lang} />
                    </TabsContent>
                </Tabs>

                {/* Report Viewer Dialog */}
                {selectedReport && (
                    <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{selectedReport.title}</h2>
                                    <p className="text-sm text-gray-500">
                                        {t.generatedAt}: {new Date(selectedReport.generated_at).toLocaleString()}
                                    </p>
                                </div>

                                {selectedReport.ai_summary && (
                                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Sparkles className="w-5 h-5 text-purple-600" />
                                                {lang === 'pt' ? 'Resumo Executivo' : 'Executive Summary'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {selectedReport.ai_summary.key_highlights && (
                                                <div className="mb-4">
                                                    <h4 className="font-semibold mb-2 text-sm">
                                                        {lang === 'pt' ? 'Destaques' : 'Highlights'}
                                                    </h4>
                                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                                        {selectedReport.ai_summary.key_highlights.map((h, i) => (
                                                            <li key={i}>{h}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            {lang === 'pt' ? 'Estatísticas' : 'Statistics'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {Object.entries(selectedReport.statistics || {}).map(([key, value]) => (
                                                <div key={key} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                    <p className="text-2xl font-bold text-indigo-600">
                                                        {typeof value === 'number' ? value : '-'}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                                        {key.replace(/_/g, ' ')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}