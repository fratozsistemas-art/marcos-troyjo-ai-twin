import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History as HistoryIcon } from 'lucide-react';
import HistoryViewer from '@/components/history/HistoryViewer';

export default function History() {
    const [lang] = React.useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const navigate = useNavigate();

    const translations = {
        pt: {
            title: 'Histórico de Interações',
            subtitle: 'Revise e gerencie suas interações anteriores com as funções de IA',
            back: 'Voltar'
        },
        en: {
            title: 'Interaction History',
            subtitle: 'Review and manage your previous interactions with AI functions',
            back: 'Back'
        }
    };

    const t = translations[lang];

    const handleReuse = (item) => {
        const routes = {
            metaphors: 'MetaphorsGenerator',
            interview: 'InterviewPrep',
            article: 'ArticleGenerator',
            assessment: 'DocumentAssessment'
        };
        
        const route = routes[item.function_type];
        if (route) {
            navigate(createPageUrl(route), { state: { reuseData: item } });
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                {t.back}
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{t.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{t.subtitle}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <HistoryViewer lang={lang} onReuse={handleReuse} />
            </main>
        </div>
    );
}