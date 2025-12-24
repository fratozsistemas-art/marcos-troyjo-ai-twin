import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, BookOpen, FileText, Lightbulb, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { toast } from 'sonner';

export default function RecentlyViewed({ lang = 'pt', limit = 10 }) {
    const [recentItems, setRecentItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const t = {
        pt: {
            title: 'Visualizado Recentemente',
            noItems: 'Nenhum item visualizado ainda',
            book: 'Livro',
            publication: 'Publicação',
            neologism: 'Neologismo',
            concept: 'Conceito',
            article: 'Artigo',
            conversation: 'Conversa',
            fact: 'Fato'
        },
        en: {
            title: 'Recently Viewed',
            noItems: 'No items viewed yet',
            book: 'Book',
            publication: 'Publication',
            neologism: 'Neologism',
            concept: 'Concept',
            article: 'Article',
            conversation: 'Conversation',
            fact: 'Fact'
        }
    };

    const text = t[lang];

    const contentTypeIcons = {
        book: BookOpen,
        publication: FileText,
        article: FileText,
        neologism: Lightbulb,
        concept: Lightbulb,
        conversation: MessageSquare,
        fact: FileText
    };

    const contentTypeColors = {
        book: 'border-[#D4AF37] bg-[#D4AF37]/5',
        publication: 'border-[#00654A] bg-[#00654A]/5',
        article: 'border-[#00654A] bg-[#00654A]/5',
        neologism: 'border-[#8B1538] bg-[#8B1538]/5',
        concept: 'border-[#8B1538] bg-[#8B1538]/5',
        conversation: 'border-[#002D62] bg-[#002D62]/5',
        fact: 'border-[#6B6B6B] bg-[#6B6B6B]/5'
    };

    useEffect(() => {
        loadRecentViews();
    }, []);

    const loadRecentViews = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            if (!user) return;

            const interactions = await base44.entities.UserInteraction.filter({
                user_email: user.email,
                interaction_type: 'view'
            }, '-created_date', limit * 2);

            // Deduplicate by content_id, keeping most recent
            const uniqueItems = [];
            const seenIds = new Set();

            for (const item of interactions) {
                if (!seenIds.has(item.content_id)) {
                    seenIds.add(item.content_id);
                    uniqueItems.push(item);
                    if (uniqueItems.length >= limit) break;
                }
            }

            setRecentItems(uniqueItems);
        } catch (error) {
            console.error('Error loading recent views:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-[#002D62]" />
                    {text.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {recentItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">{text.noItems}</p>
                    </div>
                ) : (
                    <ScrollArea className="h-80">
                        <div className="space-y-2">
                            {recentItems.map((item, idx) => {
                                const Icon = contentTypeIcons[item.content_type] || FileText;
                                const colorClass = contentTypeColors[item.content_type] || 'border-gray-300 bg-gray-50';
                                
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`p-3 border rounded-lg ${colorClass} hover:shadow-md transition-all`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                <Icon className="w-4 h-4 text-[#002D62]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-medium text-sm text-[#002D62] truncate">
                                                    {item.content_title}
                                                </h5>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {text[item.content_type] || item.content_type}
                                                    </Badge>
                                                    <span className="text-xs text-gray-500">
                                                        {moment(item.created_date).fromNow()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}