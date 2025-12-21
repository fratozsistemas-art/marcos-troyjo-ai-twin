import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, X, Sparkles, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomPersonaTraits({ lang = 'pt' }) {
    const [customTraits, setCustomTraits] = useState([]);
    const [newTrait, setNewTrait] = useState('');
    const [traitIntensity, setTraitIntensity] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const t = {
        pt: {
            title: "Traços Personalizados",
            desc: "Defina características específicas para a persona do Digital Twin",
            addTrait: "Adicionar traço",
            intensity: "Intensidade",
            examples: "Exemplos: 'mais conciso', 'mais acadêmico', 'foco em dados', 'tom inspirador'",
            save: "Salvar Traços",
            saving: "Salvando...",
            placeholder: "Ex: mais visual",
            bucketTitle: "Selecione Traços Predefinidos",
            bucketDesc: "Clique para adicionar traços comuns à sua persona"
        },
        en: {
            title: "Custom Persona Traits",
            desc: "Define specific characteristics for the Digital Twin's persona",
            addTrait: "Add trait",
            intensity: "Intensity",
            examples: "Examples: 'more concise', 'more academic', 'data-focused', 'inspiring tone'",
            save: "Save Traits",
            saving: "Saving...",
            placeholder: "Ex: more visual",
            bucketTitle: "Select Predefined Traits",
            bucketDesc: "Click to add common traits to your persona"
        }
    }[lang];

    const traitBucketList = lang === 'pt' ? [
        'Mais conciso',
        'Mais detalhado',
        'Tom acadêmico',
        'Tom conversacional',
        'Foco em dados',
        'Foco em narrativa',
        'Estilo didático',
        'Estilo inspirador',
        'Pragmático',
        'Visionário',
        'Analítico',
        'Estratégico',
        'Uso de metáforas',
        'Uso de exemplos',
        'Contextualização histórica',
        'Foco no presente',
        'Perspectiva global',
        'Perspectiva regional',
        'Otimista',
        'Realista'
    ] : [
        'More concise',
        'More detailed',
        'Academic tone',
        'Conversational tone',
        'Data-focused',
        'Narrative-focused',
        'Didactic style',
        'Inspiring style',
        'Pragmatic',
        'Visionary',
        'Analytical',
        'Strategic',
        'Use of metaphors',
        'Use of examples',
        'Historical context',
        'Present focus',
        'Global perspective',
        'Regional perspective',
        'Optimistic',
        'Realistic'
    ];

    useEffect(() => {
        loadTraits();
    }, []);

    const loadTraits = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            const prefs = await base44.entities.PersonaPreferences.filter({ 
                created_by: user.email 
            });

            if (prefs.length > 0 && prefs[0].custom_traits) {
                setCustomTraits(prefs[0].custom_traits);
                const intensities = {};
                prefs[0].custom_traits.forEach(trait => {
                    intensities[trait.name] = trait.intensity || 5;
                });
                setTraitIntensity(intensities);
            }
        } catch (error) {
            console.error('Error loading traits:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTrait = (traitName = null) => {
        const name = traitName || newTrait.trim();
        if (!name) return;
        
        // Check if trait already exists
        if (customTraits.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            toast.error(lang === 'pt' ? 'Traço já adicionado' : 'Trait already added');
            return;
        }
        
        const trait = {
            name: name,
            intensity: 5
        };
        
        setCustomTraits([...customTraits, trait]);
        setTraitIntensity({ ...traitIntensity, [trait.name]: 5 });
        setNewTrait('');
    };

    const removeTrait = (traitName) => {
        setCustomTraits(customTraits.filter(t => t.name !== traitName));
        const newIntensities = { ...traitIntensity };
        delete newIntensities[traitName];
        setTraitIntensity(newIntensities);
    };

    const updateIntensity = (traitName, value) => {
        setTraitIntensity({ ...traitIntensity, [traitName]: value[0] });
    };

    const saveTraits = async () => {
        setIsSaving(true);
        try {
            const user = await base44.auth.me();
            const prefs = await base44.entities.PersonaPreferences.filter({ 
                created_by: user.email 
            });

            const traitsToSave = customTraits.map(t => ({
                name: t.name,
                intensity: traitIntensity[t.name] || 5
            }));

            if (prefs.length > 0) {
                await base44.entities.PersonaPreferences.update(prefs[0].id, {
                    custom_traits: traitsToSave
                });
            } else {
                await base44.entities.PersonaPreferences.create({
                    custom_traits: traitsToSave
                });
            }

            toast.success(lang === 'pt' ? 'Traços salvos com sucesso!' : 'Traits saved successfully!');
        } catch (error) {
            console.error('Error saving traits:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar traços' : 'Error saving traits');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Sparkles className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Bucket List */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#002D62]">{t.bucketTitle}</h4>
                    <p className="text-xs text-gray-500">{t.bucketDesc}</p>
                    <div className="flex flex-wrap gap-2">
                        {traitBucketList.map((bucketTrait) => {
                            const isAdded = customTraits.some(t => t.name.toLowerCase() === bucketTrait.toLowerCase());
                            return (
                                <Badge
                                    key={bucketTrait}
                                    variant={isAdded ? "default" : "outline"}
                                    className={`cursor-pointer transition-colors ${
                                        isAdded 
                                            ? 'bg-[#002D62] text-white'
                                            : 'hover:bg-gray-100'
                                    }`}
                                    onClick={() => !isAdded && addTrait(bucketTrait)}
                                >
                                    {bucketTrait}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                {/* Custom Trait Input */}
                <div className="pt-4 border-t space-y-2">
                    <h4 className="text-sm font-semibold text-[#002D62]">{t.addTrait}</h4>
                    <div className="flex gap-2">
                        <Input
                            value={newTrait}
                            onChange={(e) => setNewTrait(e.target.value)}
                            placeholder={t.placeholder}
                            onKeyPress={(e) => e.key === 'Enter' && addTrait()}
                        />
                        <Button onClick={() => addTrait()} size="sm" className="bg-[#002D62]">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 italic">{t.examples}</p>
                </div>

                {customTraits.length > 0 ? (
                    <div className="space-y-4">
                        {customTraits.map((trait) => (
                            <div key={trait.name} className="p-3 border border-gray-200 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">{trait.name}</Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTrait(trait.name)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>{t.intensity}</span>
                                        <span>{traitIntensity[trait.name] || 5}/10</span>
                                    </div>
                                    <Slider
                                        value={[traitIntensity[trait.name] || 5]}
                                        onValueChange={(value) => updateIntensity(trait.name, value)}
                                        min={1}
                                        max={10}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        {lang === 'pt' 
                            ? 'Nenhum traço personalizado definido ainda'
                            : 'No custom traits defined yet'}
                    </div>
                )}

                <Button
                    onClick={saveTraits}
                    disabled={isSaving || customTraits.length === 0}
                    className="w-full bg-[#002D62]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t.saving}
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {t.save}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}