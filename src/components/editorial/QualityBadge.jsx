import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, CheckCircle, Stamp } from 'lucide-react';

const TIER_CONFIG = {
    ai_generated: {
        pt: 'Gerado por IA',
        en: 'AI-Generated',
        icon: Bot,
        className: 'bg-gray-100 text-gray-700 border-gray-300'
    },
    curator_approved: {
        pt: 'Verificado por Curador',
        en: 'Human-Verified',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-300'
    },
    troyjo_certified: {
        pt: '© Certificado Troyjo',
        en: '© Troyjo Certified',
        icon: Stamp,
        className: 'bg-[#B8860B] text-white border-[#B8860B]'
    }
};

export default function QualityBadge({ tier, lang = 'pt', size = 'default' }) {
    const config = TIER_CONFIG[tier];
    if (!config) return null;

    const Icon = config.icon;
    const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

    return (
        <Badge className={`${config.className} ${sizeClass} gap-1.5 font-semibold border`}>
            <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
            {config[lang]}
        </Badge>
    );
}