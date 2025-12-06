import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Sparkles, BookOpen, TrendingUp, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function WelcomeFlow({ open, onComplete }) {
    const [step, setStep] = useState(1);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    const t = {
        pt: {
            welcome: "Bem-vindo ao Troyjo Digital Twin",
            step1Title: "Vamos personalizar sua experiência",
            step1Desc: "Selecione suas áreas de interesse para receber análises mais relevantes",
            step2Title: "Como funciona",
            step2Desc: "Entenda os recursos principais do Digital Twin",
            continue: "Continuar",
            finish: "Começar",
            skip: "Pular",
            interests: {
                title: "Escolha seus interesses",
                industries: "Indústrias",
                regions: "Regiões",
                topics: "Tópicos"
            },
            features: [
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
                }
            ]
        },
        en: {
            welcome: "Welcome to Troyjo Digital Twin",
            step1Title: "Let's personalize your experience",
            step1Desc: "Select your areas of interest to receive more relevant analyses",
            step2Title: "How it works",
            step2Desc: "Understand the main features of the Digital Twin",
            continue: "Continue",
            finish: "Start",
            skip: "Skip",
            interests: {
                title: "Choose your interests",
                industries: "Industries",
                regions: "Regions",
                topics: "Topics"
            },
            features: [
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
                }
            ]
        }
    }[lang];

    const interestOptions = {
        industries: ['Agronegócio', 'Energia', 'Tecnologia', 'Finanças', 'Infraestrutura'],
        regions: ['Brasil', 'China', 'Estados Unidos', 'União Europeia', 'América Latina'],
        topics: ['BRICS', 'Comércio Internacional', 'Competitividade', 'Diplomacia Econômica']
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
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            
            if (profiles.length > 0) {
                await base44.entities.UserProfile.update(profiles[0].id, {
                    interests: {
                        industries: selectedInterests.filter(i => interestOptions.industries.includes(i)),
                        regions: selectedInterests.filter(i => interestOptions.regions.includes(i)),
                        topics: selectedInterests.filter(i => interestOptions.topics.includes(i))
                    },
                    dashboard_preferences: {
                        ...profiles[0].dashboard_preferences,
                        onboarding_completed: true
                    }
                });
            }
            
            toast.success(lang === 'pt' ? 'Perfil configurado com sucesso!' : 'Profile configured successfully!');
            onComplete();
        } catch (error) {
            console.error('Error saving preferences:', error);
            onComplete(); // Still close even if save fails
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <DialogTitle className="text-[#002D62]">{t.welcome}</DialogTitle>
                    </div>
                    <div className="flex gap-2 mt-4">
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-all ${
                                    step >= s ? 'bg-[#002D62]' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg text-[#002D62] mb-1">{t.step1Title}</h3>
                            <DialogDescription>{t.step1Desc}</DialogDescription>
                        </div>

                        {Object.entries(interestOptions).map(([category, options]) => (
                            <div key={category}>
                                <h4 className="text-sm font-medium text-[#333F48] mb-2">
                                    {t.interests[category]}
                                </h4>
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

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={onComplete}>
                                {t.skip}
                            </Button>
                            <Button onClick={() => setStep(2)} className="bg-[#002D62]">
                                {t.continue}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg text-[#002D62] mb-1">{t.step2Title}</h3>
                            <DialogDescription>{t.step2Desc}</DialogDescription>
                        </div>

                        <div className="space-y-3">
                            {t.features.map((feature, idx) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={idx} className="flex gap-3 p-3 rounded-lg border border-gray-100">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-5 h-5 text-[#002D62]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-[#333F48] mb-1">
                                                {feature.title}
                                            </h4>
                                            <p className="text-xs text-gray-600">{feature.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
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
            </DialogContent>
        </Dialog>
    );
}