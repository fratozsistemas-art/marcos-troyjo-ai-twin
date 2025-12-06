import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Target, BookOpen } from 'lucide-react';
import { usePersonaAdaptation } from './PersonaAdaptationProvider';

export default function PersonaIndicator({ lang = 'pt' }) {
    const { userProfile } = usePersonaAdaptation();

    const translations = {
        pt: {
            title: 'Adaptação de Persona',
            level: 'Perfil',
            mode: 'Modo',
            technicality: 'Tecnicidade',
            confidence: 'Confiança',
            interactions: 'Interações'
        },
        en: {
            title: 'Persona Adaptation',
            level: 'Profile',
            mode: 'Mode',
            technicality: 'Technicality',
            confidence: 'Confidence',
            interactions: 'Interactions'
        }
    };

    const t = translations[lang];

    const modeIcons = {
        professor: BookOpen,
        tecnico: Brain,
        consultor: Target,
        academico: BookOpen,
        diplomatico: Brain
    };

    const ModeIcon = modeIcons[userProfile.mode] || Brain;

    const levelColors = {
        leigo: 'bg-blue-100 text-blue-800',
        intermediario: 'bg-green-100 text-green-800',
        tecnico: 'bg-purple-100 text-purple-800',
        gestor: 'bg-orange-100 text-orange-800',
        academico: 'bg-indigo-100 text-indigo-800',
        institucional: 'bg-amber-100 text-amber-800'
    };

    if (userProfile.interactions === 0) {
        return null;
    }

    return (
        <Card className="border-[#002D62]/20 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ModeIcon className="w-4 h-4 text-[#002D62]" />
                        <span className="text-sm font-semibold text-[#002D62]">{t.title}</span>
                    </div>
                    <Badge className={levelColors[userProfile.level]}>
                        {userProfile.level}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <span className="text-gray-500">{t.mode}:</span>
                        <p className="font-medium text-gray-900 capitalize">{userProfile.mode}</p>
                    </div>
                    
                    <div>
                        <span className="text-gray-500">{t.interactions}:</span>
                        <p className="font-medium text-gray-900">{userProfile.interactions}</p>
                    </div>

                    <div className="col-span-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-500">{t.technicality}:</span>
                            <span className="font-medium text-gray-900">{userProfile.technicality}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                                className="bg-[#00654A] h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${userProfile.technicality}%` }}
                            />
                        </div>
                    </div>

                    <div className="col-span-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-500">{t.confidence}:</span>
                            <span className="font-medium text-gray-900">{Math.round(userProfile.confidence)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                                className="bg-[#B8860B] h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${userProfile.confidence}%` }}
                            />
                        </div>
                    </div>
                </div>

                {userProfile.keywords && userProfile.keywords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex flex-wrap gap-1">
                            {userProfile.keywords.map((keyword, idx) => (
                                <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className="text-xs border-[#002D62]/30"
                                >
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}