import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, BookOpen, Target, GraduationCap, Users, TrendingUp } from 'lucide-react';

export default function PersonaAnalytics({ lang = 'pt' }) {
    const [analytics, setAnalytics] = useState({
        personaDistribution: {},
        topTopics: [],
        totalInteractions: 0
    });
    const [loading, setLoading] = useState(true);

    const t = {
        pt: {
            title: 'Análise de Inteligência',
            personaTitle: 'Distribuição de Personas',
            topicsTitle: 'Tópicos Mais Discutidos',
            interactions: 'Interações Totais',
            noData: 'Dados insuficientes ainda'
        },
        en: {
            title: 'Intelligence Analytics',
            personaTitle: 'Persona Distribution',
            topicsTitle: 'Most Discussed Topics',
            interactions: 'Total Interactions',
            noData: 'Insufficient data yet'
        }
    }[lang];

    const personaInfo = {
        professor: { icon: BookOpen, label: lang === 'pt' ? 'Professor' : 'Professor', color: 'bg-blue-100 text-blue-800' },
        tecnico: { icon: Brain, label: lang === 'pt' ? 'Técnico' : 'Technical', color: 'bg-purple-100 text-purple-800' },
        consultor: { icon: Target, label: lang === 'pt' ? 'Consultor' : 'Consultant', color: 'bg-orange-100 text-orange-800' },
        academico: { icon: GraduationCap, label: lang === 'pt' ? 'Acadêmico' : 'Academic', color: 'bg-indigo-100 text-indigo-800' },
        diplomatico: { icon: Users, label: lang === 'pt' ? 'Diplomático' : 'Diplomatic', color: 'bg-amber-100 text-amber-800' }
    };

    const topicLabels = {
        pt: {
            brics: 'BRICS', china: 'China', trade: 'Comércio', 
            competitiveness: 'Competitividade', energy: 'Energia',
            agriculture: 'Agricultura', diplomacy: 'Diplomacia',
            finance: 'Finanças', development: 'Desenvolvimento'
        },
        en: {
            brics: 'BRICS', china: 'China', trade: 'Trade',
            competitiveness: 'Competitiveness', energy: 'Energy',
            agriculture: 'Agriculture', diplomacy: 'Diplomacy',
            finance: 'Finance', development: 'Development'
        }
    }[lang];

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            
            if (profiles.length > 0) {
                const profile = profiles[0];
                const topicHistory = profile.topic_history || [];
                
                // Get top 5 topics
                const sortedTopics = [...topicHistory]
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                
                setAnalytics({
                    topTopics: sortedTopics,
                    totalInteractions: topicHistory.reduce((sum, t) => sum + t.count, 0)
                });
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <TrendingUp className="w-5 h-5" />
                    {t.title}
                </CardTitle>
                <CardDescription>
                    {t.interactions}: {analytics.totalInteractions}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Top Topics */}
                <div>
                    <h4 className="text-sm font-semibold text-[#333F48] mb-3">{t.topicsTitle}</h4>
                    {analytics.topTopics.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">{t.noData}</p>
                    ) : (
                        <div className="space-y-2">
                            {analytics.topTopics.map((topic, idx) => {
                                const percentage = analytics.totalInteractions > 0 
                                    ? Math.round((topic.count / analytics.totalInteractions) * 100)
                                    : 0;
                                
                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-[#333F48]">
                                                    {topicLabels[topic.topic] || topic.topic}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {topic.count} {lang === 'pt' ? 'menções' : 'mentions'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-[#002D62] h-2 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}