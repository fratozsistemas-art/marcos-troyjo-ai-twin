import React from 'react';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const translations = {
    pt: {
        title: 'AEGIS Protocol',
        status: 'Proteção IP Ativa',
        description: 'Sistema de proteção de propriedade intelectual ativo',
        features: [
            'Arquitetura interna protegida',
            'Metodologia confidencial',
            'Protocolos proprietários seguros'
        ]
    },
    en: {
        title: 'AEGIS Protocol',
        status: 'IP Protection Active',
        description: 'Intellectual property protection system active',
        features: [
            'Internal architecture protected',
            'Confidential methodology',
            'Proprietary protocols secured'
        ]
    }
};

export default function AegisIndicator({ lang = 'pt', compact = false }) {
    const t = translations[lang];

    if (compact) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge 
                            variant="outline" 
                            className="gap-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-900 font-semibold cursor-help"
                        >
                            <Shield className="w-3 h-3" />
                            AEGIS
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="space-y-1">
                            <p className="font-semibold">{t.status}</p>
                            <p className="text-xs text-gray-600">{t.description}</p>
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-blue-900">{t.title}</h4>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-blue-800 mb-3">{t.description}</p>
                    <div className="space-y-1.5">
                        {t.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-blue-700">
                                <Lock className="w-3 h-3" />
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}