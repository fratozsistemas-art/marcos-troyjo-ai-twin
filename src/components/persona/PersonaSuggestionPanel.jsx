import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Check, X, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonaSuggestionPanel({ lang = 'pt' }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [suggestions, setSuggestions] = useState(null);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    const t = {
        pt: {
            title: 'Sugestões AI de Persona',
            analyze: 'Analisar & Sugerir',
            analyzing: 'Analisando...',
            newProfiles: 'Novos Perfis Sugeridos',
            improvements: 'Melhorias para Perfis Existentes',
            insights: 'Insights de Comunicação',
            confidence: 'Confiança',
            approve: 'Criar Perfil',
            reject: 'Rejeitar',
            viewDetails: 'Ver Detalhes',
            noData: 'Dados insuficientes para análise'
        },
        en: {
            title: 'AI Persona Suggestions',
            analyze: 'Analyze & Suggest',
            analyzing: 'Analyzing...',
            newProfiles: 'Suggested New Profiles',
            improvements: 'Improvements for Existing Profiles',
            insights: 'Communication Insights',
            confidence: 'Confidence',
            approve: 'Create Profile',
            reject: 'Reject',
            viewDetails: 'View Details',
            noData: 'Insufficient data for analysis'
        }
    };

    const text = t[lang];

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const response = await base44.functions.invoke('analyzeAndSuggestPersona', {});
            
            if (!response.data.has_suggestions) {
                toast.info(response.data.message);
                return;
            }

            setSuggestions(response.data.analysis);
        } catch (error) {
            console.error('Error analyzing:', error);
            toast.error('Erro ao analisar');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleCreateProfile = async (suggestion) => {
        try {
            await base44.entities.PersonaProfile.create({
                name: suggestion.name,
                description: suggestion.description,
                base_mode: suggestion.base_mode,
                instructions: suggestion.instructions,
                core_values: suggestion.core_values,
                stylistic_preferences: suggestion.stylistic_preferences,
                context_triggers: suggestion.context_triggers,
                is_active: true,
                usage_count: 0,
                tags: ['ai-suggested']
            });

            toast.success(`Perfil "${suggestion.name}" criado!`);
            setSuggestions(prev => ({
                ...prev,
                new_profile_suggestions: prev.new_profile_suggestions.filter(
                    s => s.name !== suggestion.name
                )
            }));
        } catch (error) {
            console.error('Error creating profile:', error);
            toast.error('Erro ao criar perfil');
        }
    };

    const handleApplyImprovement = async (improvement) => {
        try {
            const profiles = await base44.entities.PersonaProfile.filter({
                id: improvement.profile_id
            });

            if (profiles.length === 0) return;

            const current = profiles[0];
            const updated = {
                ...current,
                ...improvement.suggested_changes,
                tags: [...(current.tags || []), 'ai-improved']
            };

            await base44.entities.PersonaProfile.update(improvement.profile_id, updated);
            
            toast.success(`Perfil "${improvement.profile_name}" atualizado!`);
            setSuggestions(prev => ({
                ...prev,
                profile_improvements: prev.profile_improvements.filter(
                    i => i.profile_id !== improvement.profile_id
                )
            }));
        } catch (error) {
            console.error('Error applying improvement:', error);
            toast.error('Erro ao aplicar melhoria');
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <Sparkles className="w-5 h-5" />
                        {text.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="w-full"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {text.analyzing}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {text.analyze}
                            </>
                        )}
                    </Button>

                    {suggestions && (
                        <div className="mt-4 space-y-4">
                            {suggestions.new_profile_suggestions?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{text.newProfiles}:</h4>
                                    <div className="space-y-2">
                                        {suggestions.new_profile_suggestions.map((suggestion, idx) => (
                                            <Card key={idx} className="border-blue-200">
                                                <CardContent className="p-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h5 className="font-semibold text-sm">{suggestion.name}</h5>
                                                            <p className="text-xs text-gray-600">{suggestion.description}</p>
                                                        </div>
                                                        <Badge variant="secondary">
                                                            {text.confidence} {Math.round(suggestion.confidence_score * 100)}%
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleCreateProfile(suggestion)}
                                                            className="gap-1"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            {text.approve}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedSuggestion(suggestion)}
                                                        >
                                                            {text.viewDetails}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {suggestions.profile_improvements?.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">{text.improvements}:</h4>
                                    <div className="space-y-2">
                                        {suggestions.profile_improvements.map((improvement, idx) => (
                                            <Card key={idx} className="border-green-200">
                                                <CardContent className="p-3">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h5 className="font-semibold text-sm flex items-center gap-1">
                                                                <TrendingUp className="w-3 h-3" />
                                                                {improvement.profile_name}
                                                            </h5>
                                                            <p className="text-xs text-gray-600">{improvement.justification}</p>
                                                        </div>
                                                        <Badge variant="secondary">
                                                            {Math.round(improvement.confidence_score * 100)}%
                                                        </Badge>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApplyImprovement(improvement)}
                                                        className="gap-1"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Aplicar
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {suggestions.communication_insights && (
                                <Card className="bg-gray-50">
                                    <CardContent className="p-3">
                                        <h4 className="font-semibold text-sm mb-2">{text.insights}:</h4>
                                        <div className="space-y-1 text-xs text-gray-700">
                                            <p>• Tecnicidade preferida: {suggestions.communication_insights.preferred_technicality}%</p>
                                            <p>• Tom preferido: {suggestions.communication_insights.preferred_tone}</p>
                                            {suggestions.communication_insights.common_topics?.length > 0 && (
                                                <p>• Tópicos comuns: {suggestions.communication_insights.common_topics.join(', ')}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedSuggestion && (
                <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedSuggestion.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-semibold mb-1">Descrição:</h4>
                                <p className="text-gray-700">{selectedSuggestion.description}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Instruções:</h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedSuggestion.instructions}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Valores Centrais:</h4>
                                <ul className="list-disc list-inside text-gray-700">
                                    {selectedSuggestion.core_values?.map((v, i) => (
                                        <li key={i}>{v}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Suporte de Dados:</h4>
                                <p className="text-gray-700">{selectedSuggestion.data_support}</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}