import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Lightbulb, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const ContextualHelp = ({ elementId, content, lang = 'pt', role = 'general' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        const shown = localStorage.getItem(`help_shown_${elementId}_${role}`);
        if (!shown) {
            const timer = setTimeout(() => {
                showHelp();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [elementId, role]);

    const showHelp = () => {
        const element = document.getElementById(elementId);
        if (!element) return;

        const rect = element.getBoundingClientRect();
        setPosition({
            top: rect.bottom + window.scrollY + 10,
            left: rect.left + window.scrollX
        });
        setIsVisible(true);
        setHasShown(true);
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem(`help_shown_${elementId}_${role}`, 'true');
    };

    if (!isVisible || !content) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed z-50"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
            >
                <Card className="w-80 shadow-2xl border-2 border-blue-400">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-blue-500" />
                                <span className="font-semibold text-sm text-gray-900">
                                    {lang === 'pt' ? 'Dica' : 'Tip'}
                                </span>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {content}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};

export default ContextualHelp;