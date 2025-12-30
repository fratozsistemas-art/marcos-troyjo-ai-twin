import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe, Moon, Sun, Sparkles } from 'lucide-react';
import NavigationMenu from '@/components/navigation/NavigationMenu';
import TroyjoLogo from '@/components/branding/TroyjoLogo';
import TrialBanner from '@/components/subscription/TrialBanner';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import KeyboardShortcuts from '@/components/navigation/KeyboardShortcuts';
import AppAssistant from '@/components/assistant/AppAssistant';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import WorkflowGuide from '@/components/workflow/WorkflowGuide';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { toast } from 'sonner';

export default function Layout({ children, currentPageName }) {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('troyjo_theme') === 'dark');
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
        setCheckingOnboarding(false);
    }, []);

    const checkAuth = async () => {
        try {
            const authenticated = await base44.auth.isAuthenticated();
            setIsAuthenticated(authenticated);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('troyjo_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('troyjo_theme', 'light');
        }
    }, [darkMode]);



    const toggleLanguage = () => {
        const newLang = lang === 'pt' ? 'en' : 'pt';
        setLang(newLang);
        localStorage.setItem('troyjo_lang', newLang);
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-300">
            <TrialBanner />
            <div className="flex flex-1">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && isAuthenticated && (
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
                {sidebarOpen && isAuthenticated && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed left-0 top-0 bottom-0 w-70 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 lg:hidden shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#06101F] to-[#06101F] dark:from-gray-800 dark:to-gray-900">
                            <div className="flex items-center gap-3">
                                <a href={createPageUrl('PublicHome')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <motion.div 
                                            className="w-10 h-10 rounded-xl overflow-hidden shadow-md"
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: 'spring', stiffness: 400 }}
                                        >
                                            <img 
                                                src={`${import.meta.env.VITE_STORAGE_URL || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public'}/base44-prod/public/69335f9184b5ddfb48500fe5/7b4794e58_CapturadeTela2025-12-23s93044PM.png`}
                                                alt="MT Logo"
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    <span className="font-bold text-gray-900 dark:text-white text-lg">Troyjo Twin</span>
                                </a>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(false)}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <NavigationMenu lang={lang} />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            {isAuthenticated && (
            <aside className="hidden lg:block w-70 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-lg">
                <div className="sticky top-0">
                    <a href={createPageUrl('PublicHome')} className="block">
                    <motion.div 
                    className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    >
                    <motion.div 
                        className="w-12 h-12 rounded-xl overflow-hidden shadow-md"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                    >
                        <img 
                            src={`${import.meta.env.VITE_STORAGE_URL || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public'}/base44-prod/public/69335f9184b5ddfb48500fe5/7b4794e58_CapturadeTela2025-12-23s93044PM.png`}
                            alt="MT Logo"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                            <div>
                                <span className="font-bold text-gray-900 dark:text-white text-base block">Troyjo Twin</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Digital Intelligence</span>
                            </div>
                        </motion.div>
                    </a>
                    <NavigationMenu lang={lang} />
                </div>
            </aside>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                {currentPageName !== 'PublicHome' && (
                <motion.header 
                    className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm"
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    <div className="px-6 py-4 flex items-center justify-between lg:justify-end">
                        {isAuthenticated && (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                            >
                                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            </Button>
                        </motion.div>
                        )}

                        <div className="flex items-center gap-3">
                            <NotificationCenter lang={lang} />

                            <motion.button
                                onClick={() => setDarkMode(!darkMode)}
                                className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <AnimatePresence mode="wait">
                                    {darkMode ? (
                                        <motion.div
                                            key="sun"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Sun className="w-5 h-5 text-amber-500" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="moon"
                                            initial={{ rotate: 90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: -90, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Moon className="w-5 h-5 text-indigo-600" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            <motion.button
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Globe className="w-4 h-4" />
                                {lang === 'pt' ? 'EN' : 'PT'}
                            </motion.button>
                        </div>
                    </div>
                </motion.header>
                )}

                {/* Page Content */}
                            <main className="flex-1">
                                <motion.div 
                                    className="max-w-7xl mx-auto px-4 md:px-6 py-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Breadcrumbs lang={lang} />
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {children}
                                </motion.div>
                            </main>
            </div>
            </div>
            <KeyboardShortcuts lang={lang} />
            <AppAssistant lang={lang} />
            <WorkflowGuide lang={lang} />
            <Toaster position="top-right" richColors />
            </div>
    );
}