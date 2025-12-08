import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TopicTracker({ lang = 'pt' }) {
    const [profile, setProfile] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const translations = {
        pt: {
            title: 'Tópicos Frequentes',
            suggestions: 'Sugestões Baseadas no Seu Perfil',
            explore: 'Explorar',
            lastDiscussed: 'Última discussão'
        },
        en: {
            title: 'Frequent Topics',
            suggestions: 'Suggestions Based on Your Profile',
            explore: 'Explore',
            lastDiscussed: 'Last discussed'
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({
                user_email: user.email
            });

            if (profiles.length > 0) {
                setProfile(profiles[0]);
                generateSuggestions(profiles[0]);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSuggestions = (userProfile) => {
        const { interests, topic_history } = userProfile || {};
        const allSuggestions = [];

        // Generate suggestions based on interests
        if (interests?.industries?.length > 0) {
            interests.industries.forEach(industry => {
                allSuggestions.push({
                    text: lang === 'pt' 
                        ? `Como ${industry} se posiciona nas cadeias globais de valor?`
                        : `How does ${industry} position itself in global value chains?`,
                    category: 'industry',
                    relevance: 'high'
                });
            });
        }

        if (interests?.regions?.length > 0) {
            interests.regions.forEach(region => {
                allSuggestions.push({
                    text: lang === 'pt'
                        ? `Qual o papel de ${region} na reconfiguração geoeconômica atual?`
                        : `What is ${region}'s role in the current geoeconomic reconfiguration?`,
                    category: 'region',
                    relevance: 'high'
                });
            });
        }

        if (interests?.economic_theories?.length > 0) {
            interests.economic_theories.forEach(theory => {
                allSuggestions.push({
                    text: lang === 'pt'
                        ? `Como ${theory} se aplica ao contexto brasileiro atual?`
                        : `How does ${theory} apply to Brazil's current context?`,
                    category: 'theory',
                    relevance: 'medium'
                });
            });
        }

        // Add suggestions based on frequent topics
        if (topic_history?.length > 0) {
            const topTopics = [...topic_history]
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

            topTopics.forEach(topic => {
                allSuggestions.push({
                    text: lang === 'pt'
                        ? `Novidades sobre ${topic.topic} desde nossa última conversa`
                        : `Updates on ${topic.topic} since our last conversation`,
                    category: 'follow-up',
                    relevance: 'high'
                });
            });
        }

        // Shuffle and limit
        const shuffled = allSuggestions.sort(() => Math.random() - 0.5);
        setSuggestions(shuffled.slice(0, 5));
    };

    const handleSuggestionClick = (suggestion) => {
        // Navigate to consultation with pre-filled prompt
        window.location.href = `/consultation?prompt=${encodeURIComponent(suggestion.text)}`;
    };

    if (loading || !profile) {
        return null;
    }

    const topTopics = profile.topic_history
        ?.sort((a, b) => b.count - a.count)
        .slice(0, 5) || [];

    if (topTopics.length === 0 && suggestions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Frequent Topics */}
            {topTopics.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#002D62] text-base">
                            <TrendingUp className="w-4 h-4" />
                            {t.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {topTopics.map((topic, index) => (
                                <motion.div
                                    key={topic.topic}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#002D62]/20 hover:bg-gray-50 transition-all"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-[#333F48]">{topic.topic}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {topic.count} {lang === 'pt' ? 'conversas' : 'conversations'} • 
                                            {t.lastDiscussed}: {new Date(topic.last_discussed).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge className="bg-[#00654A]/10 text-[#00654A]">
                                        {topic.count}
                                    </Badge>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content Suggestions */}
            {suggestions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#002D62] text-base">
                            <Sparkles className="w-4 h-4" />
                            {t.suggestions}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-[#002D62]/30 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm text-[#333F48] group-hover:text-[#002D62] transition-colors">
                                            {suggestion.text}
                                        </p>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#002D62] flex-shrink-0 mt-0.5 transition-colors" />
                                    </div>
                                    <Badge 
                                        variant="outline" 
                                        className="mt-2 text-xs"
                                    >
                                        {suggestion.category}
                                    </Badge>
                                </motion.button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}