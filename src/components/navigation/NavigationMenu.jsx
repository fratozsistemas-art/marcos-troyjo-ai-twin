import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, MessageSquare, BookOpen, FileText, 
    BarChart3, Shield, Database, Globe, DollarSign, Lock, Home, Settings
} from 'lucide-react';

export default function NavigationMenu({ lang = 'pt' }) {
    const location = useLocation();

    const text = {
        pt: {
            home: 'Início',
            dashboard: 'Painel',
            consultation: 'Consulta',
            knowledge: 'Base de Conhecimento',
            blog: 'Blog',
            analytics: 'Analytics',
            entities: 'Entidades',
            public: 'Início Público',
            pricing: 'Planos',
            privacy: 'Privacidade'
        },
        en: {
            home: 'Home',
            dashboard: 'Dashboard',
            consultation: 'Consultation',
            knowledge: 'Knowledge Base',
            blog: 'Blog',
            analytics: 'Analytics',
            entities: 'Entities',
            public: 'Public Home',
            pricing: 'Pricing',
            privacy: 'Privacy'
        }
    };

    const t = text[lang];

    const menuItems = [
        { path: 'Home', icon: Home, label: t.home },
        { path: 'Dashboard', icon: LayoutDashboard, label: t.dashboard },
        { path: 'Consultation', icon: MessageSquare, label: t.consultation },
        { path: 'KnowledgeBase', icon: BookOpen, label: t.knowledge },
        { path: 'StrategicIntelligenceBlog', icon: FileText, label: t.blog },
        { path: 'AnalyticsDashboard', icon: BarChart3, label: t.analytics },
        { path: 'AdminEntities', icon: Database, label: t.entities },
        { path: 'Pricing', icon: DollarSign, label: t.pricing },
        { path: 'PublicHome', icon: Globe, label: t.public },
        { path: 'PrivacyPolicy', icon: Lock, label: t.privacy }
    ];

    const isActive = (path) => {
        return location.pathname === createPageUrl(path);
    };

    return (
        <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link key={item.path} to={createPageUrl(item.path)}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                                    active 
                                        ? 'bg-gradient-to-r from-[#002D62] to-[#00654A] text-white shadow-md' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}