import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DocumentChat from '@/components/chat/DocumentChat';

export default function DocumentChatPage() {
    const [lang] = React.useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    const translations = {
        pt: {
            title: 'Chat com Documentos',
            subtitle: 'Converse com a IA usando documentos como contexto',
            back: 'Voltar'
        },
        en: {
            title: 'Document Chat',
            subtitle: 'Chat with AI using documents as context',
            back: 'Back'
        }
    };

    const t = translations[lang];

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
                <DocumentChat lang={lang} />
            </main>
        </div>
    );
}