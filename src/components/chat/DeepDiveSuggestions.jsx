import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeepDiveSuggestions({ suggestions, onSelect, lang = 'pt' }) {
    if (!suggestions || suggestions.length === 0) return null;

    const title = lang === 'pt' ? 'Explorar mais:' : 'Explore further:';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3"
        >
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span className="text-xs font-medium text-[#333F48]/60">{title}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                    <Button
                        key={index}
                        onClick={() => onSelect(suggestion)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-2 px-3 border-[#002D62]/20 hover:border-[#002D62] hover:bg-[#002D62]/5 text-[#002D62] group transition-all"
                    >
                        <span>{suggestion}</span>
                        <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                ))}
            </div>
        </motion.div>
    );
}