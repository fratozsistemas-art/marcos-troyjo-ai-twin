import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';

export default function PersonaProfileEditor({ profile, open, onOpenChange, onSave, lang = 'pt' }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        base_mode: 'tecnico',
        instructions: '',
        core_values: [],
        stylistic_preferences: {
            tone: '',
            formality: 5,
            technicality: 50,
            verbosity: 'balanced',
            use_analogies: true,
            use_data: true
        },
        response_structure: {
            format: 'mixed',
            include_examples: true,
            include_citations: false,
            max_length: 'medium'
        },
        context_triggers: [],
        is_active: true,
        is_default: false,
        tags: []
    });
    
    const [newValue, setNewValue] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newTrigger, setNewTrigger] = useState({ keyword: '', action: '' });

    useEffect(() => {
        if (profile) {
            setFormData({
                ...formData,
                ...profile,
                stylistic_preferences: {
                    ...formData.stylistic_preferences,
                    ...(profile.stylistic_preferences || {})
                },
                response_structure: {
                    ...formData.response_structure,
                    ...(profile.response_structure || {})
                }
            });
        } else {
            // Reset for new profile
            setFormData({
                name: '',
                description: '',
                base_mode: 'tecnico',
                instructions: '',
                core_values: [],
                stylistic_preferences: {
                    tone: '',
                    formality: 5,
                    technicality: 50,
                    verbosity: 'balanced',
                    use_analogies: true,
                    use_data: true
                },
                response_structure: {
                    format: 'mixed',
                    include_examples: true,
                    include_citations: false,
                    max_length: 'medium'
                },
                context_triggers: [],
                is_active: true,
                is_default: false,
                tags: []
            });
        }
    }, [profile, open]);

    const handleSubmit = () => {
        onSave(formData);
    };

    const addCoreValue = () => {
        if (newValue.trim()) {
            setFormData({
                ...formData,
                core_values: [...(formData.core_values || []), newValue.trim()]
            });
            setNewValue('');
        }
    };

    const removeCoreValue = (index) => {
        setFormData({
            ...formData,
            core_values: formData.core_values.filter((_, i) => i !== index)
        });
    };

    const addTag = () => {
        if (newTag.trim()) {
            setFormData({
                ...formData,
                tags: [...(formData.tags || []), newTag.trim()]
            });
            setNewTag('');
        }
    };

    const removeTag = (index) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((_, i) => i !== index)
        });
    };

    const addTrigger = () => {
        if (newTrigger.keyword.trim() && newTrigger.action.trim()) {
            setFormData({
                ...formData,
                context_triggers: [...(formData.context_triggers || []), { ...newTrigger }]
            });
            setNewTrigger({ keyword: '', action: '' });
        }
    };

    const removeTrigger = (index) => {
        setFormData({
            ...formData,
            context_triggers: formData.context_triggers.filter((_, i) => i !== index)
        });
    };

    const t = {
        pt: {
            title: profile ? 'Editar Perfil' : 'Novo Perfil',
            basic: 'Básico',
            stylistic: 'Estilo',
            structure: 'Estrutura',
            advanced: 'Avançado',
            name: 'Nome do Perfil',
            description: 'Descrição',
            baseMode: 'Modo Base',
            instructions: 'Instruções Customizadas',
            coreValues: 'Valores Centrais',
            addValue: 'Adicionar Valor',
            tone: 'Tom',
            formality: 'Formalidade',
            technicality: 'Tecnicidade',
            verbosity: 'Verbosidade',
            useAnalogies: 'Usar Analogias',
            useData: 'Usar Dados',
            format: 'Formato de Resposta',
            includeExamples: 'Incluir Exemplos',
            includeCitations: 'Incluir Citações',
            maxLength: 'Tamanho Máximo',
            triggers: 'Gatilhos de Contexto',
            keyword: 'Palavra-chave',
            action: 'Ação',
            addTrigger: 'Adicionar Gatilho',
            tags: 'Tags',
            addTag: 'Adicionar Tag',
            isActive: 'Perfil Ativo',
            isDefault: 'Perfil Padrão',
            cancel: 'Cancelar',
            save: 'Salvar'
        },
        en: {
            title: profile ? 'Edit Profile' : 'New Profile',
            basic: 'Basic',
            stylistic: 'Style',
            structure: 'Structure',
            advanced: 'Advanced',
            name: 'Profile Name',
            description: 'Description',
            baseMode: 'Base Mode',
            instructions: 'Custom Instructions',
            coreValues: 'Core Values',
            addValue: 'Add Value',
            tone: 'Tone',
            formality: 'Formality',
            technicality: 'Technicality',
            verbosity: 'Verbosity',
            useAnalogies: 'Use Analogies',
            useData: 'Use Data',
            format: 'Response Format',
            includeExamples: 'Include Examples',
            includeCitations: 'Include Citations',
            maxLength: 'Maximum Length',
            triggers: 'Context Triggers',
            keyword: 'Keyword',
            action: 'Action',
            addTrigger: 'Add Trigger',
            tags: 'Tags',
            addTag: 'Add Tag',
            isActive: 'Active Profile',
            isDefault: 'Default Profile',
            cancel: 'Cancel',
            save: 'Save'
        }
    }[lang];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription>
                        {lang === 'pt' 
                            ? 'Configure todos os aspectos da persona personalizada'
                            : 'Configure all aspects of the custom persona'}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">{t.basic}</TabsTrigger>
                        <TabsTrigger value="stylistic">{t.stylistic}</TabsTrigger>
                        <TabsTrigger value="structure">{t.structure}</TabsTrigger>
                        <TabsTrigger value="advanced">{t.advanced}</TabsTrigger>
                    </TabsList>

                    {/* Basic Tab */}
                    <TabsContent value="basic" className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.name}</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={lang === 'pt' ? 'Ex: Consultor Estratégico' : 'Ex: Strategic Consultant'}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.description}</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder={lang === 'pt' ? 'Descreva o propósito deste perfil' : 'Describe the purpose of this profile'}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.baseMode}</Label>
                            <Select
                                value={formData.base_mode}
                                onValueChange={(value) => setFormData({ ...formData, base_mode: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professor">Professor</SelectItem>
                                    <SelectItem value="tecnico">Técnico</SelectItem>
                                    <SelectItem value="consultor">Consultor</SelectItem>
                                    <SelectItem value="academico">Acadêmico</SelectItem>
                                    <SelectItem value="diplomatico">Diplomático</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t.instructions}</Label>
                            <Textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                placeholder={lang === 'pt' 
                                    ? 'Instruções específicas para a IA seguir neste perfil...'
                                    : 'Specific instructions for the AI to follow in this profile...'}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.coreValues}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder={lang === 'pt' ? 'Ex: Precisão' : 'Ex: Precision'}
                                    onKeyPress={(e) => e.key === 'Enter' && addCoreValue()}
                                />
                                <Button onClick={addCoreValue} variant="outline">
                                    {t.addValue}
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.core_values?.map((value, idx) => (
                                    <Badge key={idx} variant="secondary" className="gap-1">
                                        {value}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => removeCoreValue(idx)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Stylistic Tab */}
                    <TabsContent value="stylistic" className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.tone}</Label>
                            <Input
                                value={formData.stylistic_preferences.tone}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    stylistic_preferences: {
                                        ...formData.stylistic_preferences,
                                        tone: e.target.value
                                    }
                                })}
                                placeholder={lang === 'pt' ? 'Ex: Direto e objetivo' : 'Ex: Direct and objective'}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.formality}: {formData.stylistic_preferences.formality}/10</Label>
                            <Slider
                                value={[formData.stylistic_preferences.formality]}
                                onValueChange={([value]) => setFormData({
                                    ...formData,
                                    stylistic_preferences: {
                                        ...formData.stylistic_preferences,
                                        formality: value
                                    }
                                })}
                                max={10}
                                step={1}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.technicality}: {formData.stylistic_preferences.technicality}%</Label>
                            <Slider
                                value={[formData.stylistic_preferences.technicality]}
                                onValueChange={([value]) => setFormData({
                                    ...formData,
                                    stylistic_preferences: {
                                        ...formData.stylistic_preferences,
                                        technicality: value
                                    }
                                })}
                                max={100}
                                step={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.verbosity}</Label>
                            <Select
                                value={formData.stylistic_preferences.verbosity}
                                onValueChange={(value) => setFormData({
                                    ...formData,
                                    stylistic_preferences: {
                                        ...formData.stylistic_preferences,
                                        verbosity: value
                                    }
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="concise">{lang === 'pt' ? 'Conciso' : 'Concise'}</SelectItem>
                                    <SelectItem value="balanced">{lang === 'pt' ? 'Balanceado' : 'Balanced'}</SelectItem>
                                    <SelectItem value="detailed">{lang === 'pt' ? 'Detalhado' : 'Detailed'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>{t.useAnalogies}</Label>
                            <Switch
                                checked={formData.stylistic_preferences.use_analogies}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    stylistic_preferences: {
                                        ...formData.stylistic_preferences,
                                        use_analogies: checked
                                    }
                                })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>{t.useData}</Label>
                            <Switch
                                checked={formData.stylistic_preferences.use_data}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    stylistic_preferences: {
                                        ...formData.stylistic_preferences,
                                        use_data: checked
                                    }
                                })}
                            />
                        </div>
                    </TabsContent>

                    {/* Structure Tab */}
                    <TabsContent value="structure" className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.format}</Label>
                            <Select
                                value={formData.response_structure.format}
                                onValueChange={(value) => setFormData({
                                    ...formData,
                                    response_structure: {
                                        ...formData.response_structure,
                                        format: value
                                    }
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="narrative">{lang === 'pt' ? 'Narrativo' : 'Narrative'}</SelectItem>
                                    <SelectItem value="bullet_points">{lang === 'pt' ? 'Bullet Points' : 'Bullet Points'}</SelectItem>
                                    <SelectItem value="structured">{lang === 'pt' ? 'Estruturado' : 'Structured'}</SelectItem>
                                    <SelectItem value="mixed">{lang === 'pt' ? 'Misto' : 'Mixed'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>{t.includeExamples}</Label>
                            <Switch
                                checked={formData.response_structure.include_examples}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    response_structure: {
                                        ...formData.response_structure,
                                        include_examples: checked
                                    }
                                })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>{t.includeCitations}</Label>
                            <Switch
                                checked={formData.response_structure.include_citations}
                                onCheckedChange={(checked) => setFormData({
                                    ...formData,
                                    response_structure: {
                                        ...formData.response_structure,
                                        include_citations: checked
                                    }
                                })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.maxLength}</Label>
                            <Select
                                value={formData.response_structure.max_length}
                                onValueChange={(value) => setFormData({
                                    ...formData,
                                    response_structure: {
                                        ...formData.response_structure,
                                        max_length: value
                                    }
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="short">{lang === 'pt' ? 'Curto' : 'Short'}</SelectItem>
                                    <SelectItem value="medium">{lang === 'pt' ? 'Médio' : 'Medium'}</SelectItem>
                                    <SelectItem value="long">{lang === 'pt' ? 'Longo' : 'Long'}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.triggers}</Label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        value={newTrigger.keyword}
                                        onChange={(e) => setNewTrigger({ ...newTrigger, keyword: e.target.value })}
                                        placeholder={t.keyword}
                                        className="flex-1"
                                    />
                                    <Input
                                        value={newTrigger.action}
                                        onChange={(e) => setNewTrigger({ ...newTrigger, action: e.target.value })}
                                        placeholder={t.action}
                                        className="flex-1"
                                    />
                                    <Button onClick={addTrigger} variant="outline">
                                        {t.addTrigger}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.context_triggers?.map((trigger, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                            <span className="text-sm flex-1">
                                                <strong>{trigger.keyword}</strong> → {trigger.action}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeTrigger(idx)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>{t.tags}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder={lang === 'pt' ? 'Ex: executivo' : 'Ex: executive'}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                />
                                <Button onClick={addTag} variant="outline">
                                    {t.addTag}
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags?.map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="gap-1">
                                        {tag}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => removeTag(idx)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>{t.isActive}</Label>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>{t.isDefault}</Label>
                            <Switch
                                checked={formData.is_default}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                            />
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t.cancel}
                    </Button>
                    <Button onClick={handleSubmit} className="bg-[#002D62]">
                        {t.save}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}