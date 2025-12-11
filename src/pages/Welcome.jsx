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
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [randomFeatures, setRandomFeatures] = useState([]);
    const [skipOnboarding, setSkipOnboarding] = useState(false);

    useEffect(() => {
        checkIfAlreadyOnboarded();
        selectRandomFeatures();
    }, []);

    const selectRandomFeatures = () => {
        const allFeats = t.allFeatures;
        const shuffled = [...allFeats].sort(() => Math.random() - 0.5);
        setRandomFeatures(shuffled.slice(0, 3));
    };

    const checkIfAlreadyOnboarded = async () => {
        try {
            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            
            if (profiles.length > 0 && profiles[0].dashboard_preferences?.onboarding_completed) {
                navigate(createPageUrl('Dashboard'));
            }
        } catch (error) {
            console.error('Error checking onboarding:', error);
        }
    };

    const t = {
        pt: {
            welcome: "Bem-vindo ao Troyjo Digital Twin",
            step1Title: "Vamos personalizar sua experiência",
            step1Desc: "Selecione suas áreas de interesse para receber análises mais relevantes",
            step2Title: "Conheça os Recursos",
            step2Desc: "Explore as funcionalidades principais do Digital Twin",
            continue: "Continuar",
            finish: "Começar",
            skipOnboarding: "Não mostrar novamente",
            saveProfile: "Salvar Perfil",
            profileSaved: "Perfil salvo! Você não verá esta tela novamente",
            interests: {
                title: "Escolha seus interesses",
                industries: "Indústrias",
                regions: "Regiões",
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
            step1Desc: "Select your areas of interest to receive more relevant analyses",
            step2Title: "Discover Features",
            step2Desc: "Explore the Digital Twin's main functionalities",
            continue: "Continue",
            finish: "Start",
            skipOnboarding: "Don't show again",
            saveProfile: "Save Profile",
            profileSaved: "Profile saved! You won't see this screen again",
            interests: {
                title: "Choose your interests",
                industries: "Industries",
                regions: "Regions",
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
        industries: ['Agronegócio', 'Energia', 'Tecnologia', 'Finanças', 'Infraestrutura', 'Defesa'],
        regions: ['Brasil', 'China', 'Estados Unidos', 'União Europeia', 'América Latina', 'BRICS'],
        topics: ['BRICS', 'Comércio Internacional', 'Competitividade', 'Diplomacia Econômica', 'Inteligência Artificial', 'Bioeconomia']
    };

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
                topics: selectedInterests.filter(i => interestOptions.topics.includes(i))
            };

            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });

            if (profiles.length > 0) {
                await base44.entities.UserProfile.update(profiles[0].id, {
                    interests: interestData,
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

                                <div className="space-y-3">
                                    {randomFeatures.map((feature, idx) => {
                                        const Icon = feature.icon;
                                        return (
                                            <div key={idx} className="flex gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
                                                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-6 h-6 text-[#002D62]" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-[#333F48] mb-1">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{feature.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                        {t.finish}
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