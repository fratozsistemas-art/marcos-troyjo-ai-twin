import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Globe, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import confetti from 'canvas-confetti';

export default function Welcome() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedPersona, setSelectedPersona] = useState('');
    const [skipOnboarding, setSkipOnboarding] = useState(false);
    const [orderedFeatures, setOrderedFeatures] = useState([]);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

    useEffect(() => {
        checkIfShouldSkip();
    }, []);

    const checkIfShouldSkip = async () => {
        try {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
                navigate(createPageUrl('PublicHome'));
                return;
            }

            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            
            // Se já completou onboarding, redirecionar para dashboard
            if (profiles.length > 0 && profiles[0].dashboard_preferences?.onboarding_completed) {
                navigate(createPageUrl('Dashboard'));
                return;
            }

            selectPersonalizedFeatures();
        } catch (error) {
            console.error('Error checking onboarding:', error);
        }
    };

    const selectPersonalizedFeatures = async () => {
        try {
            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            const subscriptions = await base44.entities.Subscription.filter({ user_email: user.email });

            const userContext = {
                interests: profiles[0]?.interests || [],
                expertise_level: profiles[0]?.expertise_level || 'intermediate',
                subscription_tier: subscriptions[0]?.tier || 'freemium'
            };

            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Given user context: ${JSON.stringify(userContext)}, rank these features by predicted usefulness: ${allFeatures.map(f => f.title).join(', ')}. Return only a comma-separated list of feature titles in order of usefulness.`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        ordered_features: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            });

            const orderedTitles = response.ordered_features || [];
            const ordered = orderedTitles
                .map(title => allFeatures.find(f => f.title === title))
                .filter(Boolean);
            
            setOrderedFeatures(ordered.length > 0 ? ordered : allFeatures.sort(() => Math.random() - 0.5));
        } catch (error) {
            console.error('Error personalizing features:', error);
            setOrderedFeatures(allFeatures.sort(() => Math.random() - 0.5));
        }
    };

    const t = {
        pt: {
            welcome: 'Bem-vindo ao',
            subtitle: 'Vamos personalizar sua experiência',
            step1Title: 'Seus Interesses',
            step1Subtitle: 'Selecione áreas de interesse',
            step2Title: 'Conheça os Recursos',
            step2Subtitle: 'Personalizados para você',
            selectPersona: 'Como prefere se comunicar?',
            interests: 'Interesses',
            next: 'Próximo',
            back: 'Voltar',
            finish: 'Começar',
            skip: 'Pular esta introdução',
            interests: [
                'Economia Global',
                'Comércio Internacional',
                'BRICS',
                'Geopolítica',
                'Competitividade',
                'ESG',
                'Diplomacia Econômica',
                'Tecnologia'
            ],
            personas: [
                { id: 'professor', name: 'Professor', desc: 'Didático e explicativo' },
                { id: 'tecnico', name: 'Técnico', desc: 'Preciso e com dados' },
                { id: 'diplomatico', name: 'Diplomático', desc: 'Nuançado e contextual' }
            ]
        },
        en: {
            welcome: 'Welcome to',
            subtitle: 'Let\'s personalize your experience',
            step1Title: 'Your Interests',
            step1Subtitle: 'Select areas of interest',
            step2Title: 'Discover Features',
            step2Subtitle: 'Personalized for you',
            selectPersona: 'How do you prefer to communicate?',
            interests: 'Interests',
            next: 'Next',
            back: 'Back',
            finish: 'Get Started',
            skip: 'Skip this introduction',
            interests: [
                'Global Economics',
                'International Trade',
                'BRICS',
                'Geopolitics',
                'Competitiveness',
                'ESG',
                'Economic Diplomacy',
                'Technology'
            ],
            personas: [
                { id: 'professor', name: 'Professor', desc: 'Didactic and explanatory' },
                { id: 'tecnico', name: 'Technical', desc: 'Precise with data' },
                { id: 'diplomatico', name: 'Diplomatic', desc: 'Nuanced and contextual' }
            ]
        }
    };

    const text = t[lang];

    const allFeatures = [
        { icon: '💬', title: lang === 'pt' ? 'Consultas AI' : 'AI Consultations', desc: lang === 'pt' ? 'Converse com o Digital Twin' : 'Chat with the Digital Twin' },
        { icon: '📊', title: lang === 'pt' ? 'Analytics' : 'Analytics', desc: lang === 'pt' ? 'Visualize seu engajamento' : 'Visualize your engagement' },
        { icon: '📚', title: lang === 'pt' ? 'Base de Conhecimento' : 'Knowledge Base', desc: lang === 'pt' ? 'Acesse publicações e conceitos' : 'Access publications and concepts' },
        { icon: '🎭', title: lang === 'pt' ? 'Personas' : 'Personas', desc: lang === 'pt' ? 'Respostas adaptadas ao seu perfil' : 'Responses adapted to your profile' },
        { icon: '📄', title: lang === 'pt' ? 'Análise de Documentos' : 'Document Analysis', desc: lang === 'pt' ? 'Upload e chat com PDFs' : 'Upload and chat with PDFs' },
        { icon: '🌍', title: lang === 'pt' ? 'Alertas Geopolíticos' : 'Geopolitical Alerts', desc: lang === 'pt' ? 'Notificações personalizadas' : 'Personalized notifications' }
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
            
            const profileData = {
                user_email: user.email,
                interests: selectedInterests,
                expertise_level: 'intermediate',
                preferred_content_types: [],
                dashboard_preferences: {
                    onboarding_completed: true,
                    completed_at: new Date().toISOString()
                }
            };

            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            if (profiles.length > 0) {
                await base44.entities.UserProfile.update(profiles[0].id, profileData);
            } else {
                await base44.entities.UserProfile.create(profileData);
            }

            if (selectedPersona) {
                await base44.entities.PersonaPreferences.create({
                    user_email: user.email,
                    preferred_mode: selectedPersona,
                    auto_adapt: true
                });
            }

            // Criar assinatura freemium inicial
            const existingSubs = await base44.entities.Subscription.filter({ user_email: user.email });
            if (existingSubs.length === 0) {
                await base44.entities.Subscription.create({
                    user_email: user.email,
                    tier: 'freemium',
                    status: 'active',
                    stripe_price_id: 'price_1SgmdtRo0dVPpa4WLPzbGynZ'
                });
            }

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                navigate(createPageUrl('Dashboard'));
            }, 1000);
        } catch (error) {
            console.error('Error finishing onboarding:', error);
            toast.error(lang === 'pt' ? 'Erro ao finalizar' : 'Error finishing');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl"
            >
                <Card className="border-0 shadow-2xl">
                    <CardHeader className="text-center bg-gradient-to-r from-[#002D62] to-[#00654A] text-white rounded-t-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles className="w-6 h-6" />
                            <CardTitle className="text-3xl">{text.welcome} Troyjo Twin</CardTitle>
                        </div>
                        <p className="text-white/90">{text.subtitle}</p>
                    </CardHeader>
                    <CardContent className="p-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-bold text-[#002D62] mb-2">{text.step1Title}</h2>
                                    <p className="text-gray-600 mb-6">{text.step1Subtitle}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        {text.interests.map((interest, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => toggleInterest(interest)}
                                                className={`p-4 rounded-lg border-2 transition-all ${
                                                    selectedInterests.includes(interest)
                                                        ? 'border-[#002D62] bg-[#002D62]/5'
                                                        : 'border-gray-200 hover:border-[#002D62]/30'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                        selectedInterests.includes(interest)
                                                            ? 'border-[#002D62] bg-[#002D62]'
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {selectedInterests.includes(interest) && (
                                                            <Check className="w-3 h-3 text-white" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium">{interest}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-[#002D62] mb-3">{text.selectPersona}</h3>
                                        <div className="grid md:grid-cols-3 gap-3">
                                            {text.personas.map(persona => (
                                                <button
                                                    key={persona.id}
                                                    onClick={() => setSelectedPersona(persona.id)}
                                                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                        selectedPersona === persona.id
                                                            ? 'border-[#00654A] bg-[#00654A]/5'
                                                            : 'border-gray-200 hover:border-[#00654A]/30'
                                                    }`}
                                                >
                                                    <h4 className="font-semibold text-[#002D62]">{persona.name}</h4>
                                                    <p className="text-sm text-gray-600">{persona.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-bold text-[#002D62] mb-2">{text.step2Title}</h2>
                                    <p className="text-gray-600 mb-6">{text.step2Subtitle}</p>

                                    {orderedFeatures.length > 0 && (
                                        <div className="mb-6">
                                            <Card className="border-2 border-[#D4AF37]">
                                                <CardHeader className="text-center">
                                                    <div className="text-6xl mb-4">
                                                        {orderedFeatures[currentFeatureIndex]?.icon}
                                                    </div>
                                                    <CardTitle className="text-2xl text-[#002D62]">
                                                        {orderedFeatures[currentFeatureIndex]?.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="text-center">
                                                    <p className="text-gray-600 text-lg">
                                                        {orderedFeatures[currentFeatureIndex]?.desc}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <div className="flex items-center justify-center gap-2 mt-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCurrentFeatureIndex(Math.max(0, currentFeatureIndex - 1))}
                                                    disabled={currentFeatureIndex === 0}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <div className="flex gap-1">
                                                    {orderedFeatures.map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`w-2 h-2 rounded-full ${
                                                                idx === currentFeatureIndex ? 'bg-[#002D62]' : 'bg-gray-300'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCurrentFeatureIndex(Math.min(orderedFeatures.length - 1, currentFeatureIndex + 1))}
                                                    disabled={currentFeatureIndex === orderedFeatures.length - 1}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between mt-8 pt-6 border-t">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={skipOnboarding}
                                    onCheckedChange={setSkipOnboarding}
                                    id="skip"
                                />
                                <label htmlFor="skip" className="text-sm text-gray-600 cursor-pointer">
                                    {text.skip}
                                </label>
                            </div>

                            <div className="flex gap-2">
                                {step === 2 && (
                                    <Button variant="outline" onClick={() => setStep(1)}>
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        {text.back}
                                    </Button>
                                )}
                                <Button
                                    onClick={() => {
                                        if (skipOnboarding || step === 2) {
                                            handleFinish();
                                        } else {
                                            setStep(2);
                                        }
                                    }}
                                    className="bg-[#002D62] hover:bg-[#001d42]"
                                >
                                    {skipOnboarding || step === 2 ? text.finish : text.next}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}