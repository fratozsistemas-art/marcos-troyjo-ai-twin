import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const typeLabels = {
    pt: {
        artigo_longo: 'Artigo Longo',
        relatorio: 'Relatório',
        policy_paper: 'Policy Paper',
        post_linkedin: 'Post LinkedIn',
        nota_curta: 'Nota Curta',
        grafico: 'Gráfico',
        mini_artigo: 'Mini Artigo',
        thread: 'Thread',
        video: 'Vídeo',
        podcast: 'Podcast'
    },
    en: {
        artigo_longo: 'Long Article',
        relatorio: 'Report',
        policy_paper: 'Policy Paper',
        post_linkedin: 'LinkedIn Post',
        nota_curta: 'Short Note',
        grafico: 'Chart',
        mini_artigo: 'Mini Article',
        thread: 'Thread',
        video: 'Video',
        podcast: 'Podcast'
    }
};

const statusLabels = {
    pt: {
        backlog: 'Backlog',
        em_preparacao: 'Em Preparação',
        agendado: 'Agendado',
        publicado: 'Publicado',
        cancelado: 'Cancelado'
    },
    en: {
        backlog: 'Backlog',
        em_preparacao: 'In Progress',
        agendado: 'Scheduled',
        publicado: 'Published',
        cancelado: 'Cancelled'
    }
};

const statusColors = {
    backlog: 'bg-gray-100 text-gray-700',
    em_preparacao: 'bg-blue-100 text-blue-700',
    agendado: 'bg-green-100 text-green-700',
    publicado: 'bg-purple-100 text-purple-700',
    cancelado: 'bg-red-100 text-red-700'
};

const priorityColors = {
    baixa: 'border-gray-200',
    media: 'border-blue-200',
    alta: 'border-orange-200',
    critica: 'border-red-400'
};

const themeIcons = {
    brics: '🌐',
    cabos_submarinos: '🔌',
    ia_militar: '🤖',
    energia: '⚡',
    agro: '🌾',
    bioeconomia: '🌱',
    integracao: '🔗'
};

export default function EditorialCard({ item, lang = 'pt', index = 0 }) {
    const tType = typeLabels[lang];
    const tStatus = statusLabels[lang];
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className={`hover:shadow-md transition-all border-l-4 ${priorityColors[item.priority]}`}>
                <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {item.theme_axis && (
                                    <span className="text-lg">{themeIcons[item.theme_axis]}</span>
                                )}
                                <h4 className="font-semibold text-[#002D62] text-sm line-clamp-1">
                                    {item.title}
                                </h4>
                            </div>
                            {item.summary && (
                                <p className="text-xs text-[#333F48]/70 line-clamp-2 mb-2">
                                    {item.summary}
                                </p>
                            )}
                        </div>
                        <Badge className={statusColors[item.status]}>
                            {tStatus[item.status]}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="gap-1">
                            {tType[item.type]}
                        </Badge>
                        
                        {item.scheduled_date && (
                            <div className="flex items-center gap-1 text-[#333F48]/60">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.scheduled_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                                    day: '2-digit',
                                    month: 'short'
                                })}
                            </div>
                        )}
                        
                        {item.day_of_week && (
                            <Badge variant="secondary" className="text-xs">
                                {item.day_of_week}
                            </Badge>
                        )}

                        {item.estimated_hours && (
                            <div className="flex items-center gap-1 text-[#333F48]/60">
                                <Clock className="w-3 h-3" />
                                {item.estimated_hours}h
                            </div>
                        )}
                    </div>

                    {item.persona_target && item.persona_target.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                            <Target className="w-3 h-3 text-[#333F48]/40" />
                            <div className="flex flex-wrap gap-1">
                                {item.persona_target.slice(0, 2).map((persona, idx) => (
                                    <span key={idx} className="text-xs text-[#333F48]/60">
                                        {persona}{idx < Math.min(item.persona_target.length, 2) - 1 ? ',' : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}