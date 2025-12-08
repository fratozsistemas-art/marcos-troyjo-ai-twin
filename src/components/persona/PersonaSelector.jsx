import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Brain, Target, GraduationCap, Users, Sparkles } from 'lucide-react';
import { usePersonaAdaptation } from './PersonaAdaptationProvider';

export default function PersonaSelector({ lang = 'pt', open, onOpenChange }) {
    const { userProfile, setManualPersona, setCustomProfile, customProfiles, activeProfile } = usePersonaAdaptation();

    const translations = {
        pt: {
            title: 'Selecionar Modo de Comunicação',
            description: 'Escolha como deseja que o Digital Twin se comunique com você',
            auto: 'Automático',
            autoDesc: 'Adaptação inteligente baseada na conversa',
            professor: {
                title: 'Professor',
                desc: 'Didático e pedagógico com analogias simples',
                ideal: 'Ideal para aprendizado de conceitos'
            },
            tecnico: {
                title: 'Técnico',
                desc: 'Alta densidade conceitual com dados e modelos',
                ideal: 'Ideal para especialistas e analistas'
            },
            consultor: {
                title: 'Consultor',
                desc: 'Objetivo e focado em soluções práticas',
                ideal: 'Ideal para gestores e executivos'
            },
            academico: {
                title: 'Acadêmico',
                desc: 'Rigoroso com citações e referências',
                ideal: 'Ideal para pesquisadores'
            },
            diplomatico: {
                title: 'Diplomático',
                desc: 'Cerimonioso e institucional',
                ideal: 'Ideal para contextos oficiais'
            },
            current: 'Atual',
            recommended: 'Recomendado'
        },
        en: {
            title: 'Select Communication Mode',
            description: 'Choose how you want the Digital Twin to communicate with you',
            auto: 'Automatic',
            autoDesc: 'Intelligent adaptation based on conversation',
            professor: {
                title: 'Professor',
                desc: 'Didactic and pedagogical with simple analogies',
                ideal: 'Ideal for learning concepts'
            },
            tecnico: {
                title: 'Technical',
                desc: 'High conceptual density with data and models',
                ideal: 'Ideal for specialists and analysts'
            },
            consultor: {
                title: 'Consultant',
                desc: 'Objective and focused on practical solutions',
                ideal: 'Ideal for managers and executives'
            },
            academico: {
                title: 'Academic',
                desc: 'Rigorous with citations and references',
                ideal: 'Ideal for researchers'
            },
            diplomatico: {
                title: 'Diplomatic',
                desc: 'Ceremonious and institutional',
                ideal: 'Ideal for official contexts'
            },
            current: 'Current',
            recommended: 'Recommended'
        }
    };

    const t = translations[lang];

    const personas = [
        { id: 'professor', icon: BookOpen, color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
        { id: 'tecnico', icon: Brain, color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
        { id: 'consultor', icon: Target, color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
        { id: 'academico', icon: GraduationCap, color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
        { id: 'diplomatico', icon: Users, color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' }
    ];

    const handleSelect = (personaId) => {
        setManualPersona(personaId);
        onOpenChange(false);
    };

    const isRecommended = (personaId) => {
        return userProfile.mode === personaId && userProfile.confidence > 60;
    };

    const isCurrent = (personaId) => {
        return userProfile.manualMode === personaId || 
               (!userProfile.manualMode && userProfile.mode === personaId);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#002D62]">
                        <Sparkles className="w-5 h-5" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-4">
                    {/* Auto Mode */}
                    <Card 
                        className={`cursor-pointer transition-all border-2 ${
                            !userProfile.manualMode 
                                ? 'border-[#002D62] bg-blue-50' 
                                : 'border-gray-200 hover:border-[#002D62]/50'
                        }`}
                        onClick={() => handleSelect(null)}
                    >
                        <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[#002D62] mb-1">{t.auto}</h4>
                                        <p className="text-sm text-gray-600">{t.autoDesc}</p>
                                    </div>
                                </div>
                                {!userProfile.manualMode && (
                                    <Badge className="bg-[#00654A] text-white">{t.current}</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Custom Profiles */}
                    {customProfiles.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 mt-2 mb-2">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-500 font-medium">
                                    {lang === 'pt' ? 'Perfis Personalizados' : 'Custom Profiles'}
                                </span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            {customProfiles.map((profile) => (
                                <Card 
                                    key={profile.id}
                                    className={`cursor-pointer transition-all border-2 ${
                                        activeProfile?.id === profile.id 
                                            ? 'border-[#002D62] ring-2 ring-[#002D62]/20 bg-blue-50' 
                                            : 'border-gray-200 hover:border-[#002D62]/50'
                                    }`}
                                    onClick={() => {
                                        setCustomProfile(profile.id);
                                        onOpenChange(false);
                                    }}
                                >
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                    <Sparkles className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-[#002D62]">
                                                            {profile.name}
                                                        </h4>
                                                        {profile.is_default && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {lang === 'pt' ? 'Padrão' : 'Default'}
                                                            </Badge>
                                                        )}
                                                        {activeProfile?.id === profile.id && (
                                                            <Badge className="bg-[#00654A] text-white text-xs">
                                                                {t.current}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-1">
                                                        {profile.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {profile.base_mode}
                                                        </Badge>
                                                        {profile.tags?.slice(0, 2).map((tag, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <div className="flex items-center gap-2 mt-2 mb-2">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-500 font-medium">
                                    {lang === 'pt' ? 'Modos Base' : 'Base Modes'}
                                </span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                        </>
                    )}

                    {/* Manual Personas */}
                    {personas.map((persona) => {
                        const Icon = persona.icon;
                        const personaInfo = t[persona.id];
                        
                        return (
                            <Card 
                                key={persona.id}
                                className={`cursor-pointer transition-all border-2 ${persona.color} ${
                                    isCurrent(persona.id) 
                                        ? 'border-[#002D62] ring-2 ring-[#002D62]/20' 
                                        : 'border-transparent'
                                }`}
                                onClick={() => handleSelect(persona.id)}
                            >
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center border border-gray-200">
                                                <Icon className="w-5 h-5 text-[#002D62]" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-[#002D62]">
                                                        {personaInfo.title}
                                                    </h4>
                                                    {isRecommended(persona.id) && (
                                                        <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                                            {t.recommended}
                                                        </Badge>
                                                    )}
                                                    {isCurrent(persona.id) && (
                                                        <Badge className="bg-[#00654A] text-white text-xs">
                                                            {t.current}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 mb-1">
                                                    {personaInfo.desc}
                                                </p>
                                                <p className="text-xs text-gray-500 italic">
                                                    {personaInfo.ideal}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-900">
                        💡 {lang === 'pt' 
                            ? 'O modo automático aprende com suas interações e ajusta o estilo dinamicamente.'
                            : 'Automatic mode learns from your interactions and adjusts the style dynamically.'}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}