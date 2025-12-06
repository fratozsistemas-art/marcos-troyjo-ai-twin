import React, { useState } from 'react';
import { useAgent } from './AgentProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Square, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentControl({ lang = 'pt' }) {
    const { isRunning, currentGoal, steps, error, runAgent, stopAgent, pendingConfirmation, confirmAction } = useAgent();
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
        <>
            <Card className="border-2 border-[#7B3F00] bg-gradient-to-br from-white to-amber-50/30 shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#002D62] to-[#00654A] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#FFD700]" />
                        {t.title}
                    </CardTitle>
                    <CardDescription className="text-gray-100">{t.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
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
                        className="flex items-center gap-2 p-4 bg-blue-600 text-white border-2 border-blue-700 rounded-lg shadow-lg"
                    >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <div className="flex-1">
                            <span className="text-sm font-semibold block">{t.running}</span>
                            {currentGoal && (
                                <span className="text-xs opacity-90">{currentGoal}</span>
                            )}
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-start gap-3 p-4 bg-red-600 text-white border-2 border-red-700 rounded-lg shadow-lg"
                    >
                        <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </motion.div>
                )}

                {steps.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-[#002D62] flex items-center gap-2">
                            {t.steps} <Badge className="bg-[#00654A] text-white">{steps.length}</Badge>
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            <AnimatePresence>
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow text-xs"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-[#002D62] text-sm">
                                                Step {step.step}
                                            </span>
                                            <Badge 
                                                className={step.response.type === 'actions' 
                                                    ? 'bg-green-600 text-white' 
                                                    : 'bg-gray-500 text-white'}
                                            >
                                                {step.response.type}
                                            </Badge>
                                        </div>
                                        {step.response.reasoning && (
                                            <p className="text-gray-700 mb-3 leading-relaxed">{step.response.reasoning}</p>
                                        )}
                                        {step.response.actions && (
                                            <div className="space-y-2">
                                                {step.response.actions.map((action, i) => {
                                                    const result = step.actionResults?.[i]?.result;
                                                    return (
                                                        <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                                            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${result?.success ? 'text-green-600' : 'text-red-600'}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <code className="text-xs font-mono text-[#002D62] break-all">
                                                                    {action.name}({action.args.element_id || action.args.screen})
                                                                </code>
                                                                {action.args.reason && (
                                                                    <p className="text-xs text-gray-600 mt-1">{action.args.reason}</p>
                                                                )}
                                                                {result && !result.success && (
                                                                    <p className="text-xs text-red-600 mt-1">Failed: {result.reason}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
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

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {pendingConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={() => confirmAction(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-4 border-[#B8860B]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-6 h-6 text-[#B8860B]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#002D62] mb-2">
                                        {lang === 'pt' ? 'Confirmar Ação' : 'Confirm Action'}
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-2">
                                        {lang === 'pt' ? 'O agente deseja executar:' : 'Agent wants to execute:'}
                                    </p>
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <code className="text-xs font-mono text-[#002D62] block mb-2">
                                            {pendingConfirmation.action.name}
                                        </code>
                                        {pendingConfirmation.action.args.reason && (
                                            <p className="text-xs text-gray-600">
                                                {pendingConfirmation.action.args.reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => confirmAction(false)}
                                    variant="outline"
                                    className="flex-1 border-2 border-gray-300 hover:bg-gray-100 font-semibold"
                                >
                                    {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                                </Button>
                                <Button
                                    onClick={() => confirmAction(true)}
                                    className="flex-1 bg-[#00654A] hover:bg-[#004d38] text-white font-semibold shadow-lg"
                                >
                                    {lang === 'pt' ? 'Confirmar' : 'Confirm'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}