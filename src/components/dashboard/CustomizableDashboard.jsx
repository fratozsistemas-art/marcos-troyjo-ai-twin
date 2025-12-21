import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, GripVertical, Eye, EyeOff, Plus, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import GeopoliticalAlertPanel from '@/components/alerts/GeopoliticalAlertPanel';
import GeopoliticalRiskMonitor from '@/components/dashboard/GeopoliticalRiskMonitor';
import InsightsSection from '@/components/dashboard/InsightsSection';
import PersonaAnalytics from '@/components/dashboard/PersonaAnalytics';
import DocumentManager from '@/components/documents/DocumentManager';
import KnowledgeHub from '@/components/knowledge/KnowledgeHub';
import InterviewTranscriptManager from '@/components/interviews/InterviewTranscriptManager';
import CorporateFactManager from '@/components/ssot/CorporateFactManager';
import TopicTracker from '@/components/profile/TopicTracker';

const widgetComponents = {
    alerts: GeopoliticalAlertPanel,
    risks: GeopoliticalRiskMonitor,
    insights: InsightsSection,
    analytics: PersonaAnalytics,
    documents: DocumentManager,
    knowledge: KnowledgeHub,
    transcripts: InterviewTranscriptManager,
    ssot: CorporateFactManager,
    topics: TopicTracker
};

const widgetMetadata = {
    alerts: { name: 'Alertas Geopolíticos', icon: '🚨' },
    risks: { name: 'Monitor de Riscos', icon: '⚠️' },
    insights: { name: 'Insights', icon: '💡' },
    analytics: { name: 'Analytics Persona', icon: '📊' },
    documents: { name: 'Documentos', icon: '📄' },
    knowledge: { name: 'Base de Conhecimento', icon: '📚' },
    transcripts: { name: 'Transcrições', icon: '🎙️' },
    ssot: { name: 'SSOT', icon: '🗄️' },
    topics: { name: 'Tópicos', icon: '🏷️' }
};

export default function CustomizableDashboard({ lang = 'pt' }) {
    const [layout, setLayout] = useState(null);
    const [widgets, setWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        loadLayout();
    }, []);

    const loadLayout = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const layouts = await base44.entities.DashboardLayout.filter({ 
                user_email: user.email, 
                is_default: true 
            });

            if (layouts.length > 0) {
                setLayout(layouts[0]);
                setWidgets(layouts[0].widgets || getDefaultWidgets());
            } else {
                const defaultWidgets = getDefaultWidgets();
                setWidgets(defaultWidgets);
                const newLayout = await base44.entities.DashboardLayout.create({
                    user_email: user.email,
                    layout_name: 'Meu Dashboard',
                    widgets: defaultWidgets,
                    is_default: true
                });
                setLayout(newLayout);
            }
        } catch (error) {
            console.error('Error loading layout:', error);
            setWidgets(getDefaultWidgets());
        } finally {
            setLoading(false);
        }
    };

    const getDefaultWidgets = () => [
        { id: '1', type: 'insights', position: 0, visible: true, size: 'large' },
        { id: '2', type: 'alerts', position: 1, visible: true, size: 'medium' },
        { id: '3', type: 'risks', position: 2, visible: true, size: 'medium' },
        { id: '4', type: 'analytics', position: 3, visible: true, size: 'small' },
        { id: '5', type: 'topics', position: 4, visible: true, size: 'small' }
    ];

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(widgets);
        const [reordered] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reordered);

        const updatedWidgets = items.map((item, index) => ({
            ...item,
            position: index
        }));

        setWidgets(updatedWidgets);
    };

    const toggleWidgetVisibility = (widgetId) => {
        setWidgets(widgets.map(w => 
            w.id === widgetId ? { ...w, visible: !w.visible } : w
        ));
    };

    const saveLayout = async () => {
        setSaving(true);
        try {
            if (layout) {
                await base44.entities.DashboardLayout.update(layout.id, {
                    widgets: widgets
                });
                toast.success(lang === 'pt' ? 'Layout salvo!' : 'Layout saved!');
            }
        } catch (error) {
            console.error('Error saving layout:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        } finally {
            setSaving(false);
        }
    };

    const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.position - b.position);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[#002D62]">
                        {lang === 'pt' ? 'Meu Dashboard' : 'My Dashboard'}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {lang === 'pt' ? 'Personalize sua visualização' : 'Customize your view'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={editMode ? 'default' : 'outline'}
                        onClick={() => setEditMode(!editMode)}
                        size="sm"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        {editMode ? (lang === 'pt' ? 'Concluir' : 'Done') : (lang === 'pt' ? 'Editar' : 'Edit')}
                    </Button>
                    {editMode && (
                        <>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {lang === 'pt' ? 'Widgets' : 'Widgets'}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {lang === 'pt' ? 'Gerenciar Widgets' : 'Manage Widgets'}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        {widgets.map(widget => (
                                            <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{widgetMetadata[widget.type]?.icon}</span>
                                                    <span className="font-medium">{widgetMetadata[widget.type]?.name}</span>
                                                </div>
                                                <Switch
                                                    checked={widget.visible}
                                                    onCheckedChange={() => toggleWidgetVisibility(widget.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={saveLayout} disabled={saving} size="sm" className="bg-[#002D62]">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                {lang === 'pt' ? 'Salvar' : 'Save'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {editMode ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="dashboard">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4"
                            >
                                {visibleWidgets.map((widget, index) => {
                                    const Component = widgetComponents[widget.type];
                                    if (!Component) return null;

                                    return (
                                        <Draggable key={widget.id} draggableId={widget.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`relative ${snapshot.isDragging ? 'opacity-50' : ''}`}
                                                >
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="absolute top-4 right-4 z-10 cursor-move bg-white rounded-lg p-2 border shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <GripVertical className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <div className="pointer-events-none">
                                                        <Component lang={lang} />
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            ) : (
                <div className="space-y-4">
                    {visibleWidgets.map((widget) => {
                        const Component = widgetComponents[widget.type];
                        if (!Component) return null;
                        return (
                            <div key={widget.id}>
                                <Component lang={lang} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}