import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
    Home, LayoutDashboard, MessageSquare, BookOpen, 
    BarChart3, Globe, Menu, User, FileText
} from 'lucide-react';

export default function NavigationMenu({ lang = 'pt' }) {
    const location = useLocation();

    const t = {
        pt: {
            home: 'Início',
            dashboard: 'Painel',
            consultation: 'Consulta',
            knowledge: 'Base de Conhecimento',
            analytics: 'Analytics',
            website: 'Website Público',
            blog: 'Blog'
        },
        en: {
            home: 'Home',
            dashboard: 'Dashboard',
            consultation: 'Consultation',
            knowledge: 'Knowledge Base',
            analytics: 'Analytics',
            website: 'Public Website',
            blog: 'Blog'
        }
    };

    const text = t[lang];

    const menuItems = [
        { path: 'Website', icon: Globe, label: text.website },
        { path: 'Home', icon: Home, label: text.home },
        { path: 'Dashboard', icon: LayoutDashboard, label: text.dashboard },
        { path: 'Consultation', icon: MessageSquare, label: text.consultation },
        { path: 'KnowledgeBase', icon: BookOpen, label: text.knowledge },
        { path: 'AnalyticsDashboard', icon: BarChart3, label: text.analytics },
        { path: 'StrategicIntelligenceBlog', icon: FileText, label: text.blog }
    ];

    const isActive = (path) => {
        const currentPath = location.pathname.split('/').pop();
        return currentPath === path || (path === 'Home' && currentPath === '');
    };

    return (
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-100px)]">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                    <Link key={item.path} to={createPageUrl(item.path)}>
                        <motion.div
                            whileHover={{ x: 4 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                active
                                    ? 'bg-[#002D62] text-white shadow-md'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </motion.div>
                    </Link>
                );
            })}
        </nav>
    );
}