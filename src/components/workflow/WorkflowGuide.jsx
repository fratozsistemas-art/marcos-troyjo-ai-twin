import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Circle, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const workflows = {
    first_consultation: {
        pt: {
            title: 'Primeira Consulta',
            description: 'Aprenda a fazer sua primeira consulta ao Digital Twin',
            steps: [
                {
                    title: 'Escolha sua Persona',
                    description: 'Selecione o estilo de comunicação que melhor se adapta às suas necessidades',
                    action: 'Ir para Configurações',
                    url: 'Dashboard'
                },
                {
                    title: 'Faça sua Pergunta',
                    description: 'Descreva o contexto e faça perguntas específicas sobre economia global',
                    action: 'Iniciar Consulta',
                    url: 'Consultation'
                },
                {
                    title: 'Explore os Insights',
                    description: 'Revise as respostas e explore conteúdos relacionados',
                    action: 'Ver Dashboard',
                    url: 'Dashboard'
                }
            ]
        },
        en: {
            title: 'First Consultation',
            description: 'Learn how to make your first consultation with the Digital Twin',
            steps: [
                {
                    title: 'Choose your Persona',
                    description: 'Select the communication style that best fits your needs',
                    action: 'Go to Settings',
                    url: 'Dashboard'
                },
                {
                    title: 'Ask your Question',
                    description: 'Describe the context and ask specific questions about global economics',
                    action: 'Start Consultation',
                    url: 'Consultation'
                },
                {
                    title: 'Explore Insights',
                    description: 'Review answers and explore related content',
                    action: 'View Dashboard',
                    url: 'Dashboard'
                }
            ]
        }
    },
    geopolitical_analysis: {
        pt: {
            title: 'Análise Geopolítica',
            description: 'Configure alertas e monitore riscos geopolíticos',
            steps: [
                {
                    title: 'Configure Feeds de Alerta',
                    description: 'Defina regiões, setores e tipos de risco que deseja monitorar',
                    action: 'Configurar Alertas',
                    url: 'Dashboard'
                },
                {
                    title: 'Revise Riscos Identificados',
                    description: 'Analise os riscos geopolíticos detectados pelo sistema',
                    action: 'Ver Riscos',
                    url: 'Dashboard'
                },
                {
                    title: 'Consulte Análises Detalhadas',
                    description: 'Peça ao Digital Twin análises aprofundadas sobre eventos específicos',
                    action: 'Consultar',
                    url: 'Consultation'
                }
            ]
        },
        en: {
            title: 'Geopolitical Analysis',
            description: 'Set up alerts and monitor geopolitical risks',
            steps: [
                {
                    title: 'Configure Alert Feeds',
                    description: 'Define regions, sectors and risk types you want to monitor',
                    action: 'Configure Alerts',
                    url: 'Dashboard'
                },
                {
                    title: 'Review Identified Risks',
                    description: 'Analyze geopolitical risks detected by the system',
                    action: 'View Risks',
                    url: 'Dashboard'
                },
                {
                    title: 'Request Detailed Analysis',
                    description: 'Ask the Digital Twin for in-depth analysis on specific events',
                    action: 'Consult',
                    url: 'Consultation'
                }
            ]
        }
    },
    document_analysis: {
        pt: {
            title: 'Análise de Documentos',
            description: 'Faça upload e analise documentos com IA',
            steps: [
                {
                    title: 'Upload de Documento',
                    description: 'Envie PDFs, relatórios ou artigos para análise',
                    action: 'Fazer Upload',
                    url: 'Dashboard'
                },
                {
                    title: 'Processamento Automático',
                    description: 'Aguarde a extração de insights e análise de conteúdo',
                    action: 'Aguardar',
                    url: 'Dashboard'
                },
                {
                    title: 'Chat com o Documento',
                    description: 'Faça perguntas específicas sobre o conteúdo do documento',
                    action: 'Iniciar Chat',
                    url: 'Dashboard'
                }
            ]
        },
        en: {
            title: 'Document Analysis',
            description: 'Upload and analyze documents with AI',
            steps: [
                {
                    title: 'Upload Document',
                    description: 'Submit PDFs, reports or articles for analysis',
                    action: 'Upload',
                    url: 'Dashboard'
                },
                {
                    title: 'Automatic Processing',
                    description: 'Wait for insight extraction and content analysis',
                    action: 'Wait',
                    url: 'Dashboard'
                },
                {
                    title: 'Chat with Document',
                    description: 'Ask specific questions about document content',
                    action: 'Start Chat',
                    url: 'Dashboard'
                }
            ]
        }
    }
};

