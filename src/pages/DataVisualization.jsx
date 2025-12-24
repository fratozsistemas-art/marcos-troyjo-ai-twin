import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, LayoutDashboard, Eye } from 'lucide-react';
import DashboardBuilder from '../components/visualizations/DashboardBuilder';
import DashboardViewer from '../components/visualizations/DashboardViewer';

export default function DataVisualization() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    const t = {
        pt: {
            title: 'Visualização de Dados',
            subtitle: 'Crie gráficos e dashboards customizados',
            builder: 'Construtor',
            viewer: 'Visualizador',
            back: 'Voltar'
        },
        en: {
            title: 'Data Visualization',
            subtitle: 'Create custom charts and dashboards',
            builder: 'Builder',
            viewer: 'Viewer',
            back: 'Back'
        }
    };

    const text = t[lang];

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">{text.back}</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{text.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{text.subtitle}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <Tabs defaultValue="builder" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="builder" className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            {text.builder}
                        </TabsTrigger>
                        <TabsTrigger value="viewer" className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {text.viewer}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="builder">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <DashboardBuilder lang={lang} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="viewer">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <DashboardViewer lang={lang} />
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}