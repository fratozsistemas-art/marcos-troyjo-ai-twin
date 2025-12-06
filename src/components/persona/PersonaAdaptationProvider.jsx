import React, { createContext, useContext, useState, useEffect } from 'react';
import { analyzeUserProfile } from './UserProfileAnalyzer';

const PersonaAdaptationContext = createContext(null);

export function usePersonaAdaptation() {
    const context = useContext(PersonaAdaptationContext);
    if (!context) {
        throw new Error('usePersonaAdaptation must be used within PersonaAdaptationProvider');
    }
    return context;
}

const MODE_MAP = {
    leigo: 'professor',
    intermediario: 'tecnico',
    tecnico: 'tecnico',
    gestor: 'consultor',
    academico: 'academico',
    institucional: 'diplomatico'
};

export function PersonaAdaptationProvider({ children, conversationId }) {
    const [userProfile, setUserProfile] = useState({
        level: 'intermediario',
        mode: 'tecnico',
        confidence: 0,
        technicality: 50,
        interactions: 0
    });

    const [messageHistory, setMessageHistory] = useState([]);

    const analyzeInteraction = (message) => {
        if (!message || message.role !== 'user') return;

        const newHistory = [...messageHistory, message].slice(-10);
        setMessageHistory(newHistory);

        const analysis = analyzeUserProfile(newHistory);
        
        const newProfile = {
            level: analysis.level,
            mode: MODE_MAP[analysis.level] || 'tecnico',
            confidence: analysis.confidence,
            technicality: analysis.technicality,
            interactions: userProfile.interactions + 1,
            keywords: analysis.keywords,
            complexity: analysis.complexity
        };

        setUserProfile(newProfile);

        return newProfile;
    };

    const getPersonaInstructions = () => {
        const { mode, technicality, level } = userProfile;

        const instructions = {
            professor: {
                tone: 'didático e paciente',
                structure: 'analogias simples, vocabulário explicado',
                technicality: Math.min(technicality, 30),
                examples: 'use comparações cotidianas e metáforas acessíveis'
            },
            tecnico: {
                tone: 'preciso e analítico',
                structure: 'alta densidade conceitual, dados e modelos',
                technicality: Math.max(technicality, 60),
                examples: 'cite relatórios, teorias e benchmarks internacionais'
            },
            consultor: {
                tone: 'objetivo e orientado a soluções',
                structure: 'recomendações claras em 3-5 pontos',
                technicality: technicality,
                examples: 'foco em aplicabilidade prática e resultados'
            },
            academico: {
                tone: 'rigoroso e fundamentado',
                structure: 'citações, referências e análise aprofundada',
                technicality: Math.max(technicality, 70),
                examples: 'mencione autores, estudos e literatura especializada'
            },
            diplomatico: {
                tone: 'cerimonioso e institucional',
                structure: 'primeira pessoa plural, princípios universais',
                technicality: technicality,
                examples: 'foco em consenso e cooperação multilateral'
            }
        };

        return instructions[mode] || instructions.tecnico;
    };

    const getContextualPrompt = () => {
        const persona = getPersonaInstructions();
        const { level, confidence, interactions } = userProfile;

        return `
ADAPTAÇÃO DINÂMICA DE PERSONA (Confiança: ${Math.round(confidence)}% | Interações: ${interactions}):

Perfil detectado: ${level.toUpperCase()}
Modo ativo: ${userProfile.mode.toUpperCase()}
Nível de tecnicidade: ${persona.technicality}%

Instruções contextuais:
- Tom: ${persona.tone}
- Estrutura: ${persona.structure}
- Exemplos: ${persona.examples}

${confidence < 50 ? 'ATENÇÃO: Baixa confiança - mantenha flexibilidade e observe próximas interações.' : ''}
${interactions < 3 ? 'INÍCIO DE CONVERSA: Equilibre acessibilidade com sofisticação até confirmar perfil.' : ''}
        `.trim();
    };

    const value = {
        userProfile,
        analyzeInteraction,
        getPersonaInstructions,
        getContextualPrompt,
        messageHistory
    };

    return (
        <PersonaAdaptationContext.Provider value={value}>
            {children}
        </PersonaAdaptationContext.Provider>
    );
}