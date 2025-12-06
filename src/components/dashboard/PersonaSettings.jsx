import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, X, Plus, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const translations = {
    pt: {
        title: "Configurações de Persona",
        desc: "Personalize como o Digital Twin interage com você",
        tone: "Tom de Comunicação",
        toneDesc: "Como o Digital Twin deve se comunicar",
        toneOptions: {
            formal: "Formal - Linguagem diplomática clássica",
            conversational: "Conversacional - Mais acessível e direto",
            diplomatic: "Diplomático - Equilíbrio entre formalidade e acessibilidade"
        },
        detail: "Nível de Detalhe",
        detailDesc: "Profundidade das respostas",
        detailOptions: {
            concise: "Conciso - Respostas diretas e objetivas",
            balanced: "Balanceado - Equilíbrio entre clareza e profundidade",
            comprehensive: "Abrangente - Análises detalhadas e contextuais"
        },
        redLines: "Tópicos a Evitar",
        redLinesDesc: "Temas que o Digital Twin deve evitar",
        addRedLine: "Adicionar tópico",
        redLinePlaceholder: "Ex: política partidária local",
        customInstructions: "Instruções Personalizadas",
        customInstructionsDesc: "Diretrizes adicionais para o Digital Twin",
        customPlaceholder: "Ex: Sempre mencionar exemplos práticos de implementação...",
        save: "Salvar Preferências",
        saving: "Salvando...",
        saved: "Salvo!",
        reset: "Restaurar Padrões"
    },
    en: {
        title: "Persona Settings",
        desc: "Customize how the Digital Twin interacts with you",
        tone: "Communication Tone",
        toneDesc: "How the Digital Twin should communicate",
        toneOptions: {
            formal: "Formal - Classic diplomatic language",
            conversational: "Conversational - More accessible and direct",
            diplomatic: "Diplomatic - Balance between formality and accessibility"
        },
        detail: "Detail Level",
        detailDesc: "Depth of responses",
        detailOptions: {
            concise: "Concise - Direct and objective responses",
            balanced: "Balanced - Balance between clarity and depth",
            comprehensive: "Comprehensive - Detailed and contextual analyses"
        },
        redLines: "Topics to Avoid",
        redLinesDesc: "Themes the Digital Twin should avoid",
        addRedLine: "Add topic",
        redLinePlaceholder: "E.g., local partisan politics",
        customInstructions: "Custom Instructions",
        customInstructionsDesc: "Additional guidelines for the Digital Twin",
        customPlaceholder: "E.g., Always mention practical implementation examples...",
        save: "Save Preferences",
        saving: "Saving...",
        saved: "Saved!",
        reset: "Reset Defaults"
    }
};

export default function PersonaSettings({ lang = 'pt' }) {
    const t = translations[lang];
    const [preferences, setPreferences] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [newRedLine, setNewRedLine] = useState('');

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setIsLoading(true);
        try {
            const prefs = await base44.entities.PersonaPreferences.list();
            if (prefs.length > 0) {
                setPreferences(prefs[0]);
            } else {
                setPreferences({
                    tone: 'diplomatic',
                    detail_level: 'balanced',
                    red_lines: [],
                    custom_instructions: ''
                });
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
            setPreferences({
                tone: 'diplomatic',
                detail_level: 'balanced',
                red_lines: [],
                custom_instructions: ''
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (preferences.id) {
                await base44.entities.PersonaPreferences.update(preferences.id, {
                    tone: preferences.tone,
                    detail_level: preferences.detail_level,
                    red_lines: preferences.red_lines,
                    custom_instructions: preferences.custom_instructions
                });
            } else {
                const created = await base44.entities.PersonaPreferences.create({
                    tone: preferences.tone,
                    detail_level: preferences.detail_level,
                    red_lines: preferences.red_lines,
                    custom_instructions: preferences.custom_instructions
                });
                setPreferences(created);
            }
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddRedLine = () => {
        if (newRedLine.trim()) {
            setPreferences({
                ...preferences,
                red_lines: [...(preferences.red_lines || []), newRedLine.trim()]
            });
            setNewRedLine('');
        }
    };

    const handleRemoveRedLine = (index) => {
        setPreferences({
            ...preferences,
            red_lines: preferences.red_lines.filter((_, i) => i !== index)
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                        <Settings className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                    <CardDescription>{t.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Tone */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#002D62]">{t.tone}</Label>
                        <p className="text-xs text-[#333F48]/60 mb-2">{t.toneDesc}</p>
                        <Select
                            value={preferences?.tone}
                            onValueChange={(value) => setPreferences({ ...preferences, tone: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="formal">{t.toneOptions.formal}</SelectItem>
                                <SelectItem value="conversational">{t.toneOptions.conversational}</SelectItem>
                                <SelectItem value="diplomatic">{t.toneOptions.diplomatic}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Detail Level */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#002D62]">{t.detail}</Label>
                        <p className="text-xs text-[#333F48]/60 mb-2">{t.detailDesc}</p>
                        <Select
                            value={preferences?.detail_level}
                            onValueChange={(value) => setPreferences({ ...preferences, detail_level: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="concise">{t.detailOptions.concise}</SelectItem>
                                <SelectItem value="balanced">{t.detailOptions.balanced}</SelectItem>
                                <SelectItem value="comprehensive">{t.detailOptions.comprehensive}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Red Lines */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#002D62]">{t.redLines}</Label>
                        <p className="text-xs text-[#333F48]/60 mb-2">{t.redLinesDesc}</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newRedLine}
                                onChange={(e) => setNewRedLine(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddRedLine()}
                                placeholder={t.redLinePlaceholder}
                                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002D62]/20"
                            />
                            <Button
                                onClick={handleAddRedLine}
                                size="sm"
                                variant="outline"
                                className="px-3"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {preferences?.red_lines?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {preferences.red_lines.map((line, index) => (
                                    <Badge key={index} variant="secondary" className="gap-1 pr-1">
                                        <span>{line}</span>
                                        <button
                                            onClick={() => handleRemoveRedLine(index)}
                                            className="hover:bg-gray-200 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Custom Instructions */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#002D62]">{t.customInstructions}</Label>
                        <p className="text-xs text-[#333F48]/60 mb-2">{t.customInstructionsDesc}</p>
                        <Textarea
                            value={preferences?.custom_instructions || ''}
                            onChange={(e) => setPreferences({ ...preferences, custom_instructions: e.target.value })}
                            placeholder={t.customPlaceholder}
                            className="h-24 resize-none text-sm"
                        />
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-[#002D62] hover:bg-[#001d42]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.saving}
                            </>
                        ) : showSaved ? (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {t.saved}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {t.save}
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}