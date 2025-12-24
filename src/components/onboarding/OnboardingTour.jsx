import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const OnboardingTour = ({ lang = 'pt', onComplete, userRole = 'general' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [adaptedSteps, setAdaptedSteps] = useState([]);

    const roleSpecificSteps = {
        ceo: {
            pt: {
                additionalSteps: [
                    {
                        title: '📊 Insights Estratégicos para CEOs',
                        description: 'Como CEO, você tem acesso a análises de alto nível focadas em decisões estratégicas, cenários geopolíticos e oportunidades de mercado.',
                        target: 'insights-feed',
                        highlight: 'insights'
                    },
                    {
                        title: '📈 Dashboard Executivo',
                        description: 'Métricas consolidadas e KPIs estratégicos para tomada de decisão rápida. Visualize tendências e padrões em suas consultas.',
                        target: 'stats-panel',
                        highlight: 'stats'
                    }
                ]
            },
            en: {
                additionalSteps: [
                    {
                        title: '📊 Strategic Insights for CEOs',
                        description: 'As a CEO, you have access to high-level analysis focused on strategic decisions, geopolitical scenarios and market opportunities.',
                        target: 'insights-feed',
                        highlight: 'insights'
                    },
                    {
                        title: '📈 Executive Dashboard',
                        description: 'Consolidated metrics and strategic KPIs for fast decision-making. Visualize trends and patterns in your consultations.',
                        target: 'stats-panel',
                        highlight: 'stats'
                    }
                ]
            }
        },
        analyst: {
            pt: {
                additionalSteps: [
                    {
                        title: '🔍 Análise Profunda de Dados',
                        description: 'Como Analista, você tem ferramentas para explorar dados em profundidade, visualizar tendências e extrair insights detalhados.',
                        target: 'trending-topics',
                        highlight: 'trending'
                    },
                    {
                        title: '📑 Relatórios Customizados',
                        description: 'Gere relatórios personalizados com dados estruturados e visualizações para suas análises estratégicas.',
                        target: 'insights-feed',
                        highlight: 'insights'
                    }
                ]
            },
            en: {
                additionalSteps: [
                    {
                        title: '🔍 Deep Data Analysis',
                        description: 'As an Analyst, you have tools to explore data in depth, visualize trends and extract detailed insights.',
                        target: 'trending-topics',
                        highlight: 'trending'
                    },
                    {
                        title: '📑 Custom Reports',
                        description: 'Generate custom reports with structured data and visualizations for your strategic analysis.',
                        target: 'insights-feed',
                        highlight: 'insights'
                    }
                ]
            }
        },
        director: {
            pt: {
                additionalSteps: [
                    {
                        title: '🎯 Visão Departamental',
                        description: 'Como Diretor, acompanhe insights relevantes para seu departamento e alinhe estratégias com objetivos organizacionais.',
                        target: 'insights-feed',
                        highlight: 'insights'
                    }
                ]
            },
            en: {
                additionalSteps: [
                    {
                        title: '🎯 Departmental View',
                        description: 'As a Director, track insights relevant to your department and align strategies with organizational goals.',
                        target: 'insights-feed',
                        highlight: 'insights'
                    }
                ]
            }
        }
    };

    const t = {
        pt: {
            skip: 'Pular Tour',
            next: 'Próximo',
            previous: 'Anterior',
            complete: 'Concluir',
            steps: [
                {
                    title: '👋 Bem-vindo ao Troyjo Digital Twin',
                    description: 'Vamos guiá-lo através das principais funcionalidades da plataforma em poucos minutos.',
                    target: null,
                    action: 'Começar Tour',
                    highlight: 'overview'
                },
                {
                    title: '📊 Visão Geral do Dashboard',
                    description: 'Aqui você encontra métricas das suas consultas, tempo de engajamento e nível de satisfação. Monitore sua jornada de aprendizado em tempo real.',
                    target: 'stats-panel',
                    action: null,
                    highlight: 'stats'
                },
                {
                    title: '💡 Feed de Insights Personalizados',
                    description: 'Receba insights estratégicos curados pela IA com base no seu perfil, indústria e interesses. Conteúdo relevante entregue diretamente para você.',
                    target: 'insights-feed',
                    action: 'Ver Insights',
                    highlight: 'insights'
                },
                {
                    title: '📈 Tópicos em Tendência',
                    description: 'Acompanhe os temas mais discutidos nas suas consultas. Identifique padrões e áreas de maior interesse estratégico.',
                    target: 'trending-topics',
                    action: null,
                    highlight: 'trending'
                },
                {
                    title: '👤 Complete Seu Perfil',
                    description: 'Personalize sua experiência informando sua indústria, função e interesses. Quanto mais completo, mais relevantes serão os insights.',
                    target: 'profile-card',
                    action: 'Ir para Perfil',
                    highlight: 'profile',
                    link: 'ProfileManagement'
                },
                {
                    title: '💬 Inicie Sua Primeira Consulta',
                    description: 'Pronto para começar? Clique aqui para iniciar uma conversa estratégica com o Digital Twin e obter insights geopolíticos de classe mundial.',
                    target: 'new-consultation-btn',
                    action: 'Iniciar Consulta',
                    highlight: 'consultation',
                    link: 'Consultation'
                },
                {
                    title: '🎉 Tudo Pronto!',
                    description: 'Você está preparado para aproveitar ao máximo a plataforma. Explore livremente e descubra todo o potencial do Troyjo Digital Twin.',
                    target: null,
                    action: 'Finalizar',
                    highlight: 'complete'
                }
            ]
        },
        en: {
            skip: 'Skip Tour',
            next: 'Next',
            previous: 'Previous',
            complete: 'Complete',
            steps: [
                {
                    title: '👋 Welcome to Troyjo Digital Twin',
                    description: 'We will guide you through the main features of the platform in just a few minutes.',
                    target: null,
                    action: 'Start Tour',
                    highlight: 'overview'
                },
                {
                    title: '📊 Dashboard Overview',
                    description: 'Here you find metrics from your consultations, engagement time and satisfaction level. Monitor your learning journey in real time.',
                    target: 'stats-panel',
                    action: null,
                    highlight: 'stats'
                },
                {
                    title: '💡 Personalized Insights Feed',
                    description: 'Receive strategic insights curated by AI based on your profile, industry and interests. Relevant content delivered directly to you.',
                    target: 'insights-feed',
                    action: 'View Insights',
                    highlight: 'insights'
                },
                {
                    title: '📈 Trending Topics',
                    description: 'Track the most discussed themes in your consultations. Identify patterns and areas of greatest strategic interest.',
                    target: 'trending-topics',
                    action: null,
                    highlight: 'trending'
                },
                {
                    title: '👤 Complete Your Profile',
                    description: 'Personalize your experience by informing your industry, role and interests. The more complete, the more relevant the insights.',
                    target: 'profile-card',
                    action: 'Go to Profile',
                    highlight: 'profile',
                    link: 'ProfileManagement'
                },
                {
                    title: '💬 Start Your First Consultation',
                    description: 'Ready to begin? Click here to start a strategic conversation with the Digital Twin and get world-class geopolitical insights.',
                    target: 'new-consultation-btn',
                    action: 'Start Consultation',
                    highlight: 'consultation',
                    link: 'Consultation'
                },
                {
                    title: '🎉 All Set!',
                    description: 'You are ready to make the most of the platform. Explore freely and discover the full potential of Troyjo Digital Twin.',
                    target: null,
                    action: 'Finish',
                    highlight: 'complete'
                }
            ]
        }
    };

    const text = t[lang];
    const baseSteps = text.steps;

    useEffect(() => {
        // Adapt steps based on user role
        const roleKey = userRole.toLowerCase();
        let finalSteps = [...baseSteps];

        if (roleSpecificSteps[roleKey] && roleSpecificSteps[roleKey][lang]) {
            const roleSteps = roleSpecificSteps[roleKey][lang].additionalSteps;
            // Insert role-specific steps after the "insights feed" step (index 2)
            finalSteps.splice(3, 0, ...roleSteps);
        }

        setAdaptedSteps(finalSteps);
    }, [userRole, lang]);

    const steps = adaptedSteps.length > 0 ? adaptedSteps : baseSteps;

    useEffect(() => {
        if (steps[currentStep].target) {
            const element = document.getElementById(steps[currentStep].target);
            if (element) {
                // Scroll with offset for better visibility
                const yOffset = -150;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
                
                // Small delay to ensure smooth scroll completes before highlighting
                setTimeout(() => {
                    element.classList.add('onboarding-highlight');
                }, 300);
            }
        }

        return () => {
            if (steps[currentStep].target) {
                const element = document.getElementById(steps[currentStep].target);
                if (element) {
                    element.classList.remove('onboarding-highlight');
                }
            }
        };
    }, [currentStep, steps]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCompletedSteps([...completedSteps, currentStep]);
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        try {
            const user = await base44.auth.me();
            await base44.auth.updateMe({
                onboarding_completed: true,
                onboarding_completed_date: new Date().toISOString()
            });
            toast.success(lang === 'pt' ? 'Onboarding concluído!' : 'Onboarding completed!');
            setIsVisible(false);
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    };

    const handleSkip = async () => {
        try {
            const user = await base44.auth.me();
            await base44.auth.updateMe({
                onboarding_skipped: true
            });
            setIsVisible(false);
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error skipping onboarding:', error);
        }
    };

    const getTooltipPosition = () => {
        const target = steps[currentStep].target;
        if (!target) return { 
            position: 'fixed',
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)' 
        };

        const element = document.getElementById(target);
        if (!element) return { 
            position: 'fixed',
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)' 
        };

        const rect = element.getBoundingClientRect();
        const tooltipWidth = 400;
        const tooltipHeight = 300;
        const margin = 20;
        
        let left = rect.left + rect.width / 2;
        let top = rect.bottom + 20;
        let transform = 'translateX(-50%)';

        // Check if tooltip overflows right
        if (left + tooltipWidth / 2 > window.innerWidth - margin) {
            left = rect.right - tooltipWidth;
            transform = 'translateX(0)';
        }
        
        // Check if tooltip overflows left
        if (left - tooltipWidth / 2 < margin) {
            left = rect.left;
            transform = 'translateX(0)';
        }

        // Check if tooltip should appear above instead
        if (top + tooltipHeight > window.innerHeight - margin) {
            top = rect.top - 20;
            transform = `${transform} translateY(-100%)`;
        }

        return {
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            transform,
            maxWidth: '90vw'
        };
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Overlay */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                />
            </AnimatePresence>

            {/* Tooltip Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ 
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                        duration: 0.3
                    }}
                    className="z-[101]"
                    style={getTooltipPosition()}
                >
                    <Card className="w-[400px] shadow-2xl border-2 border-blue-500/50">
                        <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-500">
                                        {lang === 'pt' ? 'Passo' : 'Step'} {currentStep + 1} {lang === 'pt' ? 'de' : 'of'} {steps.length}
                                    </span>
                                </div>
                                <button
                                    onClick={handleSkip}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {steps[currentStep].title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {steps[currentStep].description}
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex gap-1">
                                    {steps.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 flex-1 rounded-full transition-all ${
                                                idx <= currentStep
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 0}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {text.previous}
                                </Button>

                                {currentStep === steps.length - 1 ? (
                                    <Button
                                        onClick={handleComplete}
                                        className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        {text.complete}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        className="bg-blue-500 hover:bg-blue-600 gap-2"
                                    >
                                        {text.next}
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* CSS for highlighting */}
            <style>{`
                .onboarding-highlight {
                    position: relative;
                    z-index: 99;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6) !important;
                    border-radius: 12px;
                    animation: pulse-highlight 2s ease-in-out infinite;
                }

                @keyframes pulse-highlight {
                    0%, 100% {
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
                    }
                    50% {
                        box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.7), 0 0 0 9999px rgba(0, 0, 0, 0.6);
                    }
                }
            `}</style>
        </>
    );
};

export default OnboardingTour;