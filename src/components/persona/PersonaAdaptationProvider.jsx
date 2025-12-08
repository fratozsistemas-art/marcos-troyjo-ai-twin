import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
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
        interactions: 0,
        manualMode: null, // null = auto, or specific persona/profile ID
        activeProfileId: null // ID of active PersonaProfile from database
    });

    const [messageHistory, setMessageHistory] = useState([]);
    const [personaMemory, setPersonaMemory] = useState(null);
    const [customTraits, setCustomTraits] = useState([]);
    const [customProfiles, setCustomProfiles] = useState([]);
    const [activeProfile, setActiveProfile] = useState(null);

    useEffect(() => {
        loadPersonaMemory();
        loadCustomTraits();
        loadCustomProfiles();
    }, []);

    const loadPersonaMemory = async () => {
        try {
            const user = await base44.auth.me();
            const prefs = await base44.entities.PersonaPreferences.filter({ 
                created_by: user.email 
            });
            
            if (prefs.length > 0 && prefs[0].persona_memory) {
                const memory = prefs[0].persona_memory;
                setPersonaMemory(memory);
                
                // Apply remembered preferences
                if (memory.preferred_mode) {
                    setUserProfile(prev => ({ ...prev, mode: memory.preferred_mode }));
                }
                if (memory.preferred_technicality !== undefined) {
                    setUserProfile(prev => ({ ...prev, technicality: memory.preferred_technicality }));
                }
            }
        } catch (error) {
            console.error('Error loading persona memory:', error);
        }
    };

    const loadCustomTraits = async () => {
        try {
            const user = await base44.auth.me();
            const prefs = await base44.entities.PersonaPreferences.filter({ 
                created_by: user.email 
            });
            
            if (prefs.length > 0 && prefs[0].custom_traits) {
                setCustomTraits(prefs[0].custom_traits);
            }
        } catch (error) {
            console.error('Error loading custom traits:', error);
        }
    };

    const loadCustomProfiles = async () => {
        try {
            const profiles = await base44.entities.PersonaProfile.filter({ 
                is_active: true 
            });
            setCustomProfiles(profiles);
            
            // Load default profile if exists
            const defaultProfile = profiles.find(p => p.is_default);
            if (defaultProfile) {
                setActiveProfile(defaultProfile);
                setUserProfile(prev => ({
                    ...prev,
                    activeProfileId: defaultProfile.id,
                    mode: defaultProfile.base_mode,
                    technicality: defaultProfile.stylistic_preferences?.technicality || 50
                }));
            }
        } catch (error) {
            console.error('Error loading custom profiles:', error);
        }
    };

    const setManualPersona = (personaId) => {
        setUserProfile(prev => ({
            ...prev,
            manualMode: personaId,
            mode: personaId || prev.mode,
            activeProfileId: null // Clear profile when setting manual mode
        }));
        setActiveProfile(null);
    };

    const setCustomProfile = async (profileId) => {
        try {
            const profile = customProfiles.find(p => p.id === profileId);
            if (profile) {
                setActiveProfile(profile);
                setUserProfile(prev => ({
                    ...prev,
                    activeProfileId: profileId,
                    mode: profile.base_mode,
                    technicality: profile.stylistic_preferences?.technicality || 50,
                    manualMode: null // Clear manual mode when using profile
                }));
                
                // Increment usage count
                await base44.entities.PersonaProfile.update(profileId, {
                    usage_count: (profile.usage_count || 0) + 1
                });
            }
        } catch (error) {
            console.error('Error setting custom profile:', error);
        }
    };

    const analyzeInteraction = (message) => {
        if (!message || message.role !== 'user') return;

        const newHistory = [...messageHistory, message].slice(-10);
        setMessageHistory(newHistory);

        const analysis = analyzeUserProfile(newHistory);
        
        // If manual mode is set, keep it; otherwise use auto-detection
        const detectedMode = MODE_MAP[analysis.level] || 'tecnico';
        
        const newProfile = {
            level: analysis.level,
            mode: userProfile.manualMode || detectedMode, // Manual overrides auto
            confidence: analysis.confidence,
            technicality: analysis.technicality,
            interactions: userProfile.interactions + 1,
            keywords: analysis.keywords,
            complexity: analysis.complexity,
            manualMode: userProfile.manualMode,
            autoDetectedMode: detectedMode // Store what auto-detection thinks
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

    const savePersonaMemory = async (mode, technicality) => {
        try {
            const user = await base44.auth.me();
            const prefs = await base44.entities.PersonaPreferences.filter({ 
                created_by: user.email 
            });
            
            const memoryUpdate = {
                preferred_mode: mode,
                preferred_technicality: technicality,
                last_updated: new Date().toISOString(),
                adaptation_history: [
                    ...(personaMemory?.adaptation_history || []).slice(-9),
                    {
                        mode,
                        technicality,
                        timestamp: new Date().toISOString()
                    }
                ]
            };
            
            if (prefs.length > 0) {
                await base44.entities.PersonaPreferences.update(prefs[0].id, {
                    persona_memory: memoryUpdate
                });
            } else {
                await base44.entities.PersonaPreferences.create({
                    persona_memory: memoryUpdate
                });
            }
            
            setPersonaMemory(memoryUpdate);
        } catch (error) {
            console.error('Error saving persona memory:', error);
        }
    };

    const suggestPersonaShift = async (messageContext) => {
        try {
            const recentMessages = messageHistory.slice(-3).map(m => m.content).join('\n\n');
            
            const suggestion = await base44.integrations.Core.InvokeLLM({
                prompt: `Baseado no contexto da conversa recente, sugira se a persona deve se adaptar. Contexto atual: ${userProfile.mode} mode, ${userProfile.technicality}/10 technicality.\n\nMensagens recentes:\n${recentMessages}\n\nNova mensagem: ${messageContext}\n\nDeve a persona mudar? Se sim, sugira modo e nível técnico ideal.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        should_shift: { type: "boolean" },
                        suggested_mode: { type: "string" },
                        suggested_technicality: { type: "number" },
                        reason: { type: "string" }
                    }
                }
            });
            
            return suggestion;
        } catch (error) {
            console.error('Error suggesting persona shift:', error);
            return null;
        }
    };

    const getContextualPrompt = () => {
        const persona = getPersonaInstructions();
        const { level, confidence, interactions, manualMode, activeProfileId } = userProfile;

        let modeSource;
        let profileInstructions = '';
        
        if (activeProfile) {
            modeSource = `PERFIL PERSONALIZADO: ${activeProfile.name}`;
            profileInstructions = `
INSTRUÇÕES DO PERFIL PERSONALIZADO:
${activeProfile.instructions || 'Sem instruções específicas'}

VALORES CENTRAIS:
${activeProfile.core_values?.map(v => `- ${v}`).join('\n') || 'Sem valores específicos'}

PREFERÊNCIAS ESTILÍSTICAS:
- Tom: ${activeProfile.stylistic_preferences?.tone || persona.tone}
- Formalidade: ${activeProfile.stylistic_preferences?.formality || 5}/10
- Tecnicidade: ${activeProfile.stylistic_preferences?.technicality || persona.technicality}%
- Verbosidade: ${activeProfile.stylistic_preferences?.verbosity || 'balanced'}
- Usar analogias: ${activeProfile.stylistic_preferences?.use_analogies ? 'Sim' : 'Não'}
- Usar dados: ${activeProfile.stylistic_preferences?.use_data ? 'Sim' : 'Não'}

ESTRUTURA DE RESPOSTA:
- Formato: ${activeProfile.response_structure?.format || 'mixed'}
- Incluir exemplos: ${activeProfile.response_structure?.include_examples ? 'Sim' : 'Não'}
- Incluir citações: ${activeProfile.response_structure?.include_citations ? 'Sim' : 'Não'}
- Tamanho: ${activeProfile.response_structure?.max_length || 'medium'}

${activeProfile.context_triggers?.length > 0 ? `GATILHOS DE CONTEXTO:\n${activeProfile.context_triggers.map(t => `- "${t.keyword}" → ${t.action}`).join('\n')}` : ''}
            `;
        } else {
            modeSource = manualMode 
                ? `MANUAL (selecionado pelo usuário)` 
                : `AUTO (detectado: ${level})`;
        }

        // Build custom traits instruction
        const customTraitsText = customTraits.length > 0 
            ? `\nTRAÇOS PERSONALIZADOS DO USUÁRIO:\n${customTraits.map(t => `- ${t.name} (intensidade: ${t.intensity}/10)`).join('\n')}\n`
            : '';

        return `
ADAPTAÇÃO DINÂMICA DE PERSONA (${modeSource} | Confiança: ${Math.round(confidence)}% | Interações: ${interactions}):

${activeProfile ? profileInstructions : `
Perfil detectado: ${level.toUpperCase()}
Modo ativo: ${userProfile.mode.toUpperCase()}
Nível de tecnicidade: ${persona.technicality}%

Instruções contextuais:
- Tom: ${persona.tone}
- Estrutura: ${persona.structure}
- Exemplos: ${persona.examples}
`}
${customTraitsText}
${manualMode && !activeProfile ? `MODO MANUAL ATIVO: Usuário selecionou explicitamente modo ${manualMode.toUpperCase()}. Mantenha consistência rigorosa com este modo.` : ''}
${activeProfile ? `PERFIL PERSONALIZADO ATIVO: Siga rigorosamente as instruções e preferências definidas no perfil "${activeProfile.name}".` : ''}
${!manualMode && !activeProfile && confidence < 50 ? 'ATENÇÃO: Baixa confiança - mantenha flexibilidade e observe próximas interações.' : ''}
${interactions < 3 ? 'INÍCIO DE CONVERSA: Equilibre acessibilidade com sofisticação até confirmar perfil.' : ''}
        `.trim();
    };

    const value = {
        userProfile,
        analyzeInteraction,
        getPersonaInstructions,
        getContextualPrompt,
        setManualPersona,
        setCustomProfile,
        messageHistory,
        savePersonaMemory,
        suggestPersonaShift,
        personaMemory,
        customTraits,
        customProfiles,
        activeProfile,
        loadCustomProfiles
    };

    return (
        <PersonaAdaptationContext.Provider value={value}>
            {children}
        </PersonaAdaptationContext.Provider>
    );
}