import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import NavigationMenu from '@/components/navigation/NavigationMenu';
import TrialBanner from '@/components/subscription/TrialBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { toast } from 'sonner';

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
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
            <TrialBanner />
            <div className="flex flex-1">
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

                {/* Beta Watermark */}
                                <div className="fixed top-20 right-4 z-50 pointer-events-none">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg blur-sm opacity-75"></div>
                                        <div className="relative bg-white rounded-lg px-3 py-1.5 border-2 border-transparent" style={{
                                            backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
                                            backgroundOrigin: 'border-box',
                                            backgroundClip: 'padding-box, border-box'
                                        }}>
                                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-sm tracking-wider">
                                                BETA
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Page Content */}
                                <main className="flex-1">
                                    {children}
                                </main>
            </div>
            </div>
            <Toaster position="top-right" richColors />
            </div>
    );
}