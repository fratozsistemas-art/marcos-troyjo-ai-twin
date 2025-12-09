import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, CheckCircle2, Clock, XCircle, Loader2, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TimelineCard from '@/components/timeline/TimelineCard';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Observatório de Políticas',
        subtitle: 'Linha do tempo de eventos geopolíticos críticos',
        filterAll: 'Todos',
        filterCategory: 'Por Categoria',
        loading: 'Carregando eventos...',
        noEvents: 'Nenhum evento encontrado',
        actors: 'Atores',
        status: 'Status',
        jurisdiction: 'Jurisdição',
        sources: 'Fontes',
        statusDone: 'Concluído',
        statusOngoing: 'Em andamento',
        statusPending: 'Pendente',
        statusCancelled: 'Cancelado'
    },
    en: {
        title: 'Policy Observatory',
        subtitle: 'Timeline of critical geopolitical events',
        filterAll: 'All',
        filterCategory: 'By Category',
        loading: 'Loading events...',
        noEvents: 'No events found',
        actors: 'Actors',
        status: 'Status',
        jurisdiction: 'Jurisdiction',
        sources: 'Sources',
        statusDone: 'Done',
        statusOngoing: 'Ongoing',
        statusPending: 'Pending',
        statusCancelled: 'Cancelled'
    }
};

export default function PolicyObservatory({ lang = 'pt' }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [exporting, setExporting] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await base44.entities.TimelineEvent.list('-start_date', 50);
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['AI Governance', 'Brazil AI Legal', 'Semiconductors', 'BRICS', 'US Defense', 'Trade'];
    
    const filteredEvents = selectedCategory === 'all' 
        ? events 
        : events.filter(e => e?.category === selectedCategory);

    const handleExport = async (format = 'detailed') => {
        setExporting(true);
        try {
            const response = await base44.functions.invoke('exportTimelineJSON', {
                category: selectedCategory === 'all' ? null : selectedCategory,
                format
            });
            
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `timeline-${format}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            toast.success(lang === 'pt' ? 'Timeline exportada!' : 'Timeline exported!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error(lang === 'pt' ? 'Erro ao exportar' : 'Export failed');
        } finally {
            setExporting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'done': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
            case 'ongoing': return <Clock className="w-4 h-4 text-blue-600" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'AI Governance': 'bg-purple-100 text-purple-800 border-purple-200',
            'Brazil AI Legal': 'bg-green-100 text-green-800 border-green-200',
            'Semiconductors': 'bg-orange-100 text-orange-800 border-orange-200',
            'BRICS': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'US Defense': 'bg-red-100 text-red-800 border-red-200',
            'Trade': 'bg-blue-100 text-blue-800 border-blue-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    <span className="ml-2 text-sm text-gray-600">{t.loading}</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Export */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#002D62]">{t.title}</h2>
                    <p className="text-sm text-gray-600">{t.subtitle}</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('caio_pipeline')}
                        disabled={exporting}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        CAIO Export
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('detailed')}
                        disabled={exporting}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        JSON
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    size="sm"
                    className={selectedCategory === 'all' ? 'bg-[#002D62]' : ''}
                >
                    {t.filterAll}
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(cat)}
                        size="sm"
                        className={selectedCategory === cat ? 'bg-[#002D62]' : ''}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Timeline */}
            <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                <div className="space-y-6">
                    {filteredEvents.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">{t.noEvents}</p>
                    ) : (
                        filteredEvents.map((event, idx) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative pl-12"
                            >
                                <div className="absolute left-0 w-8 h-8 bg-white border-4 border-[#002D62] rounded-full flex items-center justify-center">
                                    {getStatusIcon(event?.status)}
                                </div>
                                
                                <TimelineCard event={event} index={idx} lang={lang} />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}