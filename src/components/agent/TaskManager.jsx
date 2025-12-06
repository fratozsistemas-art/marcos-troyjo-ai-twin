import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ListTodo, Plus, Play, Pause, Trash2, Clock, CheckCircle2, 
    AlertCircle, Loader2, ChevronDown, ChevronRight, Lightbulb,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskManager({ lang = 'pt', onExecuteTask }) {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showNewTask, setShowNewTask] = useState(false);
    const [analyzingTask, setAnalyzingTask] = useState(false);
    const [expandedTask, setExpandedTask] = useState(null);
    
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        goal: '',
        priority: 'medium'
    });

    const translations = {
        pt: {
            title: "Gerenciador de Tarefas do Agente",
            desc: "Defina e rastreie tarefas complexas",
            newTask: "Nova Tarefa",
            taskTitle: "Título da Tarefa",
            taskDesc: "Descrição",
            taskGoal: "Objetivo (para o agente)",
            priority: "Prioridade",
            analyze: "Analisar Tarefa",
            create: "Criar Tarefa",
            cancel: "Cancelar",
            execute: "Executar",
            pause: "Pausar",
            delete: "Excluir",
            noTasks: "Nenhuma tarefa criada",
            subtasks: "Subtarefas",
            estimatedTime: "Tempo estimado",
            estimatedSteps: "Passos estimados",
            progress: "Progresso",
            status: {
                pending: "Pendente",
                in_progress: "Em Execução",
                completed: "Concluída",
                failed: "Falhou",
                paused: "Pausada"
            },
            priority_levels: {
                low: "Baixa",
                medium: "Média",
                high: "Alta",
                urgent: "Urgente"
            }
        },
        en: {
            title: "Agent Task Manager",
            desc: "Define and track complex tasks",
            newTask: "New Task",
            taskTitle: "Task Title",
            taskDesc: "Description",
            taskGoal: "Goal (for agent)",
            priority: "Priority",
            analyze: "Analyze Task",
            create: "Create Task",
            cancel: "Cancel",
            execute: "Execute",
            pause: "Pause",
            delete: "Delete",
            noTasks: "No tasks created",
            subtasks: "Subtasks",
            estimatedTime: "Estimated time",
            estimatedSteps: "Estimated steps",
            progress: "Progress",
            status: {
                pending: "Pending",
                in_progress: "In Progress",
                completed: "Completed",
                failed: "Failed",
                paused: "Paused"
            },
            priority_levels: {
                low: "Low",
                medium: "Medium",
                high: "High",
                urgent: "Urgent"
            }
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setIsLoading(true);
        try {
            const taskList = await base44.entities.AgentTask.list('-created_date', 50);
            setTasks(taskList || []);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const analyzeTask = async () => {
        if (!newTask.goal.trim()) return;

        setAnalyzingTask(true);
        try {
            const response = await base44.functions.invoke('analyzeTask', {
                goal: newTask.goal,
                context: newTask.description
            });

            if (response.data.success) {
                const analysis = response.data.analysis;
                setNewTask(prev => ({
                    ...prev,
                    subtasks: analysis.subtasks.map((st, idx) => ({
                        title: st.title || st,
                        completed: false,
                        order: idx
                    })),
                    estimated_steps: analysis.estimated_steps,
                    estimated_duration_minutes: analysis.estimated_duration_minutes
                }));
            }
        } catch (error) {
            console.error('Error analyzing task:', error);
        } finally {
            setAnalyzingTask(false);
        }
    };

    const createTask = async () => {
        if (!newTask.title.trim() || !newTask.goal.trim()) return;

        try {
            const created = await base44.entities.AgentTask.create({
                ...newTask,
                status: 'pending',
                completed_steps: 0
            });

            setTasks(prev => [created, ...prev]);
            setNewTask({ title: '', description: '', goal: '', priority: 'medium' });
            setShowNewTask(false);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const executeTask = async (task) => {
        try {
            await base44.entities.AgentTask.update(task.id, {
                status: 'in_progress',
                started_at: new Date().toISOString()
            });
            
            loadTasks();
            
            if (onExecuteTask) {
                onExecuteTask(task.goal, task.id);
            }
        } catch (error) {
            console.error('Error executing task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        if (!confirm(lang === 'pt' ? 'Excluir esta tarefa?' : 'Delete this task?')) return;

        try {
            await base44.entities.AgentTask.delete(taskId);
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-gray-500',
            in_progress: 'bg-blue-600',
            completed: 'bg-green-600',
            failed: 'bg-red-600',
            paused: 'bg-yellow-600'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800 border-blue-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            urgent: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[priority] || colors.medium;
    };

    return (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription className="text-purple-100">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <Button
                    onClick={() => setShowNewTask(!showNewTask)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.newTask}
                </Button>

                <AnimatePresence>
                    {showNewTask && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 p-4 bg-white rounded-lg border-2 border-purple-200"
                        >
                            <Input
                                placeholder={t.taskTitle}
                                value={newTask.title}
                                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <Textarea
                                placeholder={t.taskDesc}
                                value={newTask.description}
                                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                rows={2}
                            />
                            <Textarea
                                placeholder={t.taskGoal}
                                value={newTask.goal}
                                onChange={(e) => setNewTask(prev => ({ ...prev, goal: e.target.value }))}
                                rows={3}
                            />
                            <Select
                                value={newTask.priority}
                                onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">{t.priority_levels.low}</SelectItem>
                                    <SelectItem value="medium">{t.priority_levels.medium}</SelectItem>
                                    <SelectItem value="high">{t.priority_levels.high}</SelectItem>
                                    <SelectItem value="urgent">{t.priority_levels.urgent}</SelectItem>
                                </SelectContent>
                            </Select>

                            {newTask.subtasks && newTask.subtasks.length > 0 && (
                                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm font-semibold text-purple-900">{t.subtasks}</span>
                                    </div>
                                    <ul className="space-y-1 text-xs text-purple-700">
                                        {newTask.subtasks.map((st, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-purple-400">•</span>
                                                {st.title}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex gap-4 mt-2 text-xs text-purple-600">
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            {newTask.estimated_steps} {t.estimatedSteps.toLowerCase()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            ~{newTask.estimated_duration_minutes} min
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={analyzeTask}
                                    disabled={!newTask.goal.trim() || analyzingTask}
                                    className="flex-1"
                                >
                                    {analyzingTask ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Lightbulb className="w-4 h-4 mr-2" />
                                    )}
                                    {t.analyze}
                                </Button>
                                <Button
                                    onClick={createTask}
                                    disabled={!newTask.title.trim() || !newTask.goal.trim()}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                >
                                    {t.create}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowNewTask(false)}
                                >
                                    {t.cancel}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{t.noTasks}</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {tasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                {task.title}
                                            </h4>
                                            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                                                {t.priority_levels[task.priority]}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={`${getStatusColor(task.status)} text-white text-xs`}>
                                                {t.status[task.status]}
                                            </Badge>
                                            {task.estimated_steps && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    {task.completed_steps}/{task.estimated_steps}
                                                </span>
                                            )}
                                            {task.estimated_duration_minutes && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    ~{task.estimated_duration_minutes}min
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {task.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                onClick={() => executeTask(task)}
                                                className="h-8 bg-green-600 hover:bg-green-700"
                                            >
                                                <Play className="w-3 h-3" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => deleteTask(task.id)}
                                            className="h-8 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                                            className="h-8"
                                        >
                                            {expandedTask === task.id ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedTask === task.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-3 pt-3 border-t border-gray-200 space-y-2"
                                        >
                                            {task.description && (
                                                <p className="text-xs text-gray-600">{task.description}</p>
                                            )}
                                            {task.goal && (
                                                <div className="p-2 bg-gray-50 rounded text-xs">
                                                    <strong className="text-gray-700">Goal:</strong> {task.goal}
                                                </div>
                                            )}
                                            {task.subtasks && task.subtasks.length > 0 && (
                                                <div className="space-y-1">
                                                    <span className="text-xs font-semibold text-gray-700">{t.subtasks}:</span>
                                                    {task.subtasks.map((st, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                                                            {st.completed ? (
                                                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                                            ) : (
                                                                <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                                                            )}
                                                            <span className={st.completed ? 'line-through' : ''}>
                                                                {st.title}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}