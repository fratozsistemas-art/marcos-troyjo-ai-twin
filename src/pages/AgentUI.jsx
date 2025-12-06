import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentProvider } from '@/components/agent/AgentProvider';
import AgentControl from '@/components/agent/AgentControl';
import { useNavigate } from 'react-router-dom';

const translations = {
    pt: {
        back: "Voltar",
        title: "Agente de Interface",
        subtitle: "Controle e automação de tarefas na interface"
    },
    en: {
        back: "Back",
        title: "UI Agent",
        subtitle: "Interface control and task automation"
    }
};

export default function AgentUI() {
    const navigate = useNavigate();
    const [lang] = React.useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const t = translations[lang];

    return (
        <AgentProvider navigate={navigate}>
            <div className="min-h-screen bg-[#FAFAFA]">
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.back}</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{t.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{t.subtitle}</p>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <AgentControl lang={lang} />
                </main>
            </div>
        </AgentProvider>
    );
}