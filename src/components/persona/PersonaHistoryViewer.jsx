import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, TrendingUp, MessageSquare, Star, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PersonaHistoryViewer({ personaProfileId, lang = 'pt' }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInteraction, setSelectedInteraction] = useState(null);

    const t = {
        pt: {
            title: 'Histórico de Interações',
            noHistory: 'Nenhum histórico ainda',
            topics: 'Tópicos',
            satisfaction: 'Satisfação',
            adaptations: 'Adaptações',
            insights: 'Insights',
            effectiveness: 'Efetividade',
            technicality: 'Tecnicidade',
            tone: 'Tom',
            depth: 'Profundidade'
        },
        en: {
            title: 'Interaction History',
            noHistory: 'No history yet',
            topics: 'Topics',
            satisfaction: 'Satisfaction',
            adaptations: 'Adaptations',
            insights: 'Insights',
            effectiveness: 'Effectiveness',
            technicality: 'Technicality',
            tone: 'Tone',
            depth: 'Depth'
        }
    };

    const text = t[lang];

    useEffect(() => {
        if (personaProfileId) {
            loadHistory();
        }
    }, [personaProfileId]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.PersonaInteractionHistory.filter({
                persona_profile_id: personaProfileId
            });
            setHistory(data.sort((a, b) => 
                new Date(b.interaction_date) - new Date(a.interaction_date)
            ));
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!personaProfileId) return null;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <History className="w-5 h-5" />
                        {text.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {text.noHistory}
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                                {history.map((interaction) => (
                                    <Card
                                        key={interaction.id}
                                        className="hover:border-[#002D62]/30 transition-colors cursor-pointer"
                                        onClick={() => setSelectedInteraction(interaction)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="text-xs text-gray-600">
                                                        {new Date(interaction.interaction_date).toLocaleString()}
                                                    </div>
                                                    {interaction.user_satisfaction && (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="text-xs font-medium">
                                                                {interaction.user_satisfaction}/5
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {interaction.topics_discussed?.length > 0 && (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {interaction.topics_discussed.slice(0, 3).map(topic => (
                                                            <Badge key={topic} variant="secondary" className="text-xs">
                                                                {topic}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {interaction.adaptations_made?.length > 0 && (
                                                    <div className="text-xs text-gray-600">
                                                        <TrendingUp className="w-3 h-3 inline mr-1" />
                                                        {interaction.adaptations_made.length} {text.adaptations.toLowerCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {selectedInteraction && (
                <Dialog open={!!selectedInteraction} onOpenChange={() => setSelectedInteraction(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{text.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600">
                                {new Date(selectedInteraction.interaction_date).toLocaleString()}
                            </div>

                            {selectedInteraction.topics_discussed?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{text.topics}:</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedInteraction.topics_discussed.map(topic => (
                                            <Badge key={topic} variant="secondary">{topic}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedInteraction.adaptations_made?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{text.adaptations}:</h4>
                                    <div className="space-y-2">
                                        {selectedInteraction.adaptations_made.map((adaptation, idx) => (
                                            <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                                <span className="font-medium">{adaptation.type}:</span>{' '}
                                                {adaptation.from_value} → {adaptation.to_value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedInteraction.key_insights?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{text.insights}:</h4>
                                    <ul className="space-y-1">
                                        {selectedInteraction.key_insights.map((insight, idx) => (
                                            <li key={idx} className="text-sm text-gray-700">• {insight}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedInteraction.context_effectiveness && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{text.effectiveness}:</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{text.technicality}:</span>
                                            <span className="font-medium">
                                                {Math.round(selectedInteraction.context_effectiveness.technicality_match * 100)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{text.tone}:</span>
                                            <span className="font-medium">
                                                {Math.round(selectedInteraction.context_effectiveness.tone_match * 100)}%
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span>{text.depth}:</span>
                                            <span className="font-medium">
                                                {Math.round(selectedInteraction.context_effectiveness.depth_match * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}