export default function WorkflowGuide({ lang = 'pt', onComplete }) {
    const [open, setOpen] = useState(false);
    const [currentWorkflow, setCurrentWorkflow] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem('workflow_guide_seen');
        if (!hasSeenGuide) {
            setOpen(true);
            setCurrentWorkflow('first_consultation');
        }
    }, []);

    const startWorkflow = (workflowKey) => {
        setCurrentWorkflow(workflowKey);
        setCurrentStep(0);
        setCompletedSteps(new Set());
        setOpen(true);
    };

    const workflow = currentWorkflow ? workflows[currentWorkflow][lang] : null;

    const handleNext = () => {
        if (currentStep < workflow.steps.length - 1) {
            setCompletedSteps(new Set([...completedSteps, currentStep]));
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        setCompletedSteps(new Set([...completedSteps, currentStep]));
        localStorage.setItem('workflow_guide_seen', 'true');
        setOpen(false);
        if (onComplete) onComplete();
    };

    const handleAction = () => {
        const step = workflow.steps[currentStep];
        if (step.url) {
            navigate(createPageUrl(step.url));
            setOpen(false);
        }
    };

    const progress = ((currentStep + 1) / workflow?.steps.length) * 100;

    return (
        <>
            {/* Floating Guide Button */}
            <div className="fixed bottom-20 right-4 z-40">
                <Button
                    onClick={() => setOpen(true)}
                    className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-[#002D62] to-[#00654A] hover:shadow-xl transition-all"
                >
                    <Sparkles className="w-6 h-6" />
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    {!currentWorkflow ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-2xl">
                                    <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                                    {lang === 'pt' ? 'Fluxos de Trabalho Guiados' : 'Guided Workflows'}
                                </DialogTitle>
                                <DialogDescription>
                                    {lang === 'pt' 
                                        ? 'Escolha um fluxo para ser guiado passo a passo' 
                                        : 'Choose a workflow to be guided step by step'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 mt-4">
                                {Object.entries(workflows).map(([key, workflow]) => (
                                    <Card key={key} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => startWorkflow(key)}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-[#002D62] mb-1">{workflow[lang].title}</h4>
                                                    <p className="text-sm text-gray-600">{workflow[lang].description}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="outline">{workflow[lang].steps.length} {lang === 'pt' ? 'passos' : 'steps'}</Badge>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-xl">{workflow.title}</DialogTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentWorkflow(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    {lang === 'pt' ? 'Passo' : 'Step'} {currentStep + 1} {lang === 'pt' ? 'de' : 'of'} {workflow.steps.length}
                                </div>
                            </DialogHeader>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="py-6 space-y-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            {completedSteps.has(currentStep) ? (
                                                <CheckCircle className="w-8 h-8 text-green-600" />
                                            ) : (
                                                <Circle className="w-8 h-8 text-[#002D62]" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#002D62] mb-2">
                                                {workflow.steps[currentStep].title}
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                {workflow.steps[currentStep].description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentWorkflow(null)}
                                        >
                                            {lang === 'pt' ? 'Voltar' : 'Back'}
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={handleAction}
                                            >
                                                {workflow.steps[currentStep].action}
                                            </Button>
                                            <Button
                                                onClick={handleNext}
                                                className="bg-[#002D62]"
                                            >
                                                {currentStep === workflow.steps.length - 1 
                                                    ? (lang === 'pt' ? 'Concluir' : 'Complete')
                                                    : (lang === 'pt' ? 'Próximo' : 'Next')}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}