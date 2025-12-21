import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Command } from 'lucide-react';

const translations = {
    pt: {
        title: 'Atalhos de Teclado',
        description: 'Use estes atalhos para navegar rapidamente',
        navigation: 'Navegação',
        actions: 'Ações',
        home: 'Ir para Início',
        dashboard: 'Ir para Painel',
        analytics: 'Ir para Analytics',
        consultation: 'Nova Consulta',
        knowledge: 'Base de Conhecimento',
        shortcuts: 'Ver Atalhos',
        close: 'Fechar'
    },
    en: {
        title: 'Keyboard Shortcuts',
        description: 'Use these shortcuts to navigate quickly',
        navigation: 'Navigation',
        actions: 'Actions',
        home: 'Go to Home',
        dashboard: 'Go to Dashboard',
        analytics: 'Go to Analytics',
        consultation: 'New Consultation',
        knowledge: 'Knowledge Base',
        shortcuts: 'View Shortcuts',
        close: 'Close'
    }
};

export default function KeyboardShortcuts({ lang = 'pt' }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const t = translations[lang];

    const shortcuts = [
        { key: 'g h', action: 'home', description: t.home, path: 'Website' },
        { key: 'g d', action: 'dashboard', description: t.dashboard, path: 'Dashboard' },
        { key: 'g a', action: 'analytics', description: t.analytics, path: 'AnalyticsDashboard' },
        { key: 'g c', action: 'consultation', description: t.consultation, path: 'Consultation' },
        { key: 'g k', action: 'knowledge', description: t.knowledge, path: 'KnowledgeBase' },
        { key: '?', action: 'help', description: t.shortcuts, handler: () => setOpen(true) }
    ];

    useEffect(() => {
        let keySequence = '';
        let sequenceTimer = null;

        const handleKeyDown = (e) => {
            // Ignore if typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Handle single key shortcuts
            if (e.key === '?' && !e.shiftKey) {
                e.preventDefault();
                setOpen(true);
                return;
            }

            // Handle Escape to close
            if (e.key === 'Escape') {
                setOpen(false);
                return;
            }

            // Build key sequence for two-key shortcuts (like g+h)
            keySequence += e.key.toLowerCase();

            // Clear sequence after 1 second
            clearTimeout(sequenceTimer);
            sequenceTimer = setTimeout(() => {
                keySequence = '';
            }, 1000);

            // Check for matches
            const shortcut = shortcuts.find(s => s.key === keySequence);
            if (shortcut) {
                e.preventDefault();
                keySequence = '';
                
                if (shortcut.handler) {
                    shortcut.handler();
                } else if (shortcut.path) {
                    navigate(createPageUrl(shortcut.path));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(sequenceTimer);
        };
    }, [navigate, shortcuts]);

    const KeyBadge = ({ keys }) => (
        <div className="flex items-center gap-1">
            {keys.split(' ').map((key, idx) => (
                <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-gray-400 text-xs">então</span>}
                    <Badge variant="outline" className="px-2 py-1 font-mono text-xs">
                        {key}
                    </Badge>
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <>
            {/* Floating shortcut hint */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-4 right-4 bg-white border-2 border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-all z-50 group"
                title={t.shortcuts}
            >
                <Command className="w-5 h-5 text-[#002D62]" />
                <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {t.shortcuts} (?)
                </span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Command className="w-5 h-5" />
                            {t.title}
                        </DialogTitle>
                        <DialogDescription>{t.description}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-3">{t.navigation}</h4>
                            <div className="space-y-2">
                                {shortcuts.filter(s => s.path).map((shortcut) => (
                                    <div key={shortcut.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                                        <span className="text-sm text-gray-700">{shortcut.description}</span>
                                        <KeyBadge keys={shortcut.key} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-3">{t.actions}</h4>
                            <div className="space-y-2">
                                {shortcuts.filter(s => !s.path).map((shortcut) => (
                                    <div key={shortcut.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                                        <span className="text-sm text-gray-700">{shortcut.description}</span>
                                        <KeyBadge keys={shortcut.key} />
                                    </div>
                                ))}
                                <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                                    <span className="text-sm text-gray-700">{t.close}</span>
                                    <Badge variant="outline" className="px-2 py-1 font-mono text-xs">Esc</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}