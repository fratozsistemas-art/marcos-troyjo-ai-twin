import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Globe, Sparkles, BookOpen, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Welcome() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedPersona, setSelectedPersona] = useState('');
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [orderedFeatures, setOrderedFeatures] = useState([]);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [skipOnboarding, setSkipOnboarding] = useState(false);

    useEffect(() => {
        checkAuthAndOnboarding();
    }, []);

    const checkAuthAndOnboarding = async () => {
        try {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
                navigate(createPageUrl('Website'));
                return;
            }

            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            
            if (profiles.length > 0 && profiles[0].dashboard_preferences?.onboarding_completed) {
                navigate(createPageUrl('Dashboard'));
                return;
            }

            selectPersonalizedFeatures();
        } catch (error) {
            console.error('Error checking auth:', error);
            navigate(createPageUrl('Website'));
        }
    };

    const selectPersonalizedFeatures = async () => {
        try {
            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            const subs = await base44.entities.Subscription.filter({ user_email: user.email });
            
            let userContext = '';
            if (profiles.length > 0) {
                const profile = profiles[0];
                userContext = `
                Interesses: ${JSON.stringify(profile.interests)}
                Uso recente: ${JSON.stringify(subs[0]?.features_used || {})}
                `;
            }

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `Com base no perfil do usuário, ranqueie TODAS as 6 features disponíveis da MAIS ÚTIL/RELEVANTE para a MENOS ÚTIL. Priorize features que o usuário ainda NÃO explorou ou explorou POUCO e que teriam maior impacto positivo para seu perfil.

Contexto do usuário:
${userContext}

Features disponíveis:
0. Adaptação de Persona - AI ajusta estilo de comunicação
1. Base de Conhecimento - Pensamento público de Marcos Troyjo
2. Sugestões Inteligentes - Recomendações baseadas em tópicos frequentes
3. Análise de Documentos - Upload e chat com PDFs/DOCX
4. Monitor de Riscos - Alertas geopolíticos personalizados
5. Geração de Artigos - Policy papers com voz autêntica

Retorne um array de 6 ÍNDICES (0-5) ordenado da feature mais útil/relevante para a menos útil.`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        feature_indices: { type: 'array', items: { type: 'integer' } }
                    }
                }
            });

            const indices = result.feature_indices || [0, 1, 2, 3, 4, 5];
            const ordered = indices.map(i => t.allFeatures[i]);
            setOrderedFeatures(ordered);
        } catch (error) {
            console.error('Error selecting features:', error);
            const allFeats = t.allFeatures;
            const shuffled = [...allFeats].sort(() => Math.random() - 0.5);
            setOrderedFeatures(shuffled);
        }
    };



    const t = {
        pt: {
            welcome: "Bem-vindo ao Troyjo Digital Twin",
            step1Title: "Vamos personalizar sua experiência",
            step1Desc: "Selecione suas áreas de interesse e persona preferida",
            step2Title: "Conheça os Recursos",
            step2Desc: "Explore as funcionalidades principais do Digital Twin",
            personaTitle: "Escolha sua persona preferida",
            continue: "Continuar",
            finish: "Começar",
            skipOnboarding: "Não mostrar novamente",
            saveProfile: "Salvar Perfil",
            profileSaved: "Perfil salvo! Você não verá esta tela novamente",
            interests: {
                title: "Escolha seus interesses",
                industries: "Indústrias",
                regions: "Regiões",
                economic_theories: "Teorias Econômicas",
                topics: "Tópicos"
            },
            allFeatures: [
                {
                    icon: Sparkles,
                    title: "Adaptação de Persona",
                    desc: "O AI ajusta automaticamente seu estilo de comunicação baseado no seu perfil"
                },
                {
                    icon: BookOpen,
                    title: "Base de Conhecimento",
                    desc: "Acesso a todo o pensamento público de Marcos Troyjo até dezembro 2025"
                },
                {
                    icon: TrendingUp,
                    title: "Sugestões Inteligentes",
                    desc: "Receba recomendações proativas baseadas nos seus tópicos frequentes"
                },
                {
                    icon: Globe,
                    title: "Análise de Documentos",
                    desc: "Upload e chat com documentos PDF, DOCX e TXT para análise contextualizada"
                },
                {
                    icon: BarChart3,
                    title: "Monitor de Riscos",
                    desc: "Alertas geopolíticos personalizados por região e setor de interesse"
                },
                {
                    icon: FileText,
                    title: "Geração de Artigos",
                    desc: "Crie policy papers e análises com a voz autêntica de Troyjo"
                }
            ]
        },
        en: {
            welcome: "Welcome to Troyjo Digital Twin",
            step1Title: "Let's personalize your experience",
            step1Desc: "Select your areas of interest and preferred persona",
            step2Title: "Discover Features",
            step2Desc: "Explore the Digital Twin's main functionalities",
            personaTitle: "Choose your preferred persona",
            continue: "Continue",
            finish: "Start",
            skipOnboarding: "Don't show again",
            saveProfile: "Save Profile",
            profileSaved: "Profile saved! You won't see this screen again",
            interests: {
                title: "Choose your interests",
                industries: "Industries",
                regions: "Regions",
                economic_theories: "Economic Theories",
                topics: "Topics"
            },
            allFeatures: [
                {
                    icon: Sparkles,
                    title: "Persona Adaptation",
                    desc: "The AI automatically adjusts its communication style based on your profile"
                },
                {
                    icon: BookOpen,
                    title: "Knowledge Base",
                    desc: "Access to all of Marcos Troyjo's public thinking until December 2025"
                },
                {
                    icon: TrendingUp,
                    title: "Smart Suggestions",
                    desc: "Receive proactive recommendations based on your frequent topics"
                },
                {
                    icon: Globe,
                    title: "Document Analysis",
                    desc: "Upload and chat with PDF, DOCX and TXT documents for contextualized analysis"
                },
                {
                    icon: BarChart3,
                    title: "Risk Monitor",
                    desc: "Personalized geopolitical alerts by region and sector of interest"
                },
                {
                    icon: FileText,
                    title: "Article Generation",
                    desc: "Create policy papers and analyses with Troyjo's authentic voice"
                }
            ]
        }
    }[lang];

    const interestOptions = {
        industries: ['Agronegócio', 'Energia', 'Tecnologia', 'Finanças', 'Infraestrutura', 'Defesa', 'Manufatura', 'Mineração', 'Comércio', 'Saúde'],
        regions: ['Brasil', 'China', 'Estados Unidos', 'Índia', 'Rússia', 'África do Sul', 'América Latina', 'União Europeia', 'Ásia-Pacífico', 'África', 'Oriente Médio', 'Oceania'],
        economic_theories: ['Vantagens Comparativas', 'Competitividade Sistêmica', 'Cadeias Globais de Valor', 'Novo Desenvolvimentismo', 'Economia Institucional', 'Geopolítica Econômica'],
        topics: ['BRICS', 'Comércio Internacional', 'Competitividade', 'Diplomacia Econômica', 'Inteligência Artificial', 'Bioeconomia', 'Crescimento Endógeno', 'Sustentabilidade', 'Inovação Tecnológica', 'Segurança Alimentar']
    };

    const personas = [
        { id: 'diplomatico', label: lang === 'pt' ? 'Diplomático' : 'Diplomatic', desc: lang === 'pt' ? 'Formal e equilibrado' : 'Formal and balanced' },
        { id: 'tecnico', label: lang === 'pt' ? 'Técnico' : 'Technical', desc: lang === 'pt' ? 'Detalhado e analítico' : 'Detailed and analytical' },
        { id: 'executivo', label: lang === 'pt' ? 'Executivo' : 'Executive', desc: lang === 'pt' ? 'Direto e estratégico' : 'Direct and strategic' },
        { id: 'educador', label: lang === 'pt' ? 'Educador' : 'Educator', desc: lang === 'pt' ? 'Didático e acessível' : 'Educational and accessible' }
    ];

    const toggleInterest = (interest) => {
        setSelectedInterests(prev => 
            prev.includes(interest) 
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleFinish = async () => {
        try {
            const user = await base44.auth.me();
            
            const interestData = {
                industries: selectedInterests.filter(i => interestOptions.industries.includes(i)),
                regions: selectedInterests.filter(i => interestOptions.regions.includes(i)),
                economic_theories: selectedInterests.filter(i => interestOptions.economic_theories.includes(i)),
                topics: selectedInterests.filter(i => interestOptions.topics.includes(i))
            };

            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });

            if (profiles.length > 0) {
                await base44.entities.UserProfile.update(profiles[0].id, {
                    interests: interestData,
                    preferred_persona: selectedPersona || 'diplomatico',
                    dashboard_preferences: {
                        ...profiles[0].dashboard_preferences,
                        onboarding_completed: true,
                        skip_onboarding: skipOnboarding
                    }
                });
            } else {
                await base44.entities.UserProfile.create({
                    user_email: user.email,
                    interests: interestData,
                    preferred_persona: selectedPersona || 'diplomatico',
                    dashboard_preferences: {
                        onboarding_completed: true,
                        skip_onboarding: skipOnboarding,
                        layout: 'comfortable',
                        theme: 'light',
                        language: lang
                    }
                });
            }

            // Initialize free subscription
            const subs = await base44.entities.Subscription.filter({ user_email: user.email });
            if (subs.length === 0) {
                await base44.entities.Subscription.create({
                    user_email: user.email,
                    plan: 'free',
                    status: 'active',
                    limits: {
                        consultations_per_month: 5,
                        articles_per_month: 2,
                        documents_per_month: 5
                    },
                    features_used: {
                        consultations: 0,
                        articles_generated: 0,
                        documents_analyzed: 0
                    }
                });
            }
            
            toast.success(lang === 'pt' ? 'Configuração completa!' : 'Setup complete!');
            navigate(createPageUrl('Dashboard'));
        } catch (error) {
            console.error('Error saving preferences:', error);
            toast.error('Error');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-none shadow-2xl">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                <span className="text-white font-bold">MT</span>
                            </div>
                            <h1 className="text-2xl font-bold text-[#002D62]">{t.welcome}</h1>
                        </div>

                        <div className="flex gap-2 mb-8">
                            {[1, 2].map((s) => (
                                <div
                                    key={s}
                                    className={`h-2 flex-1 rounded-full transition-all ${
                                        step >= s ? 'bg-[#002D62]' : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>

                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#002D62] mb-2">{t.step1Title}</h2>
                                    <p className="text-[#333F48]/70">{t.step1Desc}</p>
                                </div>

                                {Object.entries(interestOptions).map(([category, options]) => (
                                    <div key={category}>
                                        <h3 className="text-sm font-medium text-[#333F48] mb-3">
                                            {t.interests[category]}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {options.map((option) => (
                                                <Badge
                                                    key={option}
                                                    variant={selectedInterests.includes(option) ? 'default' : 'outline'}
                                                    className={`cursor-pointer transition-all ${
                                                        selectedInterests.includes(option)
                                                            ? 'bg-[#002D62] hover:bg-[#001d42]'
                                                            : 'hover:border-[#002D62]'
                                                    }`}
                                                    onClick={() => toggleInterest(option)}
                                                >
                                                    {option}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    ))}

                                    {/* Persona Selection */}
                                    <div className="pt-4 border-t">
                                    <h3 className="text-sm font-medium text-[#333F48] mb-3">
                                        {t.personaTitle}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {personas.map((persona) => (
                                            <div
                                                key={persona.id}
                                                onClick={() => setSelectedPersona(persona.id)}
                                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                    selectedPersona === persona.id
                                                        ? 'border-[#002D62] bg-[#002D62]/5'
                                                        : 'border-gray-200 hover:border-[#002D62]/50'
                                                }`}
                                            >
                                                <h4 className="font-semibold text-sm text-[#002D62]">
                                                    {persona.label}
                                                </h4>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {persona.desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                    <Button onClick={() => setStep(2)} className="bg-[#002D62]">
                                        {t.continue}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                    </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#002D62] mb-2">{t.step2Title}</h2>
                                    <p className="text-[#333F48]/70">{t.step2Desc}</p>
                                </div>

                                <div className="space-y-4">
                                    {orderedFeatures.length > 0 && (() => {
                                        const CurrentIcon = orderedFeatures[currentFeatureIndex].icon;
                                        return (
                                            <motion.div
                                                key={currentFeatureIndex}
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -50 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="flex gap-4 p-6 rounded-lg border-2 border-[#002D62]/20 bg-gradient-to-br from-white to-gray-50">
                                                    <div className="w-14 h-14 rounded-lg bg-[#002D62] flex items-center justify-center flex-shrink-0">
                                                        <CurrentIcon className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-[#333F48] mb-2 text-lg">
                                                            {orderedFeatures[currentFeatureIndex].title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            {orderedFeatures[currentFeatureIndex].desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })()}

                                    <div className="flex items-center justify-between">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentFeatureIndex(prev => Math.max(0, prev - 1))}
                                            disabled={currentFeatureIndex === 0}
                                        >
                                            {lang === 'pt' ? '← Anterior' : '← Previous'}
                                        </Button>
                                        <div className="flex gap-1">
                                            {orderedFeatures.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-2 h-2 rounded-full transition-all ${
                                                        idx === currentFeatureIndex ? 'bg-[#002D62] w-4' : 'bg-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentFeatureIndex(prev => Math.min(orderedFeatures.length - 1, prev + 1))}
                                            disabled={currentFeatureIndex === orderedFeatures.length - 1}
                                        >
                                            {lang === 'pt' ? 'Próximo →' : 'Next →'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <input
                                        type="checkbox"
                                        id="skip-onboarding"
                                        checked={skipOnboarding}
                                        onChange={(e) => setSkipOnboarding(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="skip-onboarding" className="text-sm text-gray-700 cursor-pointer">
                                        {t.skipOnboarding}
                                    </label>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button variant="ghost" onClick={() => setStep(1)}>
                                        {lang === 'pt' ? 'Voltar' : 'Back'}
                                    </Button>
                                    <Button onClick={handleFinish} className="bg-[#002D62]">
                                        {lang === 'pt' ? 'Começar' : 'Start'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}