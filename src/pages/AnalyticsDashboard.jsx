import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
    LayoutDashboard, Plus, Save, Share2, ArrowLeft, Trash2, 
    Eye, Star, StarOff, Download, Grid3x3, Loader2, Copy, Check, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardWidget from '@/components/analytics/DashboardWidget';
import WidgetSelector from '@/components/analytics/WidgetSelector';
import GoogleDriveExport from '@/components/integrations/GoogleDriveExport';

const translations = {
    pt: {
        title: 'Dashboard de Análise',
        description: 'Visualizações personalizadas de dados econômicos',
        newDashboard: 'Novo Dashboard',
        saveDashboard: 'Salvar Dashboard',
        share: 'Compartilhar',
        addWidget: 'Adicionar Widget',
        myDashboards: 'Meus Dashboards',
        name: 'Nome',
        dashboardName: 'Nome do Dashboard',
        dashboardDescription: 'Descrição (opcional)',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        favorite: 'Favoritar',
        views: 'visualizações',
        lastViewed: 'Última visualização',
        export: 'Exportar',
        copyLink: 'Copiar Link',
        linkCopied: 'Link copiado!',
        saving: 'Salvando...',
        loading: 'Carregando...',
        noWidgets: 'Nenhum widget adicionado',
        addFirstWidget: 'Adicione seu primeiro widget para começar'
    },
    en: {
        title: 'Analytics Dashboard',
        description: 'Custom economic data visualizations',
        newDashboard: 'New Dashboard',
        saveDashboard: 'Save Dashboard',
        share: 'Share',
        addWidget: 'Add Widget',
        myDashboards: 'My Dashboards',
        name: 'Name',
        dashboardName: 'Dashboard Name',
        dashboardDescription: 'Description (optional)',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        favorite: 'Favorite',
        views: 'views',
        lastViewed: 'Last viewed',
        export: 'Export',
        copyLink: 'Copy Link',
        linkCopied: 'Link copied!',
        saving: 'Saving...',
        loading: 'Loading...',
        noWidgets: 'No widgets added',
        addFirstWidget: 'Add your first widget to get started'
    }
};

