import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    FolderKanban, Plus, Calendar, Users, Settings, 
    Trash2, Edit, Eye, Clock, Target, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ProjectManager({ lang = 'pt', onSelectProject }) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showNewProject, setShowNewProject] = useState(false);
    
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        priority: 'medium',
        start_date: '',
        end_date: '',
        color: '#3b82f6'
    });

    const translations = {
        pt: {
            title: "Gerenciador de Projetos",
            desc: "Organize tarefas em projetos",
            newProject: "Novo Projeto",
            projectName: "Nome do Projeto",
            description: "Descrição",
            priority: "Prioridade",
            startDate: "Data Início",
            endDate: "Data Fim",
            color: "Cor",
            create: "Criar Projeto",
            cancel: "Cancelar",
            noProjects: "Nenhum projeto criado",
            tasks: "tarefas",
            completion: "Conclusão",
            viewProject: "Ver Projeto",
            editProject: "Editar",
            deleteProject: "Excluir",
            status: {
                planning: "Planejamento",
                active: "Ativo",
                on_hold: "Em Espera",
                completed: "Concluído",
                archived: "Arquivado"
            },
            priority_levels: {
                low: "Baixa",
                medium: "Média",
                high: "Alta",
                critical: "Crítica"
            }
        },
        en: {
            title: "Project Manager",
            desc: "Organize tasks into projects",
            newProject: "New Project",
            projectName: "Project Name",
            description: "Description",
            priority: "Priority",
            startDate: "Start Date",
            endDate: "End Date",
            color: "Color",
            create: "Create Project",
            cancel: "Cancel",
            noProjects: "No projects created",
            tasks: "tasks",
            completion: "Completion",
            viewProject: "View Project",
            editProject: "Edit",
            deleteProject: "Delete",
            status: {
                planning: "Planning",
                active: "Active",
                on_hold: "On Hold",
                completed: "Completed",
                archived: "Archived"
            },
            priority_levels: {
                low: "Low",
                medium: "Medium",
                high: "High",
                critical: "Critical"
            }
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadProjects();
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const user = await base44.auth.me();
            setCurrentUser(user);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const loadProjects = async () => {
        setIsLoading(true);
        try {
            const projectList = await base44.entities.Project.list('-created_date', 100);
            setProjects(projectList || []);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createProject = async () => {
        if (!newProject.name.trim()) return;

        try {
            const created = await base44.entities.Project.create({
                ...newProject,
                status: 'planning',
                owner: currentUser?.email,
                team_members: [currentUser?.email],
                permissions: {
                    admins: [currentUser?.email],
                    editors: [],
                    viewers: []
                },
                completion_percentage: 0
            });

            setProjects(prev => [created, ...prev]);
            setNewProject({ 
                name: '', 
                description: '', 
                priority: 'medium',
                start_date: '',
                end_date: '',
                color: '#3b82f6'
            });
            setShowNewProject(false);
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const deleteProject = async (projectId) => {
        if (!confirm(lang === 'pt' ? 'Excluir este projeto?' : 'Delete this project?')) return;

        try {
            await base44.entities.Project.delete(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            planning: 'bg-gray-500',
            active: 'bg-blue-600',
            on_hold: 'bg-yellow-600',
            completed: 'bg-green-600',
            archived: 'bg-gray-400'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return colors[priority] || colors.medium;
    };

    return (
        <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription className="text-indigo-100">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" />
                            {t.newProject}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t.newProject}</DialogTitle>
                            <DialogDescription>{t.desc}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                placeholder={t.projectName}
                                value={newProject.name}
                                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <Textarea
                                placeholder={t.description}
                                value={newProject.description}
                                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">{t.startDate}</label>
                                    <Input
                                        type="date"
                                        value={newProject.start_date}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, start_date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">{t.endDate}</label>
                                    <Input
                                        type="date"
                                        value={newProject.end_date}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, end_date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <Select
                                value={newProject.priority}
                                onValueChange={(value) => setNewProject(prev => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">{t.priority_levels.low}</SelectItem>
                                    <SelectItem value="medium">{t.priority_levels.medium}</SelectItem>
                                    <SelectItem value="high">{t.priority_levels.high}</SelectItem>
                                    <SelectItem value="critical">{t.priority_levels.critical}</SelectItem>
                                </SelectContent>
                            </Select>
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">{t.color}</label>
                                <Input
                                    type="color"
                                    value={newProject.color}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, color: e.target.value }))}
                                    className="h-12"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={createProject}
                                    disabled={!newProject.name.trim()}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {t.create}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowNewProject(false)}
                                >
                                    {t.cancel}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">{t.noProjects}</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-white rounded-lg border-2 hover:shadow-md transition-all"
                                style={{ borderColor: project.color + '40' }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: project.color }}
                                            />
                                            <h4 className="font-semibold text-gray-900 truncate">
                                                {project.name}
                                            </h4>
                                            <Badge className={getPriorityColor(project.priority)}>
                                                {t.priority_levels[project.priority]}
                                            </Badge>
                                        </div>
                                        {project.description && (
                                            <p className="text-xs text-gray-600 mb-2">{project.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                                            <Badge className={`${getStatusColor(project.status)} text-white`}>
                                                {t.status[project.status]}
                                            </Badge>
                                            {project.start_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(project.start_date), 'dd/MM/yy')}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Target className="w-3 h-3" />
                                                {project.completion_percentage || 0}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onSelectProject && onSelectProject(project)}
                                            className="h-8"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => deleteProject(project.id)}
                                            className="h-8 text-red-600"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}