import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, LayoutDashboard, Trash2, Search, X, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import VisualizationWidget from './VisualizationWidget';
import { DashboardProvider, useDashboard } from './DashboardContext';
import GlobalEntitySearch from './GlobalEntitySearch';

const ResponsiveGridLayout = WidthProvider(Responsive);

function DashboardViewerInner({ lang = 'pt' }) {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [layout, setLayout] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { globalFilters, clearFilters, clearFilter } = useDashboard();

    const t = {
        pt: {
            title: 'Dashboards Salvos',
            select: 'Selecionar Dashboard',
            delete: 'Excluir',
            noDashboards: 'Nenhum dashboard salvo',
            confirmDelete: 'Tem certeza que deseja excluir este dashboard?',
            search: 'Buscar Dados',
            clearFilters: 'Limpar Filtros',
            activeFilters: 'Filtros Ativos',
            saveLayout: 'Salvar Layout'
        },
        en: {
            title: 'Saved Dashboards',
            select: 'Select Dashboard',
            delete: 'Delete',
            noDashboards: 'No saved dashboards',
            confirmDelete: 'Are you sure you want to delete this dashboard?',
            search: 'Search Data',
            clearFilters: 'Clear Filters',
            activeFilters: 'Active Filters',
            saveLayout: 'Save Layout'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadDashboards();
    }, []);

    useEffect(() => {
        if (selectedDashboard) {
            setLayout(selectedDashboard.layout || []);
        }
    }, [selectedDashboard]);

    const loadDashboards = async () => {
        setIsLoading(true);
        try {
            const data = await base44.entities.SavedDashboard.list();
            setDashboards(data);
            if (data.length > 0) {
                setSelectedDashboard(data[0]);
            }
        } catch (error) {
            console.error('Error loading dashboards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedDashboard || !confirm(text.confirmDelete)) return;

        try {
            await base44.entities.SavedDashboard.delete(selectedDashboard.id);
            toast.success(lang === 'pt' ? 'Dashboard excluído!' : 'Dashboard deleted!');
            loadDashboards();
            setSelectedDashboard(null);
        } catch (error) {
            console.error('Error deleting dashboard:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
    };

    const handleSaveLayout = async () => {
        if (!selectedDashboard) return;

        try {
            await base44.entities.SavedDashboard.update(selectedDashboard.id, {
                layout: layout
            });
            toast.success(lang === 'pt' ? 'Layout salvo!' : 'Layout saved!');
        } catch (error) {
            console.error('Error saving layout:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar layout' : 'Error saving layout');
        }
    };

    const handleSearchSelect = (entity, record) => {
        console.log('Selected:', entity, record);
        toast.success(lang === 'pt' ? 'Item selecionado' : 'Item selected');
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#002D62] mx-auto" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5 text-[#002D62]" />
                            {text.title}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsSearchOpen(true)}>
                                <Search className="w-4 h-4 mr-2" />
                                {text.search}
                            </Button>
                            {Object.keys(globalFilters).length > 0 && (
                                <Button variant="outline" size="sm" onClick={clearFilters}>
                                    <X className="w-4 h-4 mr-2" />
                                    {text.clearFilters}
                                </Button>
                            )}
                            <Select
                                value={selectedDashboard?.id}
                                onValueChange={(id) => setSelectedDashboard(dashboards.find(d => d.id === id))}
                            >
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder={text.select} />
                                </SelectTrigger>
                                <SelectContent>
                                    {dashboards.map(d => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedDashboard && (
                                <>
                                    <Button variant="outline" size="sm" onClick={handleSaveLayout}>
                                        <Save className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleDelete}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    {Object.keys(globalFilters).length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs text-gray-500">{text.activeFilters}:</span>
                            {Object.entries(globalFilters).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                    {key}: {String(value).slice(0, 20)}
                                    <button onClick={() => clearFilter(key)} className="ml-2">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardHeader>
            </Card>

            {!selectedDashboard ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-400">
                        <LayoutDashboard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>{text.noDashboards}</p>
                    </CardContent>
                </Card>
            ) : (
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: layout }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={100}
                    onLayoutChange={handleLayoutChange}
                    draggableHandle=".drag-handle"
                >
                    {selectedDashboard.widgets?.map(widget => (
                        <div key={widget.id} className="relative">
                            <div className="drag-handle absolute top-2 left-2 w-full h-8 cursor-move z-10 flex items-center justify-center">
                                <div className="w-8 h-1 bg-gray-300 rounded" />
                            </div>
                            <VisualizationWidget
                                config={widget}
                                autoRefresh={selectedDashboard.auto_refresh}
                                refreshInterval={selectedDashboard.refresh_interval}
                                lang={lang}
                            />
                        </div>
                    ))}
                </ResponsiveGridLayout>
            )}

            <GlobalEntitySearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleSearchSelect}
                lang={lang}
            />
        </div>
    );
}

export default function DashboardViewer({ lang = 'pt' }) {
    return (
        <DashboardProvider>
            <DashboardViewerInner lang={lang} />
        </DashboardProvider>
    );
}