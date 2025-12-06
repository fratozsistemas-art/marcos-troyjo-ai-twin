import React, { useState } from 'react';
import { useAgent } from './AgentProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Square, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentControl({ lang = 'pt' }) {
    const { isRunning, currentGoal, steps, error, runAgent, stopAgent } = useAgent();
    const [goalInput, setGoalInput] = useState('');

    const translations = {
        pt: {
            title: "Controle do Agente de UI",
            desc: "Execute tarefas automaticamente na interface",
            goalPlaceholder: "Ex: Alterar o idioma para inglês e criar uma nova conversa",
            start: "Iniciar Agente",
            stop: "Parar Agente",
            running: "Executando...",
            steps: "Passos Executados",
            goal: "Objetivo",
            status: "Status",
            actions: "Ações",
        },
        en: {
            title: "UI Agent Control",
            desc: "Execute tasks automatically in the interface",
            goalPlaceholder: "E.g., Change language to English and create a new conversation",
            start: "Start Agent",
            stop: "Stop Agent",
            running: "Running...",
            steps: "Executed Steps",
            goal: "Goal",
            status: "Status",
            actions: "Actions",
        }
    };

    const t = translations[lang];

    const handleStart = () => {
        if (goalInput.trim()) {
            runAgent(goalInput.trim());
        }
    };

    return (
        <Card className="border-2 border-[#B8860B]/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Zap className="w-5 h-5 text-[#B8860B]" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        data-ai-id="input_agent_goal"
                        data-ai-role="textbox"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder={t.goalPlaceholder}
                        disabled={isRunning}
                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    />
                    {!isRunning ? (
                        <Button
                            data-ai-id="btn_start_agent"
                            data-ai-role="button"
                            onClick={handleStart}
                            disabled={!goalInput.trim()}
                            className="bg-[#00654A] hover:bg-[#004d38]"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {t.start}
                        </Button>
                    ) : (
                        <Button
                            data-ai-id="btn_stop_agent"
                            data-ai-role="button"
                            onClick={stopAgent}
                            variant="destructive"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            {t.stop}
                        </Button>
                    )}
                </div>

                {isRunning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{t.running}</span>
                        {currentGoal && (
                            <span className="text-xs text-blue-700">— {currentGoal}</span>
                        )}
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-900">{error}</span>
                    </motion.div>
                )}

                {steps.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-[#002D62] flex items-center gap-2">
                            {t.steps} <Badge variant="outline">{steps.length}</Badge>
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            <AnimatePresence>
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-[#002D62]">
                                                Step {step.step}
                                            </span>
                                            <Badge variant={step.response.type === 'actions' ? 'default' : 'secondary'}>
                                                {step.response.type}
                                            </Badge>
                                        </div>
                                        {step.response.reasoning && (
                                            <p className="text-gray-600 mb-2">{step.response.reasoning}</p>
                                        )}
                                        {step.response.actions && (
                                            <div className="space-y-1">
                                                {step.response.actions.map((action, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-[#00654A]">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <code className="text-xs">
                                                            {action.name}({JSON.stringify(action.args)})
                                                        </code>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}