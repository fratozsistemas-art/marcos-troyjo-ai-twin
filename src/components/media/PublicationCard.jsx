import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Video, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './VideoPlayer';

export default function PublicationCard({ publication, lang = 'pt' }) {
    const [expanded, setExpanded] = useState(false);

    const t = {
        pt: {
            article: 'Artigo',
            interview: 'Entrevista',
            viewArticle: 'Ver artigo',
            watch: 'Assistir',
            purchase: 'Adquirir',
            readMore: 'Ler mais',
            showLess: 'Mostrar menos',
            watchVideo: 'Assistir Vídeo'
        },
        en: {
            article: 'Article',
            interview: 'Interview',
            viewArticle: 'View article',
            watch: 'Watch',
            purchase: 'Purchase',
            readMore: 'Read more',
            showLess: 'Show less',
            watchVideo: 'Watch Video'
        }
    }[lang];

    return (
        <Card className="hover:shadow-lg hover:border-[#8B1538]/30 transition-all">
            <CardHeader>
                <div className="flex items-start justify-between mb-2">
                    <Badge 
                        variant={publication.type === 'interview' ? 'secondary' : 'default'} 
                        className={publication.type === 'interview' ? '' : 'bg-[#002D62]'}
                    >
                        {publication.type === 'interview' ? t.interview : t.article}
                    </Badge>
                    {publication.publication_date && (
                        <span className="text-sm text-[#6B6B6B]">
                            {new Date(publication.publication_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                    )}
                </div>
                <CardTitle className="text-lg text-[#002D62]">{publication.title}</CardTitle>
                {publication.outlet && (
                    <p className="text-sm text-[#6B6B6B] mt-1">{publication.outlet}</p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {publication.summary && (
                    <p className="text-sm text-[#2D2D2D] leading-relaxed">{publication.summary}</p>
                )}

                {/* Embedded Video */}
                {publication.video_link && (
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className="mb-2 text-[#002D62] hover:text-[#001d42] gap-2"
                        >
                            <Video className="w-4 h-4" />
                            {expanded ? t.showLess : t.watchVideo}
                            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <AnimatePresence>
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <VideoPlayer videoUrl={publication.video_link} title={publication.title} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {/* Article Link - Always show for articles */}
                    {publication.type === 'article' && publication.url && (
                        <a href={publication.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-2 border-[#002D62] text-[#002D62] hover:bg-[#002D62] hover:text-white">
                                <ExternalLink className="w-3 h-3" />
                                {t.viewArticle}
                            </Button>
                        </a>
                    )}
                    
                    {/* Interview/Podcast Links - Prioritize video, fallback to URL */}
                    {publication.type === 'interview' && (
                        <>
                            {publication.video_link ? (
                                !expanded && (
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => setExpanded(true)}
                                        className="gap-2 border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white"
                                    >
                                        <Video className="w-3 h-3" />
                                        {t.watch}
                                    </Button>
                                )
                            ) : publication.url ? (
                                <a href={publication.url} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="gap-2 border-[#8B1538] text-[#8B1538] hover:bg-[#8B1538] hover:text-white">
                                        <ExternalLink className="w-3 h-3" />
                                        {t.watch}
                                    </Button>
                                </a>
                            ) : null}
                        </>
                    )}

                    {/* Purchase Link */}
                    {publication.purchase_link && (
                        <a href={publication.purchase_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="gap-2 bg-[#D4AF37] hover:bg-[#C19B2A] text-[#2D2D2D]">
                                <BookOpen className="w-3 h-3" />
                                {t.purchase}
                            </Button>
                        </a>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}