import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import { motion } from 'framer-motion';

const typeLabels = {
    pt: {
        opiniao: 'Opinião',
        relatorio: 'Relatório',
        policy_paper: 'Policy Paper',
        revista: 'Revista',
        jornal: 'Jornal',
        linkedin: 'LinkedIn'
    },
    en: {
        opiniao: 'Opinion',
        relatorio: 'Report',
        policy_paper: 'Policy Paper',
        revista: 'Magazine',
        jornal: 'Newspaper',
        linkedin: 'LinkedIn'
    }
};

const typeColors = {
    opiniao: 'bg-blue-100 text-blue-800 border-blue-200',
    relatorio: 'bg-green-100 text-green-800 border-green-200',
    policy_paper: 'bg-purple-100 text-purple-800 border-purple-200',
    revista: 'bg-orange-100 text-orange-800 border-orange-200',
    jornal: 'bg-red-100 text-red-800 border-red-200',
    linkedin: 'bg-cyan-100 text-cyan-800 border-cyan-200'
};

export default function ArticleCard({ article, lang = 'pt', index = 0 }) {
    const t = typeLabels[lang];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Link to={createPageUrl('ArticleView') + `?id=${article.id}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                            <Badge className={`${typeColors[article.type]} border`}>
                                {t[article.type]}
                            </Badge>
                            {article.featured && (
                                <Badge className="bg-[#B8860B] text-white">
                                    {lang === 'pt' ? 'Destaque' : 'Featured'}
                                </Badge>
                            )}
                            {article.quality_tier && (
                                <QualityBadge tier={article.quality_tier} lang={lang} size="sm" />
                            )}
                        </div>
                        <CardTitle className="text-xl group-hover:text-[#002D62] transition-colors">
                            {article.title}
                        </CardTitle>
                        {article.subtitle && (
                            <p className="text-sm text-[#333F48]/70 mt-1">{article.subtitle}</p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-[#333F48] leading-relaxed mb-4 line-clamp-3">
                            {article.summary}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#333F48]/60">
                            {article.publication_date && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(article.publication_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                </div>
                            )}
                            {article.reading_time && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {article.reading_time} min
                                </div>
                            )}
                            {article.views > 0 && (
                                <div className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {article.views}
                                </div>
                            )}
                        </div>

                        {article.authors && article.authors.length > 0 && (
                            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                                <User className="w-3 h-3 text-[#333F48]/60" />
                                <span className="text-xs text-[#333F48]/60">
                                    {article.authors.join(', ')}
                                </span>
                            </div>
                        )}

                        {article.persona_target && article.persona_target.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {article.persona_target.slice(0, 3).map((persona, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {persona}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}