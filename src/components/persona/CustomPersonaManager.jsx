import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Sparkles, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomPersonaManager({ lang = 'pt', onPersonaSelect }) {
    const [personas, setPersonas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPersona, setEditingPersona] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        description: '',
        system_prompt: '',
        temperature: 0.7,
        top_p: 0.9,
        focus_areas: []
    });

    const t = {
        pt: {
            title: 'Personas Customizadas',
            subtitle: 'Crie e gerencie personas adaptadas ao seu contexto',
            create: 'Criar Persona',
            edit: 'Editar',
            delete: 'Excluir',
            name: 'Nome da Persona',
            role: 'Papel Organizacional',
            description: 'Descrição',
            systemPrompt: 'Prompt de Sistema',
            temperature: 'Temperatura',
            topP: 'Top P',
            focusAreas: 'Áreas de Foco',
            save: 'Salvar',
            cancel: 'Cancelar',
            noPersonas: 'Nenhuma persona customizada',
            createFirst: 'Crie sua primeira persona adaptada ao seu contexto',
            deleteConfirm: 'Tem certeza que deseja excluir esta persona?',
            usageCount: 'Usos',
            avgFeedback: 'Feedback Médio',
            roleExamples: 'Ex: CFO, Analista, Consultor de Política Externa',
            systemPromptPlaceholder: 'Você é um especialista em... Seu papel é... Você deve...',
            focusAreasPlaceholder: 'Ex: BRICS, Comércio Internacional, IA',
            addFocusArea: 'Adicionar'
        },
        en: {
            title: 'Custom Personas',
            subtitle: 'Create and manage personas adapted to your context',
            create: 'Create Persona',
            edit: 'Edit',
            delete: 'Delete',
            name: 'Persona Name',
            role: 'Organizational Role',
            description: 'Description',
            systemPrompt: 'System Prompt',
            temperature: 'Temperature',
            topP: 'Top P',
            focusAreas: 'Focus Areas',
            save: 'Save',
            cancel: 'Cancel',
            noPersonas: 'No custom personas',
            createFirst: 'Create your first persona adapted to your context',
            deleteConfirm: 'Are you sure you want to delete this persona?',
            usageCount: 'Uses',
            avgFeedback: 'Average Feedback',
            roleExamples: 'E.g.: CFO, Analyst, Foreign Policy Consultant',
            systemPromptPlaceholder: 'You are an expert in... Your role is... You should...',
            focusAreasPlaceholder: 'E.g.: BRICS, International Trade, AI',
            addFocusArea: 'Add'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadPersonas();
    }, []);

    const loadPersonas = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            const data = await base44.entities.CustomAgentPersona.filter({
                created_by: user.email,
                active: true
            }, '-created_date');
            setPersonas(data || []);
        } catch (error) {
            console.error('Error loading personas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const user = await base44.auth.me();
            
            if (editingPersona) {
                await base44.entities.CustomAgentPersona.update(editingPersona.id, {
                    ...formData,
                    agent_name: 'troyjo_twin'
                });
                toast.success(lang === 'pt' ? 'Persona atualizada!' : 'Persona updated!');
            } else {
                await base44.entities.CustomAgentPersona.create({
                    ...formData,
                    agent_name: 'troyjo_twin',
                    created_by: user.email,
                    usage_count: 0
                });
                toast.success(lang === 'pt' ? 'Persona criada!' : 'Persona created!');
            }

            setDialogOpen(false);
            setEditingPersona(null);
            setFormData({
                name: '',
                role: '',
                description: '',
                system_prompt: '',
                temperature: 0.7,
                top_p: 0.9,
                focus_areas: []
            });
            loadPersonas();
        } catch (error) {
            console.error('Error saving persona:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar persona' : 'Error saving persona');
        }
    };

    const handleEdit = (persona) => {
        setEditingPersona(persona);
        setFormData({
            name: persona.name,
            role: persona.role,
            description: persona.description,
            system_prompt: persona.system_prompt,
            temperature: persona.temperature || 0.7,
            top_p: persona.top_p || 0.9,
            focus_areas: persona.focus_areas || []
        });
        setDialogOpen(true);
    };

    const handleDelete = async (personaId) => {
        if (!confirm(text.deleteConfirm)) return;

        try {
            await base44.entities.CustomAgentPersona.update(personaId, { active: false });
            toast.success(lang === 'pt' ? 'Persona excluída!' : 'Persona deleted!');
            loadPersonas();
        } catch (error) {
            console.error('Error deleting persona:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir persona' : 'Error deleting persona');
        }
    };

    const [newFocusArea, setNewFocusArea] = useState('');

    const addFocusArea = () => {
        if (newFocusArea.trim()) {
            setFormData({
                ...formData,
                focus_areas: [...formData.focus_areas, newFocusArea.trim()]
            });
            setNewFocusArea('');
        }
    };

    const removeFocusArea = (index) => {
        setFormData({
            ...formData,
            focus_areas: formData.focus_areas.filter((_, i) => i !== index)
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Sparkles className="w-5 h-5" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.subtitle}</CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={() => {
                                    setEditingPersona(null);
                                    setFormData({
                                        name: '',
                                        role: '',
                                        description: '',
                                        system_prompt: '',
                                        temperature: 0.7,
                                        top_p: 0.9,
                                        focus_areas: []
                                    });
                                }}
                                className="bg-[#002D62] hover:bg-[#001d42] gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {text.create}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPersona ? text.edit : text.create}
                                </DialogTitle>
                                <DialogDescription>
                                    {text.subtitle}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label>{text.name}</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: CFO Estratégico"
                                    />
                                </div>
                                <div>
                                    <Label>{text.role}</Label>
                                    <Input
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        placeholder={text.roleExamples}
                                    />
                                </div>
                                <div>
                                    <Label>{text.description}</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder={lang === 'pt' 
                                            ? 'Descreva o contexto e propósito desta persona...'
                                            : 'Describe the context and purpose of this persona...'}
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label>{text.systemPrompt}</Label>
                                    <Textarea
                                        value={formData.system_prompt}
                                        onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                                        placeholder={text.systemPromptPlaceholder}
                                        rows={6}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{text.temperature}: {formData.temperature}</Label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={formData.temperature}
                                            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <Label>{text.topP}: {formData.top_p}</Label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={formData.top_p}
                                            onChange={(e) => setFormData({ ...formData, top_p: parseFloat(e.target.value) })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>{text.focusAreas}</Label>
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={newFocusArea}
                                            onChange={(e) => setNewFocusArea(e.target.value)}
                                            placeholder={text.focusAreasPlaceholder}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addFocusArea();
                                                }
                                            }}
                                        />
                                        <Button onClick={addFocusArea} size="sm">
                                            {text.addFocusArea}
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.focus_areas.map((area, idx) => (
                                            <Badge key={idx} variant="secondary" className="gap-1">
                                                {area}
                                                <button onClick={() => removeFocusArea(idx)} className="ml-1 hover:text-red-600">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        {text.cancel}
                                    </Button>
                                    <Button 
                                        onClick={handleSave}
                                        disabled={!formData.name || !formData.role || !formData.system_prompt}
                                        className="bg-[#002D62] hover:bg-[#001d42]"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {text.save}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {personas.length === 0 ? (
                    <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-1">{text.noPersonas}</p>
                        <p className="text-xs text-gray-500">{text.createFirst}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {personas.map((persona, idx) => (
                                <motion.div
                                    key={persona.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card 
                                        className="hover:shadow-md transition-all cursor-pointer border-l-4 border-[#D4AF37]"
                                        onClick={() => onPersonaSelect && onPersonaSelect(persona)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-base text-[#002D62]">
                                                        {persona.name}
                                                    </CardTitle>
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        {persona.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(persona);
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(persona.id);
                                                        }}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {persona.description}
                                            </p>
                                            {persona.focus_areas && persona.focus_areas.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {persona.focus_areas.slice(0, 3).map((area, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {area}
                                                        </Badge>
                                                    ))}
                                                    {persona.focus_areas.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{persona.focus_areas.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>T: {persona.temperature || 0.7}</span>
                                                <span>P: {persona.top_p || 0.9}</span>
                                                {persona.usage_count > 0 && (
                                                    <span>{text.usageCount}: {persona.usage_count}</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}