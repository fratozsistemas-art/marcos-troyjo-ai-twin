import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const pageNames = {
    pt: {
        Website: 'Início',
        Dashboard: 'Painel',
        AnalyticsDashboard: 'Analytics',
        Consultation: 'Consulta',
        KnowledgeBase: 'Base de Conhecimento',
        ArticleView: 'Artigo',
        Pricing: 'Planos',
        SystemHealth: 'Saúde do Sistema',
        KnowledgeHub: 'Hub de Conhecimento',
        PersonaManagement: 'Personas',
        RoleManagement: 'Controle de Acesso',
        History: 'Histórico'
    },
    en: {
        Website: 'Home',
        Dashboard: 'Dashboard',
        AnalyticsDashboard: 'Analytics',
        Consultation: 'Consultation',
        KnowledgeBase: 'Knowledge Base',
        ArticleView: 'Article',
        Pricing: 'Pricing',
        SystemHealth: 'System Health',
        KnowledgeHub: 'Knowledge Hub',
        PersonaManagement: 'Personas',
        RoleManagement: 'Access Control',
        History: 'History'
    }
};

export default function Breadcrumbs({ lang = 'pt' }) {
    const location = useLocation();
    const names = pageNames[lang];

    const pathParts = location.pathname.split('/').filter(Boolean);
    
    if (pathParts.length === 0) {
        return null;
    }

    const currentPage = pathParts[pathParts.length - 1];
    const pageName = names[currentPage] || currentPage;

    // Get parent page if exists
    let parentPage = null;
    if (currentPage === 'AnalyticsDashboard') {
        parentPage = { name: names.Dashboard, path: 'Dashboard' };
    } else if (currentPage === 'ArticleView') {
        parentPage = { name: names.KnowledgeBase, path: 'KnowledgeBase' };
    }

    return (
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link 
                to={createPageUrl('Website')} 
                className="hover:text-[#002D62] transition-colors flex items-center gap-1"
            >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{names.Website}</span>
            </Link>
            
            {parentPage && (
                <>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link 
                        to={createPageUrl(parentPage.path)} 
                        className="hover:text-[#002D62] transition-colors"
                    >
                        {parentPage.name}
                    </Link>
                </>
            )}
            
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-[#002D62]">{pageName}</span>
        </nav>
    );
}