import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp, Users, BookOpen, Brain, Lightbulb, Sparkles } from 'lucide-react';

const translations = {
    pt: {
        title: 'Estilo de Resposta',
        modes: [
            { id: 'professor', name: 'Professor', desc: 'Didático e contextual', icon: GraduationCap },
            { id: 'tecnico', name: 'Técnico', desc: 'Frameworks e densidade', icon: TrendingUp },
            { id: 'diplomatico', name: 'Diplomático', desc: 'Elegância formal', icon: Users },
            { id: 'consultor', name: 'Consultor', desc: 'Pragmático e acionável', icon: Lightbulb },
            { id: 'academico', name: 'Acadêmico', desc: 'Teórico e referências', icon: BookOpen },
            { id: 'leigo', name: 'Simplificado', desc: 'Clareza máxima', icon: Brain }
        ]
    },
    en: {
        title: 'Response Style',
        modes: [
            { id: 'professor', name: 'Professor', desc: 'Didactic and contextual', icon: GraduationCap },
            { id: 'tecnico', name: 'Technical', desc: 'Frameworks and density', icon: TrendingUp },
            { id: 'diplomatico', name: 'Diplomatic', desc: 'Formal elegance', icon: Users },
            { id: 'consultor', name: 'Consultant', desc: 'Pragmatic and actionable', icon: Lightbulb },
            { id: 'academico', name: 'Academic', desc: 'Theoretical and references', icon: BookOpen },
            { id: 'leigo', name: 'Simplified', desc: 'Maximum clarity', icon: Brain }
        ]
    }
};

export default function PersonaModeSelector({ selectedMode, onModeChange, lang = 'pt', compact = false }) {
    const t = translations[lang];
    const [customPersonas, setCustomPersonas] = useState([]);

    useEffect(() => {
        loadCustomPersonas();
    }, []);

    const loadCustomPersonas = async () => {
        try {
            const user = await base44.auth.me();
            const data = await base44.entities.CustomAgentPersona.filter({
                created_by: user.email,
                active: true
            }, '-created_date', 10);
            setCustomPersonas(data || []);
        } catch (error) {
            console.error('Error loading custom personas:', error);
        }
    };

    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {t.modes.map(mode => {
                    const Icon = mode.icon;
                    return (
                        <Button
                            key={mode.id}
                            variant={selectedMode === mode.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onModeChange(mode.id)}
                            className="gap-2"
                        >
                            <Icon className="w-3 h-3" />
                            {mode.name}
                        </Button>
                    );
                })}
                {customPersonas.map(persona => (
                    <Button
                        key={persona.id}
                        variant={selectedMode === `custom_${persona.id}` ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onModeChange(`custom_${persona.id}`, persona)}
                        className="gap-2 border-[#D4AF37]"
                    >
                        <Sparkles className="w-3 h-3" />
                        {persona.name}
                    </Button>
                ))}
            </div>
        );
    }

    return (
        <Card className="p-4">
            <h3 className="text-sm font-semibold text-[#002D62] mb-3">{t.title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {t.modes.map(mode => {
                    const Icon = mode.icon;
                    return (
                        <button
                            key={mode.id}
                            onClick={() => onModeChange(mode.id)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                selectedMode === mode.id
                                    ? 'border-[#002D62] bg-[#002D62]/5'
                                    : 'border-gray-200 hover:border-[#002D62]/30'
                            }`}
                        >
                            <Icon className={`w-5 h-5 mb-2 ${
                                selectedMode === mode.id ? 'text-[#002D62]' : 'text-gray-400'
                            }`} />
                            <div className="font-medium text-sm text-[#333F48]">{mode.name}</div>
                            <div className="text-xs text-[#333F48]/60 mt-1">{mode.desc}</div>
                        </button>
                    );
                })}
                {customPersonas.map(persona => (
                    <button
                        key={persona.id}
                        onClick={() => onModeChange(`custom_${persona.id}`, persona)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                            selectedMode === `custom_${persona.id}`
                                ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                                : 'border-gray-200 hover:border-[#D4AF37]/30'
                        }`}
                    >
                        <Sparkles className={`w-5 h-5 mb-2 ${
                            selectedMode === `custom_${persona.id}` ? 'text-[#D4AF37]' : 'text-gray-400'
                        }`} />
                        <div className="font-medium text-sm text-[#333F48]">{persona.name}</div>
                        <div className="text-xs text-[#333F48]/60 mt-1">{persona.role}</div>
                    </button>
                ))}
            </div>
        </Card>
    );
}