import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { 
    Home, 
    LayoutDashboard, 
    MessageSquare, 
    Sparkles, 
    FileText, 
    MessageCircle, 
    FileCheck,
    History,
    Bot,
    FolderOpen,
    UserCog,
    Database,
    Shield,
    CreditCard,
    Activity,
    BookOpen,
    BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NavigationMenu({ lang = 'pt', collapsed = false }) {
    const location = useLocation();
    const [userRole, setUserRole] = useState('external');

    const translations = {
        pt: {
            home: 'Início',
            dashboard: 'Painel',
            systemHealth: 'Saúde do Sistema',
            consultation: 'Consulta',
            knowledgeHub: 'Hub de Conhecimento',
            personas: 'Personas',
            roleManagement: 'Controle de Acesso',
            pricing: 'Planos',
            agentUI: 'Agente UI',
            assets: 'Assets',
            metaphors: 'Metáforas',
            interview: 'Entrevista',
            article: 'Artigo',
            assessment: 'Avaliação',
            history: 'Histórico'
        },
        en: {
            home: 'Home',
            dashboard: 'Dashboard',
            systemHealth: 'System Health',
            consultation: 'Consultation',
            knowledgeHub: 'Knowledge Hub',
            personas: 'Personas',
            roleManagement: 'Access Control',
            pricing: 'Pricing',
            agentUI: 'UI Agent',
            assets: 'Assets',
            metaphors: 'Metaphors',
            interview: 'Interview',
            article: 'Article',
            assessment: 'Assessment',
            history: 'History'
        }
    };

    const t = translations[lang];

    useEffect(() => {
        checkUserRole();
    }, []);

    const checkUserRole = async () => {
        try {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
                setUserRole('external');
                return;
            }

            const user = await base44.auth.me();
            const email = user.email.toLowerCase();
            
            // Internal users: caio.vision, fratoz, troyjo domains or admin role
            const isInternal = email.includes('@caio') || 
                              email.includes('@fratoz') || 
                              email.includes('@troyjo') ||
                              user.role === 'admin';
            
            setUserRole(isInternal ? 'internal' : 'external');
        } catch (error) {
            setUserRole('external');
        }
    };

    const allMenuItems = [
        { label: t.home, path: 'Website', icon: Home, roles: ['external', 'internal'] },
        { label: t.dashboard, path: 'Dashboard', icon: LayoutDashboard, roles: ['external', 'internal'] },
        { label: lang === 'pt' ? 'Analytics' : 'Analytics', path: 'AnalyticsDashboard', icon: BarChart3, roles: ['external', 'internal'] },
        { label: t.consultation, path: 'Consultation', icon: MessageSquare, roles: ['external', 'internal'] },
        { label: lang === 'pt' ? 'Base de Conhecimento' : 'Knowledge Base', path: 'KnowledgeBase', icon: BookOpen, roles: ['external', 'internal'] },
        { label: t.pricing, path: 'Pricing', icon: CreditCard, roles: ['external', 'internal'] },
        { label: t.systemHealth, path: 'SystemHealth', icon: Activity, roles: ['internal'] },
        { label: t.knowledgeHub, path: 'KnowledgeHub', icon: Database, roles: ['internal'] },
        { label: t.personas, path: 'PersonaManagement', icon: UserCog, roles: ['internal'] },
        { label: t.roleManagement, path: 'RoleManagement', icon: Shield, roles: ['internal'] },
        { label: t.agentUI, path: 'AgentUI', icon: Bot, roles: ['internal'] },
        { label: t.assets, path: 'Assets', icon: FolderOpen, roles: ['internal'] },
        { label: t.metaphors, path: 'MetaphorsGenerator', icon: Sparkles, roles: ['internal'] },
        { label: t.interview, path: 'InterviewPrep', icon: MessageCircle, roles: ['internal'] },
        { label: t.article, path: 'ArticleGenerator', icon: FileText, roles: ['internal'] },
        { label: t.assessment, path: 'DocumentAssessment', icon: FileCheck, roles: ['internal'] },
        { label: t.history, path: 'History', icon: History, roles: ['internal'] }
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

    const isActive = (path) => {
        const currentPath = location.pathname.split('/').pop();
        return currentPath === path.toLowerCase() || location.pathname.includes(path);
    };

    return (
        <nav className="flex flex-col gap-1 p-3">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                    <Link
                        key={item.path}
                        to={createPageUrl(item.path)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                            active
                                ? "bg-[#002D62] text-white shadow-md"
                                : "text-[#333F48] hover:bg-gray-100"
                        )}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                            <span className="font-medium text-sm">{item.label}</span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}