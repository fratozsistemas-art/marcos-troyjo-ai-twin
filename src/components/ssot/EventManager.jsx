import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EventManager({ lang = 'pt' }) {
    const [events, setEvents] = useState([]);
    const [forums, setForums] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        forum_id: '',
        event_type: 'summit',
        start_date: '',
        end_date: '',
        location: { city: '', country: '', venue: '' },
        description: '',
        key_themes: [],
        outcomes: '',
        website: '',
        status: 'scheduled',
        significance: ''
    });

    const t = {
        pt: {
            title: 'Eventos',
            subtitle: 'Gerenciar eventos e cúpulas',
            create: 'Adicionar Evento',
            edit: 'Editar',
            delete: 'Excluir',
            save: 'Salvar',
            cancel: 'Cancelar',
            search: 'Buscar eventos...',
            name: 'Nome do Evento',
            forum: 'Fórum',
            type: 'Tipo',
            startDate: 'Data de Início',
            endDate: 'Data de Término',
            location: 'Localização',
            city: 'Cidade',
            country: 'País',
            venue: 'Local',
            description: 'Descrição',
            outcomes: 'Resultados',
            website: 'Website',
            status: 'Status',
            significance: 'Importância',
            deleteConfirm: 'Tem certeza que deseja excluir este evento?'
        },
        en: {
            title: 'Events',
            subtitle: 'Manage events and summits',
            create: 'Add Event',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            search: 'Search events...',
            name: 'Event Name',
            forum: 'Forum',
            type: 'Type',
            startDate: 'Start Date',
            endDate: 'End Date',
            location: 'Location',
            city: 'City',
            country: 'Country',
            venue: 'Venue',
            description: 'Description',
            outcomes: 'Outcomes',
            website: 'Website',
            status: 'Status',
            significance: 'Significance',
            deleteConfirm: 'Are you sure you want to delete this event?'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [eventsData, forumsData] = await Promise.all([
                base44.entities.Event.list('-start_date'),
                base44.entities.Forum.filter({ active: true })
            ]);
            setEvents(eventsData || []);
            setForums(forumsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingEvent) {
                await base44.entities.Event.update(editingEvent.id, formData);
                toast.success(lang === 'pt' ? 'Evento atualizado!' : 'Event updated!');
            } else {
                await base44.entities.Event.create(formData);
                toast.success(lang === 'pt' ? 'Evento criado!' : 'Event created!');
            }
            setDialogOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error saving event:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar evento' : 'Error saving event');
        }
    };

    const handleDelete = async (eventId) => {
        if (!confirm(text.deleteConfirm)) return;
        try {
            await base44.entities.Event.delete(eventId);
            toast.success(lang === 'pt' ? 'Evento excluído!' : 'Event deleted!');
            loadData();
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir evento' : 'Error deleting event');
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            name: event.name || '',
            forum_id: event.forum_id || '',
            event_type: event.event_type || 'summit',
            start_date: event.start_date || '',
            end_date: event.end_date || '',
            location: event.location || { city: '', country: '', venue: '' },
            description: event.description || '',
            key_themes: event.key_themes || [],
            outcomes: event.outcomes || '',
            website: event.website || '',
            status: event.status || 'scheduled',
            significance: event.significance || ''
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingEvent(null);
        setFormData({
            name: '',
            forum_id: '',
            event_type: 'summit',
            start_date: '',
            end_date: '',
            location: { city: '', country: '', venue: '' },
            description: '',
            key_themes: [],
            outcomes: '',
            website: '',
            status: 'scheduled',
            significance: ''
        });
    };

    const filteredEvents = events.filter(event =>
        event.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Calendar className="w-5 h-5" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.subtitle}</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                                <Plus className="w-4 h-4" />
                                {text.create}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingEvent ? text.edit : text.create}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label>{text.name}</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="G20 Brasil 2024 - Leaders' Summit"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{text.forum}</Label>
                                        <Select value={formData.forum_id} onValueChange={(value) => setFormData({ ...formData, forum_id: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {forums.map(forum => (
                                                    <SelectItem key={forum.id} value={forum.id}>
                                                        {forum.acronym || forum.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>{text.type}</Label>
                                        <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="summit">Summit</SelectItem>
                                                <SelectItem value="ministerial">Ministerial</SelectItem>
                                                <SelectItem value="working_group">Working Group</SelectItem>
                                                <SelectItem value="conference">Conference</SelectItem>
                                                <SelectItem value="workshop">Workshop</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{text.startDate}</Label>
                                        <Input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>{text.endDate}</Label>
                                        <Input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{text.location}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            value={formData.location.city}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                            placeholder={text.city}
                                        />
                                        <Input
                                            value={formData.location.country}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                                            placeholder={text.country}
                                        />
                                    </div>
                                    <Input
                                        value={formData.location.venue}
                                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location, venue: e.target.value } })}
                                        placeholder={text.venue}
                                    />
                                </div>
                                <div>
                                    <Label>{text.description}</Label>
                                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                                </div>
                                <div>
                                    <Label>{text.status}</Label>
                                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>{text.cancel}</Button>
                                    <Button onClick={handleSave} disabled={!formData.name || !formData.start_date} className="bg-[#002D62]">{text.save}</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={text.search} className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="p-4 rounded-lg border hover:border-[#002D62]/30 transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-[#002D62]">{event.name}</h4>
                                        <Badge variant="outline">{event.event_type}</Badge>
                                        <Badge variant={event.status === 'completed' ? 'secondary' : 'default'}>
                                            {event.status}
                                        </Badge>
                                    </div>
                                    {event.start_date && (
                                        <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(event.start_date), 'dd/MM/yyyy')}
                                            {event.end_date && ` - ${format(new Date(event.end_date), 'dd/MM/yyyy')}`}
                                        </p>
                                    )}
                                    {event.location?.city && (
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {event.location.city}, {event.location.country}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(event.id)} className="text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}