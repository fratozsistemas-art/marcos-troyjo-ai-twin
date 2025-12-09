import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, CheckCircle2, Clock, XCircle, Loader2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
                                
                                <Card className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <Badge className={`mb-2 ${getCategoryColor(event?.category)}`}>
                                                   {event?.category || 'Uncategorized'}
                                                </Badge>
                                                <CardTitle className="text-lg text-[#002D62]">{event?.name || 'Untitled Event'}</CardTitle>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {event?.start_date ? new Date(event.start_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { 
                                                            year: 'numeric', 
                                                            month: 'short', 
                                                            day: 'numeric' 
                                                        }) : 'N/A'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {event?.jurisdiction || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-gray-700">{event?.summary || 'No summary available'}</p>
                                        
                                        {event?.actors && Array.isArray(event.actors) && event.actors.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {t.actors}:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {event.actors.map((actor, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs">
                                                            {actor}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}