import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import NavigationMenu from '@/components/navigation/NavigationMenu';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';

export default function Layout({ children, currentPageName }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    const toggleLanguage = () => {
        const newLang = lang === 'pt' ? 'en' : 'pt';
        setLang(newLang);
        localStorage.setItem('troyjo_lang', newLang);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'tween', duration: 0.2 }}
                        className="fixed left-0 top-0 bottom-0 w-70 bg-white border-r border-gray-200 z-50 lg:hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                    <span className="text-white font-semibold text-xs">MT</span>
                                </div>
                                <span className="font-semibold text-[#002D62]">Troyjo Twin</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <NavigationMenu lang={lang} />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-70 bg-white border-r border-gray-200 flex-shrink-0">
                <div className="sticky top-0">
                    <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">MT</span>
                        </div>
                        <span className="font-semibold text-[#002D62]">Troyjo Twin</span>
                    </div>
                    <NavigationMenu lang={lang} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-[#333F48]"
                    >
                        <Globe className="w-4 h-4" />
                        {lang === 'pt' ? 'EN' : 'PT'}
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}