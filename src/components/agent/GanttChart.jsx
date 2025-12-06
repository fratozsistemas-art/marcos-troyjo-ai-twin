import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import { format, differenceInDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths } from 'date-fns';

export default function GanttChart({ projectId, lang = 'pt' }) {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    const translations = {
        pt: {
            title: "Cronograma do Projeto",
            noTasks: "Nenhuma tarefa com datas definidas",
            blocked: "Bloqueada",
            dependency: "Dependência"
        },
        en: {
            title: "Project Timeline",
            noTasks: "No tasks with defined dates",
            blocked: "Blocked",
            dependency: "Dependency"
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadTasks();
    }, [projectId]);

    const loadTasks = async () => {
        if (!projectId) return;
        
        setIsLoading(true);
        try {
            const taskList = await base44.entities.AgentTask.filter({ project_id: projectId });
            const tasksWithDates = taskList.filter(t => t.start_date || t.due_date);
            setTasks(tasksWithDates);
            
            if (tasksWithDates.length > 0) {
                const dates = tasksWithDates.map(t => [
                    t.start_date ? parseISO(t.start_date) : null,
                    t.due_date ? parseISO(t.due_date) : null
                ]).flat().filter(Boolean);
                
                const minDate = new Date(Math.min(...dates));
                const maxDate = new Date(Math.max(...dates));
                
                setDateRange({
                    start: startOfMonth(minDate),
                    end: endOfMonth(addMonths(maxDate, 1))
                });
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTaskPosition = (task) => {
        if (!task.start_date || !dateRange.start) return null;
        
        const taskStart = parseISO(task.start_date);
        const taskEnd = task.due_date ? parseISO(task.due_date) : taskStart;
        
        const totalDays = differenceInDays(dateRange.end, dateRange.start);
        const startOffset = differenceInDays(taskStart, dateRange.start);
        const duration = differenceInDays(taskEnd, taskStart) + 1;
        
        return {
            left: `${(startOffset / totalDays) * 100}%`,
            width: `${(duration / totalDays) * 100}%`
        };
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#94a3b8',
            in_progress: '#3b82f6',
            completed: '#22c55e',
            failed: '#ef4444',
            paused: '#f59e0b',
            blocked: '#dc2626'
        };
        return colors[status] || colors.pending;
    };

    const hasBlockingDependencies = (task) => {
        if (!task.dependencies || task.dependencies.length === 0) return false;
        return task.dependencies.some(depId => {
            const depTask = tasks.find(t => t.id === depId);
            return depTask && depTask.status !== 'completed';
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (tasks.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-indigo-600">
                        <Calendar className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{t.noTasks}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const monthsInRange = dateRange.start && dateRange.end 
        ? eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
            .filter(d => d.getDate() === 1)
        : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-600">
                    <Calendar className="w-5 h-5" />
                    {t.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Timeline header */}
                    <div className="flex border-b border-gray-200 pb-2 mb-4">
                        {monthsInRange.map((month, idx) => {
                            const monthDays = differenceInDays(
                                endOfMonth(month), 
                                startOfMonth(month)
                            ) + 1;
                            const totalDays = differenceInDays(dateRange.end, dateRange.start);
                            const width = (monthDays / totalDays) * 100;
                            
                            return (
                                <div 
                                    key={idx}
                                    style={{ width: `${width}%` }}
                                    className="text-center text-xs font-semibold text-gray-600 border-r border-gray-200"
                                >
                                    {format(month, 'MMM yyyy')}
                                </div>
                            );
                        })}
                    </div>

                    {/* Tasks */}
                    <div className="space-y-3">
                        {tasks.map((task) => {
                            const position = getTaskPosition(task);
                            const isBlocked = hasBlockingDependencies(task);
                            
                            return (
                                <div key={task.id} className="relative">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-gray-700 truncate w-40">
                                            {task.title}
                                        </span>
                                        {isBlocked && (
                                            <Badge variant="destructive" className="text-xs">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {t.blocked}
                                            </Badge>
                                        )}
                                        {task.assigned_to && (
                                            <span className="text-xs text-gray-500">
                                                @{task.assigned_to.split('@')[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative h-8 bg-gray-100 rounded">
                                        {position && (
                                            <div
                                                className="absolute h-full rounded flex items-center px-2 text-white text-xs font-medium shadow-sm transition-all hover:shadow-md"
                                                style={{
                                                    left: position.left,
                                                    width: position.width,
                                                    backgroundColor: getStatusColor(task.status),
                                                    opacity: isBlocked ? 0.6 : 1
                                                }}
                                            >
                                                <span className="truncate">
                                                    {task.status === 'completed' && '✓ '}
                                                    {task.title}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {task.dependencies && task.dependencies.length > 0 && (
                                        <div className="text-xs text-gray-400 mt-1 ml-1">
                                            {t.dependency}: {task.dependencies.length}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}