import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
    ArrowLeft, Database, FolderOpen, Search, 
    BarChart3, Tag, Filter, Workflow, Activity, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnifiedContentSearch from '@/components/content/UnifiedContentSearch';
import CollectionManager from '@/components/content/CollectionManager';
import WorkflowBuilder from '@/components/workflow/WorkflowBuilder';
import WorkflowExecutionMonitor from '@/components/workflow/WorkflowExecutionMonitor';
import TrendBasedSuggestions from '@/components/workflow/TrendBasedSuggestions';

export default function ContentManagementHub() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    const t = {
        pt: {
            title: 'Gestão de Conteúdo Estratégico',
            subtitle: 'Hub unificado para catalogação, busca e organização',
            back: 'Voltar',
            search: 'Busca Avançada',
            collections: 'Coleções',
            workflows: 'Workflows de IA',
            executions: 'Execuções',
            trends: 'Tendências',
            analytics: 'Analytics',
            overview: 'Visão Geral',
            totalContent: 'Total de Conteúdo',
            totalCollections: 'Coleções',
            recentActivity: 'Atividade Recente'
        },
        en: {
            title: 'Strategic Content Management',
            subtitle: 'Unified hub for cataloging, search and organization',
            back: 'Back',
            search: 'Advanced Search',
            collections: 'Collections',
            workflows: 'AI Workflows',
            executions: 'Executions',
            trends: 'Trends',
            analytics: 'Analytics',
            overview: 'Overview',
            totalContent: 'Total Content',
            totalCollections: 'Collections',
            recentActivity: 'Recent Activity'
        }
    }[lang];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-[#002D62]">{t.title}</h1>
                            <p className="text-xs text-gray-600">{t.subtitle}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Stats Overview */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Database className="w-8 h-8 text-[#002D62]" />
                                    <div>
                                        <p className="text-2xl font-bold text-[#002D62]">-</p>
                                        <p className="text-xs text-gray-600">{t.totalContent}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <FolderOpen className="w-8 h-8 text-[#00654A]" />
                                    <div>
                                        <p className="text-2xl font-bold text-[#00654A]">-</p>
                                        <p className="text-xs text-gray-600">{t.totalCollections}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Tag className="w-8 h-8 text-[#D4AF37]" />
                                    <div>
                                        <p className="text-2xl font-bold text-[#D4AF37]">-</p>
                                        <p className="text-xs text-gray-600">Tags</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-8 h-8 text-[#8B1538]" />
                                    <div>
                                        <p className="text-2xl font-bold text-[#8B1538]">-</p>
                                        <p className="text-xs text-gray-600">{t.recentActivity}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Tabs */}
                    <Card>
                        <CardContent className="p-6">
                            <Tabs defaultValue="search" className="space-y-4">
                                <TabsList className="grid w-full grid-cols-6">
                                    <TabsTrigger value="search">
                                        <Search className="w-4 h-4 mr-2" />
                                        {t.search}
                                    </TabsTrigger>
                                    <TabsTrigger value="collections">
                                        <FolderOpen className="w-4 h-4 mr-2" />
                                        {t.collections}
                                    </TabsTrigger>
                                    <TabsTrigger value="workflows">
                                        <Workflow className="w-4 h-4 mr-2" />
                                        {t.workflows}
                                    </TabsTrigger>
                                    <TabsTrigger value="executions">
                                        <Activity className="w-4 h-4 mr-2" />
                                        {t.executions}
                                    </TabsTrigger>
                                    <TabsTrigger value="trends">
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        {t.trends}
                                    </TabsTrigger>
                                    <TabsTrigger value="analytics">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        {t.analytics}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="search">
                                    <UnifiedContentSearch lang={lang} />
                                </TabsContent>

                                <TabsContent value="collections">
                                    <CollectionManager lang={lang} />
                                </TabsContent>

                                <TabsContent value="workflows">
                                    <WorkflowBuilder lang={lang} />
                                </TabsContent>

                                <TabsContent value="executions">
                                    <WorkflowExecutionMonitor lang={lang} />
                                </TabsContent>

                                <TabsContent value="trends">
                                    <TrendBasedSuggestions lang={lang} />
                                </TabsContent>

                                <TabsContent value="analytics">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{t.analytics}</CardTitle>
                                            <CardDescription>
                                                {lang === 'pt' 
                                                    ? 'Métricas e insights sobre uso de conteúdo'
                                                    : 'Metrics and insights on content usage'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-center text-gray-500 py-8">
                                                {lang === 'pt' ? 'Em desenvolvimento' : 'Coming soon'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}