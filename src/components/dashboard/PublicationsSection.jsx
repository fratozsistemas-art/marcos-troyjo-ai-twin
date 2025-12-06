import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle, Loader2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicationsSection({ lang = 'pt' }) {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);

    const translations = {
        pt: {
            title: 'Artigos & Entrevistas',
            description: 'Publicações recentes organizadas por tema',
            articles: 'Artigos',
            interviews: 'Entrevistas',
            all: 'Todos',
            loading: 'Carregando...',
            noData: 'Nenhuma publicação encontrada',
            viewMore: 'Ver mais'
        },
        en: {
            title: 'Articles & Interviews',
            description: 'Recent publications organized by topic',
            articles: 'Articles',
            interviews: 'Interviews',
            all: 'All',
            loading: 'Loading...',
            noData: 'No publications found',
            viewMore: 'View more'
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadPublications();
    }, []);

    const loadPublications = async () => {
        setLoading(true);
        try {
            const pubs = await base44.entities.Publication.list('-publication_date', 50);
            setPublications(pubs || []);
        } catch (error) {
            console.error('Error loading publications:', error);
            setPublications([]);
        } finally {
            setLoading(false);
        }
    };

    const groupByTopic = (pubs) => {
        const grouped = {};
        pubs.forEach(pub => {
            pub.topics?.forEach(topic => {
                if (!grouped[topic]) grouped[topic] = [];
                grouped[topic].push(pub);
            });
        });
        return grouped;
    };

    const articles = publications.filter(p => p.type === 'article' || p.type === 'essay' || p.type === 'opinion');
    const interviews = publications.filter(p => p.type === 'interview');
    const groupedArticles = groupByTopic(articles);
    const groupedInterviews = groupByTopic(interviews);

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    <span className="ml-2 text-sm">{t.loading}</span>
                </CardContent>
            </Card>
        );
    }

    const renderPublicationsByTopic = (grouped) => {
        const topics = Object.keys(grouped).sort();
        if (topics.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    {t.noData}
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {topics.map((topic, topicIndex) => (
                    <motion.div
                        key={topic}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: topicIndex * 0.1 }}
                    >
                        <div className="mb-3">
                            <h4 className="font-semibold text-[#002D62] mb-1">{topic}</h4>
                            <div className="h-0.5 w-12 bg-[#B8860B]" />
                        </div>
                        <div className="grid gap-3">
                            {grouped[topic].slice(0, 3).map((pub, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border border-gray-100 hover:border-[#002D62]/30 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-sm text-[#333F48] mb-1 line-clamp-2 group-hover:text-[#002D62] transition-colors">
                                                {pub.title}
                                            </h5>
                                            {pub.summary && (
                                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{pub.summary}</p>
                                            )}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {pub.outlet && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {pub.outlet}
                                                    </Badge>
                                                )}
                                                {pub.publication_date && (
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(pub.publication_date).getFullYear()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {pub.url && (
                                            <a
                                                href={pub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ExternalLink className="w-4 h-4 text-[#002D62]" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <FileText className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="all">{t.all}</TabsTrigger>
                        <TabsTrigger value="articles">
                            <FileText className="w-4 h-4 mr-2" />
                            {t.articles}
                        </TabsTrigger>
                        <TabsTrigger value="interviews">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {t.interviews}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="max-h-96 overflow-y-auto">
                        {renderPublicationsByTopic(groupByTopic(publications))}
                    </TabsContent>
                    <TabsContent value="articles" className="max-h-96 overflow-y-auto">
                        {renderPublicationsByTopic(groupedArticles)}
                    </TabsContent>
                    <TabsContent value="interviews" className="max-h-96 overflow-y-auto">
                        {renderPublicationsByTopic(groupedInterviews)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}