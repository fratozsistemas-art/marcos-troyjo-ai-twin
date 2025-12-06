import React, { useState } from 'react';
import { useAgent } from './AgentProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play, Square, Zap, CheckCircle2, XCircle, Activity, Clock, Target, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import TaskManager from './TaskManager';
import ProjectManager from './ProjectManager';
import GanttChart from './GanttChart';
import AgentMonitor from './AgentMonitor';

export default function AgentControl({ lang = 'pt' }) {
    const { isRunning, currentGoal, steps, error, runAgent, stopAgent, pendingConfirmation, confirmAction } = useAgent();
    const [goalInput, setGoalInput] = useState('');
    const [activeTab, setActiveTab] = useState('direct');
    const [selectedProject, setSelectedProject] = useState(null);

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

    const handleTaskExecution = (goal, taskId) => {
        setGoalInput(goal);
        setActiveTab('direct');
        runAgent(goal, 15, taskId);
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
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="direct">
                            {lang === 'pt' ? 'Execução' : 'Execution'}
                        </TabsTrigger>
                        <TabsTrigger value="projects">
                            {lang === 'pt' ? 'Projetos' : 'Projects'}
                        </TabsTrigger>
                        <TabsTrigger value="tasks">
                            {lang === 'pt' ? 'Tarefas' : 'Tasks'}
                        </TabsTrigger>
                        <TabsTrigger value="timeline">
                            {lang === 'pt' ? 'Timeline' : 'Timeline'}
                        </TabsTrigger>
                        <TabsTrigger value="monitor">
                            {lang === 'pt' ? 'Monitor' : 'Monitor'}
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="direct" className="space-y-4 mt-4">
                {/* Status Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{lang === 'pt' ? 'Status' : 'Status'}</p>
                                    <p className="text-lg font-bold text-[#002D62]">
                                        {isRunning ? (lang === 'pt' ? 'Em Execução' : 'Running') : (lang === 'pt' ? 'Inativo' : 'Idle')}
                                    </p>
                                </div>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isRunning ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    {isRunning ? (
                                        <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
                                    ) : (
                                        <Activity className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{lang === 'pt' ? 'Passos Executados' : 'Steps Completed'}</p>
                                    <p className="text-lg font-bold text-[#002D62]">{steps.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">{lang === 'pt' ? 'Objetivo Atual' : 'Current Goal'}</p>
                                    <p className="text-sm font-semibold text-[#002D62] truncate">
                                        {currentGoal || (lang === 'pt' ? 'Nenhum' : 'None')}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex gap-2">
                    <Input
                        data-ai-id="input_agent_goal"
                        data-ai-role="textbox"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        placeholder={t.goalPlaceholder}
                        disabled={isRunning}
                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        className="border-2"
                    />
                    {!isRunning ? (
                        <Button
                            data-ai-id="btn_start_agent"
                            data-ai-role="button"
                            onClick={handleStart}
                            disabled={!goalInput.trim()}
                            className="bg-[#00654A] hover:bg-[#004d38] shadow-lg"
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
                            className="shadow-lg"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            {t.stop}
                        </Button>
                    )}
                </div>

                {isRunning && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden"
                    >
                        <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="relative">
                                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                        <div className="absolute inset-0 bg-blue-400 blur-xl opacity-30 animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-blue-900">{t.running}</p>
                                        {currentGoal && (
                                            <p className="text-xs text-blue-700">{currentGoal}</p>
                                        )}
                                    </div>
                                    <Badge className="bg-blue-600 text-white">
                                        {lang === 'pt' ? 'Ativo' : 'Active'}
                                    </Badge>
                                </div>
                                <Progress value={steps.length * 20} className="h-2" />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-red-100">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-red-700" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-red-900 mb-1">
                                            {lang === 'pt' ? 'Erro na Execução' : 'Execution Error'}
                                        </p>
                                        <p className="text-xs text-red-700">{error}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {steps.length > 0 && (
                    <Card className="border-2 border-[#002D62]">
                        <CardHeader className="bg-gradient-to-r from-[#002D62] to-[#00654A] text-white pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                {lang === 'pt' ? 'Log de Atividades' : 'Activity Log'}
                                <Badge variant="secondary" className="ml-auto">{steps.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence>
                                    {steps.map((step, index) => {
                                        const hasSuccess = step.response.actions?.some(
                                            (_, i) => step.actionResults?.[i]?.result?.success
                                        );
                                        const hasFailure = step.response.actions?.some(
                                            (_, i) => !step.actionResults?.[i]?.result?.success
                                        );

                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="relative"
                                            >
                                                {/* Timeline connector */}
                                                {index < steps.length - 1 && (
                                                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-transparent" />
                                                )}
                                                
                                                <Card className={`border-l-4 ${
                                                    hasFailure ? 'border-l-red-500 bg-red-50/30' : 
                                                    hasSuccess ? 'border-l-green-500 bg-green-50/30' : 
                                                    'border-l-blue-500 bg-blue-50/30'
                                                } hover:shadow-lg transition-all duration-200`}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                                                                hasFailure ? 'bg-red-200' : 
                                                                hasSuccess ? 'bg-green-200' : 
                                                                'bg-blue-200'
                                                            }`}>
                                                                <span className="text-sm font-bold text-gray-700">
                                                                    #{step.step}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Badge className={
                                                                        step.response.type === 'actions' 
                                                                            ? 'bg-green-600' 
                                                                            : step.response.type === 'complete'
                                                                            ? 'bg-blue-600'
                                                                            : 'bg-gray-600'
                                                                    }>
                                                                        {step.response.type}
                                                                    </Badge>
                                                                    <span className="text-xs text-gray-500">
                                                                        {new Date().toLocaleTimeString()}
                                                                    </span>
                                                                </div>

                                                                {step.response.reasoning && (
                                                                    <div className="mb-3 p-3 bg-white/80 rounded-lg border border-gray-200">
                                                                        <p className="text-xs text-gray-700 leading-relaxed">
                                                                            {step.response.reasoning}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {step.response.actions && (
                                                                    <div className="space-y-2">
                                                                        {step.response.actions.map((action, i) => {
                                                                            const result = step.actionResults?.[i]?.result;
                                                                            return (
                                                                                <motion.div 
                                                                                    key={i}
                                                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    className={`p-3 rounded-lg border-2 ${
                                                                                        result?.success 
                                                                                            ? 'bg-green-50 border-green-300' 
                                                                                            : 'bg-red-50 border-red-300'
                                                                                    }`}
                                                                                >
                                                                                    <div className="flex items-start gap-2">
                                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                                                            result?.success ? 'bg-green-500' : 'bg-red-500'
                                                                                        }`}>
                                                                                            {result?.success ? (
                                                                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                                                                            ) : (
                                                                                                <XCircle className="w-4 h-4 text-white" />
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <code className="text-xs font-mono font-bold text-[#002D62] block break-all mb-1">
                                                                                                {action.name}({action.args.element_id || action.args.screen || action.args.focus_area})
                                                                                            </code>
                                                                                            {action.args.reason && (
                                                                                                <p className="text-xs text-gray-600 mb-2">
                                                                                                    💡 {action.args.reason}
                                                                                                </p>
                                                                                            )}
                                                                                            {result?.success && result?.state && (
                                                                                                <div className="text-xs bg-white p-2 rounded border border-green-200 mt-2">
                                                                                                    {result.type === 'read' ? (
                                                                                                        <div className="space-y-1">
                                                                                                            <p className="font-semibold text-green-800">📖 Read Result:</p>
                                                                                                            {result.state.text && <p className="truncate text-gray-700">Text: {result.state.text}</p>}
                                                                                                            {result.state.value !== undefined && <p className="text-gray-700">Value: {result.state.value}</p>}
                                                                                                            {result.state.element_count !== undefined && <p className="text-gray-700">Found: {result.state.element_count} elements</p>}
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <div className="space-y-1">
                                                                                                            <p className="font-semibold text-green-800">✅ Action Result:</p>
                                                                                                            {result.state.state_changed !== undefined && (
                                                                                                                <p className="text-gray-700">State changed: {result.state.state_changed ? 'Yes ✓' : 'No'}</p>
                                                                                                            )}
                                                                                                            {result.state.verified !== undefined && (
                                                                                                                <p className="text-gray-700">Verified: {result.state.verified ? '✓ Yes' : '✗ No'}</p>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            )}
                                                                                            {result && !result.success && (
                                                                                                <div className="text-xs bg-white p-2 rounded border border-red-200 mt-2">
                                                                                                    <p className="font-semibold text-red-800 mb-1">❌ Failed:</p>
                                                                                                    <p className="text-red-700">{result.reason}</p>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </motion.div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #888;
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #555;
                    }
                `}</style>
                    </TabsContent>

                    <TabsContent value="projects">
                        <ProjectManager 
                            lang={lang} 
                            onSelectProject={(project) => {
                                setSelectedProject(project);
                                setActiveTab('tasks');
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="tasks">
                        {selectedProject && (
                            <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs text-indigo-600 font-medium">
                                            {lang === 'pt' ? 'Projeto Selecionado:' : 'Selected Project:'}
                                        </span>
                                        <h4 className="font-semibold text-indigo-900">{selectedProject.name}</h4>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedProject(null)}
                                    >
                                        {lang === 'pt' ? 'Limpar' : 'Clear'}
                                    </Button>
                                </div>
                            </div>
                        )}
                        <TaskManager 
                            lang={lang} 
                            onExecuteTask={handleTaskExecution}
                            selectedProject={selectedProject}
                        />
                    </TabsContent>

                    <TabsContent value="timeline">
                        {selectedProject ? (
                            <GanttChart projectId={selectedProject.id} lang={lang} />
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-gray-500">
                                    <p className="text-sm">
                                        {lang === 'pt' 
                                            ? 'Selecione um projeto para ver o cronograma' 
                                            : 'Select a project to view timeline'}
                                    </p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => setActiveTab('projects')}
                                    >
                                        {lang === 'pt' ? 'Ver Projetos' : 'View Projects'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="monitor">
                        <AgentMonitor lang={lang} />
                    </TabsContent>
                </Tabs>
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