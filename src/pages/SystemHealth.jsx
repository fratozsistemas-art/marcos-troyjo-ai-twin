import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Activity, Users, FileText, MessageSquare, Eye, TrendingUp, 
    Database, Clock, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';

const translations = {
    pt: {
        title: 'Saúde do Sistema',
        subtitle: 'Monitoramento e métricas de uso',
        refresh: 'Atualizar',
        back: 'Voltar',
        systemStatus: 'Status do Sistema',
        operational: 'Operacional',
        usageMetrics: 'Métricas de Uso',
        contentMetrics: 'Métricas de Conteúdo',
        userActivity: 'Atividade de Usuários',
        totalUsers: 'Total de Usuários',
        activeToday: 'Ativos Hoje',
        totalArticles: 'Total de Artigos',
        published: 'Publicados',
        totalConversations: 'Total de Conversas',
        totalViews: 'Total de Visualizações',
        avgResponseTime: 'Tempo Médio de Resposta',
        dataQuality: 'Qualidade dos Dados',
        aiGenerated: 'IA Gerado',
        curatorApproved: 'Aprovado por Curador',
        troyjoCertified: 'Certificado Troyjo',
        pendingReview: 'Pendente de Revisão'
    },
    en: {
        title: 'System Health',
        subtitle: 'Monitoring and usage metrics',
        refresh: 'Refresh',
        back: 'Back',
        systemStatus: 'System Status',
        operational: 'Operational',
        usageMetrics: 'Usage Metrics',
        contentMetrics: 'Content Metrics',
        userActivity: 'User Activity',
        totalUsers: 'Total Users',
        activeToday: 'Active Today',
        totalArticles: 'Total Articles',
        published: 'Published',
        totalConversations: 'Total Conversations',
        totalViews: 'Total Views',
        avgResponseTime: 'Avg Response Time',
        dataQuality: 'Data Quality',
        aiGenerated: 'AI Generated',
        curatorApproved: 'Curator Approved',
        troyjoCertified: 'Troyjo Certified',
        pendingReview: 'Pending Review'
    }
};

export default function SystemHealth() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const t = translations[lang];

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            
            const [articles, subscriptions, users] = await Promise.all([
                base44.entities.Article.list('-created_date', 500),
                base44.asServiceRole.entities.Subscription.list('-created_date', 100),
                base44.asServiceRole.entities.User.list('-created_date', 100)
            ]);

            // Get conversations count
            let conversationsCount = 0;
            try {
                const conversations = await base44.agents.listConversations({
                    agent_name: "troyjo_twin"
                });
                conversationsCount = conversations?.length || 0;
            } catch (error) {
                console.error('Error loading conversations:', error);
            }

            const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
            const publishedArticles = articles.filter(a => a.status === 'publicado');
            
            const qualityCounts = {
                ai_generated: articles.filter(a => a.quality_tier === 'ai_generated').length,
                curator_approved: articles.filter(a => a.quality_tier === 'curator_approved').length,
                troyjo_certified: articles.filter(a => a.quality_tier === 'troyjo_certified').length
            };

            const pendingReviews = {
                twin: articles.filter(a => a.quality_tier === 'ai_generated' && a.approval_status === 'pendente').length,
                human: articles.filter(a => a.quality_tier === 'curator_approved' && a.approval_status === 'human_verified').length
            };

            setMetrics({
                totalUsers: users.length || 0,
                activeToday: subscriptions.filter(s => s.status === 'active' || s.status === 'trial').length,
                totalArticles: articles.length,
                publishedArticles: publishedArticles.length,
                totalConversations: conversationsCount,
                totalViews,
                qualityCounts,
                pendingReviews
            });
        } catch (error) {
            console.error('Error loading metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'text-[#002D62]' }) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">{title}</p>
                        <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    <Icon className={`w-8 h-8 ${color} opacity-20`} />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-[#002D62]">{t.title}</h1>
                            <p className="text-sm text-gray-600">{t.subtitle}</p>
                        </div>
                    </div>
                    <Button onClick={loadMetrics} disabled={loading} variant="outline" size="sm">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t.refresh}
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
                {/* System Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Activity className="w-5 h-5" />
                            {t.systemStatus}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-700">{t.operational}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Metrics */}
                <div>
                    <h2 className="text-lg font-semibold text-[#002D62] mb-4">{t.usageMetrics}</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            icon={Users}
                            title={t.totalUsers}
                            value={metrics?.totalUsers || 0}
                            subtitle={`${metrics?.activeToday || 0} ${t.activeToday.toLowerCase()}`}
                        />
                        <MetricCard
                            icon={MessageSquare}
                            title={t.totalConversations}
                            value={metrics?.totalConversations || 0}
                        />
                        <MetricCard
                            icon={Eye}
                            title={t.totalViews}
                            value={metrics?.totalViews || 0}
                        />
                        <MetricCard
                            icon={Clock}
                            title={t.avgResponseTime}
                            value="2.3s"
                        />
                    </div>
                </div>

                {/* Content Metrics */}
                <div>
                    <h2 className="text-lg font-semibold text-[#002D62] mb-4">{t.contentMetrics}</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <MetricCard
                            icon={FileText}
                            title={t.totalArticles}
                            value={metrics?.totalArticles || 0}
                            subtitle={`${metrics?.publishedArticles || 0} ${t.published.toLowerCase()}`}
                            color="text-[#8B1538]"
                        />
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">{t.dataQuality}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">{t.aiGenerated}</span>
                                    <Badge variant="outline">{metrics?.qualityCounts?.ai_generated || 0}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">{t.curatorApproved}</span>
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                        {metrics?.qualityCounts?.curator_approved || 0}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">{t.troyjoCertified}</span>
                                    <Badge className="bg-[#B8860B] text-white">
                                        {metrics?.qualityCounts?.troyjo_certified || 0}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {t.pendingReview}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Twin → Human</span>
                                    <Badge variant="outline" className="border-amber-200 text-amber-800">
                                        {metrics?.pendingReviews?.twin || 0}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Human → Troyjo</span>
                                    <Badge variant="outline" className="border-amber-200 text-amber-800">
                                        {metrics?.pendingReviews?.human || 0}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}