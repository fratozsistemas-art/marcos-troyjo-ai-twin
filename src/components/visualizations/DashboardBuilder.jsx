import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, Layout, Eye, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ChartBuilder from './ChartBuilder';
import VisualizationWidget from './VisualizationWidget';

export default function DashboardBuilder({ lang = 'pt' }) {
    const [dashboard, setDashboard] = useState({
        name: '',
        description: '',
        widgets: [],
        auto_refresh: true,
        refresh_interval: 30000
    });
    const [isChartBuilderOpen, setIsChartBuilderOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState(null);

    const t = {
        pt: {
            title: 'Construtor de Dashboard',
            name: 'Nome do Dashboard',
            description: 'Descrição',
            addWidget: 'Adicionar Widget',
            save: 'Salvar Dashboard',
            preview: 'Prévia',
            noWidgets: 'Nenhum widget adicionado'
        },
        en: {
            title: 'Dashboard Builder',
            name: 'Dashboard Name',
            description: 'Description',
            addWidget: 'Add Widget',
            save: 'Save Dashboard',
            preview: 'Preview',
            noWidgets: 'No widgets added'
        }
    };

    const text = t[lang];

    const handleSaveChart = (config) => {
        if (!config) {
            setIsChartBuilderOpen(false);
            setEditingWidget(null);
            return;
        }

        const widget = {
            id: editingWidget?.id || Date.now().toString(),
            ...config
        };

        if (editingWidget) {
            setDashboard(prev => ({
                ...prev,
                widgets: prev.widgets.map(w => w.id === widget.id ? widget : w)
            }));
        } else {
            setDashboard(prev => ({
                ...prev,
                widgets: [...prev.widgets, widget]
            }));
        }

        setIsChartBuilderOpen(false);
        setEditingWidget(null);
    };

    const handleRemoveWidget = (widgetId) => {
        setDashboard(prev => ({
            ...prev,
            widgets: prev.widgets.filter(w => w.id !== widgetId)
        }));
    };

    const handleSaveDashboard = async () => {
        if (!dashboard.name) {
            toast.error(lang === 'pt' ? 'Nome é obrigatório' : 'Name is required');
            return;
        }

        try {
            await base44.entities.SavedDashboard.create({
                ...dashboard,
                layout: dashboard.widgets.map((w, i) => ({
                    i: w.id,
                    x: (i % 2) * 6,
                    y: Math.floor(i / 2) * 4,
                    w: 6,
                    h: 4
                }))
            });
            toast.success(lang === 'pt' ? 'Dashboard salvo!' : 'Dashboard saved!');
            setDashboard({
                name: '',
                description: '',
                widgets: [],
                auto_refresh: true,
                refresh_interval: 30000
            });
        } catch (error) {
            console.error('Error saving dashboard:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layout className="w-5 h-5 text-[#002D62]" />
                        {text.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>{text.name}</Label>
                        <Input
                            value={dashboard.name}
                            onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={text.name}
                        />
                    </div>
                    <div>
                        <Label>{text.description}</Label>
                        <Textarea
                            value={dashboard.description}
                            onChange={(e) => setDashboard(prev => ({ ...prev, description: e.target.value }))}
                            placeholder={text.description}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Dialog open={isChartBuilderOpen} onOpenChange={setIsChartBuilderOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {text.addWidget}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>{text.addWidget}</DialogTitle>
                                </DialogHeader>
                                <ChartBuilder
                                    onSave={handleSaveChart}
                                    initialConfig={editingWidget}
                                    lang={lang}
                                />
                            </DialogContent>
                        </Dialog>

                        <Button onClick={handleSaveDashboard}>
                            <Save className="w-4 h-4 mr-2" />
                            {text.save}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {dashboard.widgets.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-400">
                        <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>{text.noWidgets}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {dashboard.widgets.map(widget => (
                        <div key={widget.id} className="relative group">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveWidget(widget.id)}
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                            <VisualizationWidget
                                config={widget}
                                autoRefresh={dashboard.auto_refresh}
                                refreshInterval={dashboard.refresh_interval}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}