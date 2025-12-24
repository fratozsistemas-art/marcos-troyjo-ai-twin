import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, LayoutDashboard, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import VisualizationWidget from './VisualizationWidget';

export default function DashboardViewer({ lang = 'pt' }) {
    const [dashboards, setDashboards] = useState([]);
    const [selectedDashboard, setSelectedDashboard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const t = {
        pt: {
            title: 'Dashboards Salvos',
            select: 'Selecionar Dashboard',
            delete: 'Excluir',
            noDashboards: 'Nenhum dashboard salvo',
            confirmDelete: 'Tem certeza que deseja excluir este dashboard?'
        },
        en: {
            title: 'Saved Dashboards',
            select: 'Select Dashboard',
            delete: 'Delete',
            noDashboards: 'No saved dashboards',
            confirmDelete: 'Are you sure you want to delete this dashboard?'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadDashboards();
    }, []);

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
                                <Button variant="outline" size="sm" onClick={handleDelete}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
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
                <div className="grid md:grid-cols-2 gap-6">
                    {selectedDashboard.widgets?.map(widget => (
                        <VisualizationWidget
                            key={widget.id}
                            config={widget}
                            autoRefresh={selectedDashboard.auto_refresh}
                            refreshInterval={selectedDashboard.refresh_interval}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}