import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ExternalLink, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
    done: 'bg-green-100 text-green-800 border-green-200',
    ongoing: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
};

const CATEGORY_COLORS = {
    'AI Governance': 'bg-purple-100 text-purple-800',
    'Brazil AI Legal': 'bg-green-100 text-green-800',
    'Semiconductors': 'bg-blue-100 text-blue-800',
    'BRICS': 'bg-orange-100 text-orange-800',
    'US Defense': 'bg-red-100 text-red-800',
    'Trade': 'bg-indigo-100 text-indigo-800'
};

export default function TimelineCard({ event, index = 0, lang = 'pt' }) {
    const t = {
        pt: {
            actors: 'Atores',
            jurisdiction: 'Jurisdição',
            sources: 'Fontes',
            linkedArticles: 'Artigos Relacionados',
            viewArticle: 'Ver Artigo',
            statusAsOf: 'Status em'
        },
        en: {
            actors: 'Actors',
            jurisdiction: 'Jurisdiction',
            sources: 'Sources',
            linkedArticles: 'Related Articles',
            viewArticle: 'View Article',
            statusAsOf: 'Status as of'
        }
    }[lang];

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-[#002D62]">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-800'}>
                                    {event.category}
                                </Badge>
                                <Badge className={STATUS_COLORS[event.status]}>
                                    {event.status}
                                </Badge>
                                {event.event_id && (
                                    <Badge variant="outline" className="text-xs">
                                        {event.event_id}
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-[#002D62] mb-2">
                                {event.name}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(event.start_date)}
                                    {event.end_date && ` - ${formatDate(event.end_date)}`}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.jurisdiction}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {event.summary}
                    </p>

                    {event.actors && event.actors.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {t.actors}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {event.actors.map((actor, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                        {actor}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {event.sources && event.sources.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                {t.sources}:
                            </p>
                            <div className="space-y-1">
                                {event.sources.slice(0, 3).map((source, idx) => (
                                    <a
                                        key={idx}
                                        href={source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-start gap-1 break-all"
                                    >
                                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-1">{source}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {event.linked_articles && event.linked_articles.length > 0 && (
                        <div className="pt-2 border-t">
                            <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {t.linkedArticles}:
                            </p>
                            <div className="space-y-1">
                                {event.linked_articles.map((articleId, idx) => (
                                    <Link
                                        key={idx}
                                        to={createPageUrl('ArticleView') + `?id=${articleId}`}
                                        className="text-xs text-[#002D62] hover:text-[#8B1538] flex items-center gap-1"
                                    >
                                        <FileText className="w-3 h-3" />
                                        {t.viewArticle}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {event.status_as_of && (
                        <div className="text-xs text-gray-500 pt-2 border-t">
                            {t.statusAsOf}: {formatDate(event.status_as_of)}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}