export default function AnalyticsDashboard() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [currentDashboard, setCurrentDashboard] = useState(null);
    const [dashboards, setDashboards] = useState([]);
    const [widgets, setWidgets] = useState([]);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [widgetSelectorOpen, setWidgetSelectorOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [dashboardsDialogOpen, setDashboardsDialogOpen] = useState(false);
    const [dashboardName, setDashboardName] = useState('');
    const [dashboardDescription, setDashboardDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadDashboards();
        
        // Check URL for dashboard ID
        const urlParams = new URLSearchParams(window.location.search);
        const dashboardId = urlParams.get('id');
        if (dashboardId) {
            loadDashboard(dashboardId);
        }
    }, []);

    const loadDashboards = async () => {
        try {
            const data = await base44.entities.SavedDashboard.list('-updated_date');
            setDashboards(data);
        } catch (error) {
            console.error('Error loading dashboards:', error);
        }
    };

    const loadDashboard = async (id) => {
        setLoading(true);
        try {
            const dashboard = await base44.entities.SavedDashboard.filter({ id });
            if (dashboard.length > 0) {
                setCurrentDashboard(dashboard[0]);
                setWidgets(dashboard[0].layout || []);
                setDashboardName(dashboard[0].name);
                setDashboardDescription(dashboard[0].description || '');
                
                // Update views
                await base44.entities.SavedDashboard.update(id, {
                    views: (dashboard[0].views || 0) + 1,
                    last_viewed: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar dashboard' : 'Error loading dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDashboard = async () => {
        if (!dashboardName.trim()) {
            toast.error(lang === 'pt' ? 'Digite um nome' : 'Enter a name');
            return;
        }

        setSaving(true);
        try {
            if (currentDashboard) {
                // Update existing
                await base44.entities.SavedDashboard.update(currentDashboard.id, {
                    name: dashboardName,
                    description: dashboardDescription,
                    layout: widgets
                });
                toast.success(lang === 'pt' ? 'Dashboard atualizado!' : 'Dashboard updated!');
            } else {
                // Create new
                const newDashboard = await base44.entities.SavedDashboard.create({
                    name: dashboardName,
                    description: dashboardDescription,
                    layout: widgets
                });
                setCurrentDashboard(newDashboard);
                window.history.pushState({}, '', createPageUrl('AnalyticsDashboard') + `?id=${newDashboard.id}`);
                toast.success(lang === 'pt' ? 'Dashboard criado!' : 'Dashboard created!');
            }
            loadDashboards();
            setSaveDialogOpen(false);
        } catch (error) {
            console.error('Error saving dashboard:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        } finally {
            setSaving(false);
        }
    };

    const handleAddWidget = (widgetConfig) => {
        const newWidget = {
            id: `widget-${Date.now()}`,
            ...widgetConfig,
            position: {
                x: 0,
                y: widgets.length,
                w: 2,
                h: 2
            }
        };
        setWidgets([...widgets, newWidget]);
        setWidgetSelectorOpen(false);
    };

    const handleRemoveWidget = (widgetId) => {
        setWidgets(widgets.filter(w => w.id !== widgetId));
    };

    const handleUpdateWidget = (widgetId, updates) => {
        setWidgets(widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w));
    };

    const handleNewDashboard = () => {
        setCurrentDashboard(null);
        setWidgets([]);
        setDashboardName('');
        setDashboardDescription('');
        window.history.pushState({}, '', createPageUrl('AnalyticsDashboard'));
    };

    const handleDeleteDashboard = async () => {
        if (!currentDashboard) return;
        if (!confirm(lang === 'pt' ? 'Deseja excluir este dashboard?' : 'Delete this dashboard?')) return;

        try {
            await base44.entities.SavedDashboard.delete(currentDashboard.id);
            toast.success(lang === 'pt' ? 'Dashboard excluído!' : 'Dashboard deleted!');
            handleNewDashboard();
            loadDashboards();
        } catch (error) {
            console.error('Error deleting dashboard:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const handleToggleFavorite = async () => {
        if (!currentDashboard) return;
        
        try {
            await base44.entities.SavedDashboard.update(currentDashboard.id, {
                is_favorite: !currentDashboard.is_favorite
            });
            setCurrentDashboard({ ...currentDashboard, is_favorite: !currentDashboard.is_favorite });
            loadDashboards();
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleCopyLink = () => {
        const url = window.location.origin + createPageUrl('AnalyticsDashboard') + `?id=${currentDashboard.id}`;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        toast.success(t.linkCopied);
    };

    const handleExportDashboard = () => {
        const exportData = {
            name: dashboardName,
            description: dashboardDescription,
            widgets: widgets,
            exported_at: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-${dashboardName.replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'Dashboard exportado!' : 'Dashboard exported!');
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Dashboard')}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    {lang === 'pt' ? 'Voltar' : 'Back'}
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-[#002D62] flex items-center gap-2">
                                    <LayoutDashboard className="w-5 h-5" />
                                    {currentDashboard ? dashboardName : t.title}
                                </h1>
                                <p className="text-sm text-gray-600">{dashboardDescription || t.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDashboardsDialogOpen(true)}
                                className="gap-2"
                            >
                                <Grid3x3 className="w-4 h-4" />
                                <span className="hidden md:inline">{t.myDashboards}</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNewDashboard}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden md:inline">{t.newDashboard}</span>
                            </Button>
                            {currentDashboard && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleToggleFavorite}
                                    >
                                        {currentDashboard.is_favorite ? (
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ) : (
                                            <StarOff className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShareDialogOpen(true)}
                                        className="gap-2"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden md:inline">{t.share}</span>
                                    </Button>
                                </>
                            )}
                            <Button
                                onClick={() => setSaveDialogOpen(true)}
                                className="bg-[#002D62] gap-2"
                                size="sm"
                            >
                                <Save className="w-4 h-4" />
                                <span className="hidden md:inline">{t.saveDashboard}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                    </div>
                ) : widgets.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <LayoutDashboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noWidgets}</h3>
                            <p className="text-gray-500 mb-6">{t.addFirstWidget}</p>
                            <Button
                                onClick={() => setWidgetSelectorOpen(true)}
                                className="bg-[#002D62] gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {t.addWidget}
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="flex justify-end mb-4">
                            <Button
                                onClick={() => setWidgetSelectorOpen(true)}
                                variant="outline"
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {t.addWidget}
                            </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {widgets.map((widget) => (
                                <DashboardWidget
                                    key={widget.id}
                                    widget={widget}
                                    onRemove={handleRemoveWidget}
                                    onUpdate={handleUpdateWidget}
                                    lang={lang}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Save Dialog */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.saveDashboard}</DialogTitle>
                        <DialogDescription>
                            {lang === 'pt' ? 'Salve seu dashboard para acessar depois' : 'Save your dashboard to access later'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t.dashboardName}</label>
                            <Input
                                value={dashboardName}
                                onChange={(e) => setDashboardName(e.target.value)}
                                placeholder={t.name}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">{t.dashboardDescription}</label>
                            <Textarea
                                value={dashboardDescription}
                                onChange={(e) => setDashboardDescription(e.target.value)}
                                placeholder={t.dashboardDescription}
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                                {t.cancel}
                            </Button>
                            <Button onClick={handleSaveDashboard} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t.saving}
                                    </>
                                ) : (
                                    t.save
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.share}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Button onClick={handleCopyLink} variant="outline" className="w-full gap-2">
                            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {t.copyLink}
                        </Button>
                        <Button onClick={handleExportDashboard} variant="outline" className="w-full gap-2">
                            <Download className="w-4 h-4" />
                            {t.export}
                        </Button>
                        <GoogleDriveExport
                            data={{
                                name: dashboardName,
                                description: dashboardDescription,
                                widgets: widgets,
                                exported_at: new Date().toISOString()
                            }}
                            defaultFileName={`dashboard-${dashboardName.replace(/\s+/g, '-')}.json`}
                            mimeType="application/json"
                            lang={lang}
                            trigger={
                                <Button variant="outline" className="w-full gap-2">
                                    <Upload className="w-4 h-4" />
                                    {lang === 'pt' ? 'Salvar no Drive' : 'Save to Drive'}
                                </Button>
                            }
                        />
                        {currentDashboard && (
                            <Button
                                onClick={handleDeleteDashboard}
                                variant="outline"
                                className="w-full gap-2 text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t.delete}
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dashboards List Dialog */}
            <Dialog open={dashboardsDialogOpen} onOpenChange={setDashboardsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t.myDashboards}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        {dashboards.map((dashboard) => (
                            <div
                                key={dashboard.id}
                                onClick={() => {
                                    loadDashboard(dashboard.id);
                                    setDashboardsDialogOpen(false);
                                    window.history.pushState({}, '', createPageUrl('AnalyticsDashboard') + `?id=${dashboard.id}`);
                                }}
                                className="p-4 rounded-lg border hover:border-[#002D62] cursor-pointer transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-[#002D62]">{dashboard.name}</h4>
                                            {dashboard.is_favorite && (
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            )}
                                        </div>
                                        {dashboard.description && (
                                            <p className="text-sm text-gray-600 mb-2">{dashboard.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {dashboard.views || 0} {t.views}
                                            </span>
                                            {dashboard.last_viewed && (
                                                <span>
                                                    {t.lastViewed}: {new Date(dashboard.last_viewed).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Widget Selector */}
            <WidgetSelector
                open={widgetSelectorOpen}
                onClose={() => setWidgetSelectorOpen(false)}
                onSelect={handleAddWidget}
                lang={lang}
            />
        </div>
    );
}