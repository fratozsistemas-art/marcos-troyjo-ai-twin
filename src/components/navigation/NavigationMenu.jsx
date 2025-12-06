import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
    FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NavigationMenu({ lang = 'pt', collapsed = false }) {
    const location = useLocation();

    const translations = {
        pt: {
            home: 'Início',
            dashboard: 'Painel',
            consultation: 'Consulta',
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
            consultation: 'Consultation',
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

    const menuItems = [
        { label: t.home, path: 'Home', icon: Home },
        { label: t.dashboard, path: 'Dashboard', icon: LayoutDashboard },
        { label: t.consultation, path: 'Consultation', icon: MessageSquare },
        { label: t.agentUI, path: 'AgentUI', icon: Bot },
        { label: t.assets, path: 'Assets', icon: FolderOpen },
        { label: t.metaphors, path: 'MetaphorsGenerator', icon: Sparkles },
        { label: t.interview, path: 'InterviewPrep', icon: MessageCircle },
        { label: t.article, path: 'ArticleGenerator', icon: FileText },
        { label: t.assessment, path: 'DocumentAssessment', icon: FileCheck },
        { label: t.history, path: 'History', icon: History }
    ];

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