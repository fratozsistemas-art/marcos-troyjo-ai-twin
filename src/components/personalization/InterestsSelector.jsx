import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Globe, Tag, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Personalize sua Experiência',
        subtitle: 'Selecione suas áreas de interesse para receber conteúdo relevante',
        audiences: 'Audiências',
        topics: 'Tópicos',
        regions: 'Regiões',
        save: 'Salvar Preferências',
        saving: 'Salvando...',
        saved: 'Preferências salvas com sucesso!'
    },
    en: {
        title: 'Personalize Your Experience',
        subtitle: 'Select your areas of interest to receive relevant content',
        audiences: 'Audiences',
        topics: 'Topics',
        regions: 'Regions',
        save: 'Save Preferences',
        saving: 'Saving...',
        saved: 'Preferences saved successfully!'
    }
};

const audienceOptions = ['Defense', 'Diplomats', 'Politicians', 'Industry', 'Academia', 'Media'];
const topicOptions = ['AI Governance', 'BRICS', 'Semiconductors', 'Trade', 'Energy', 'Climate'];
const regionOptions = ['Brazil', 'US', 'China', 'EU', 'India', 'Latin America', 'Africa'];

export default function InterestsSelector({ lang = 'pt', onSave }) {
    const [interests, setInterests] = useState({ audiences: [], topics: [], regions: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadInterests();
    }, []);

    const loadInterests = async () => {
        try {
            const user = await base44.auth.me();
            const existing = await base44.entities.UserInterest.filter({ user_email: user.email });
            if (existing.length > 0) {
                setInterests({
                    audiences: existing[0].audiences || [],
                    topics: existing[0].topics || [],
                    regions: existing[0].regions || []
                });
            }
        } catch (error) {
            console.error('Error loading interests:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (category, value) => {
        setInterests(prev => ({
            ...prev,
            [category]: prev[category].includes(value)
                ? prev[category].filter(v => v !== value)
                : [...prev[category], value]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const user = await base44.auth.me();
            const existing = await base44.entities.UserInterest.filter({ user_email: user.email });
            
            if (existing.length > 0) {
                await base44.entities.UserInterest.update(existing[0].id, interests);
            } else {
                await base44.entities.UserInterest.create({
                    user_email: user.email,
                    ...interests
                });
            }
            
            toast.success(t.saved);
            if (onSave) onSave(interests);
        } catch (error) {
            console.error('Error saving interests:', error);
            toast.error('Error saving preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-semibold text-[#002D62] mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t.audiences}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {audienceOptions.map(aud => (
                            <Badge
                                key={aud}
                                variant={interests.audiences.includes(aud) ? 'default' : 'outline'}
                                className={`cursor-pointer ${interests.audiences.includes(aud) ? 'bg-[#002D62]' : ''}`}
                                onClick={() => toggleSelection('audiences', aud)}
                            >
                                {aud}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-[#002D62] mb-3 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {t.topics}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {topicOptions.map(top => (
                            <Badge
                                key={top}
                                variant={interests.topics.includes(top) ? 'default' : 'outline'}
                                className={`cursor-pointer ${interests.topics.includes(top) ? 'bg-[#002D62]' : ''}`}
                                onClick={() => toggleSelection('topics', top)}
                            >
                                {top}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-[#002D62] mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {t.regions}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {regionOptions.map(reg => (
                            <Badge
                                key={reg}
                                variant={interests.regions.includes(reg) ? 'default' : 'outline'}
                                className={`cursor-pointer ${interests.regions.includes(reg) ? 'bg-[#002D62]' : ''}`}
                                onClick={() => toggleSelection('regions', reg)}
                            >
                                {reg}
                            </Badge>
                        ))}
                    </div>
                </div>

                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="w-full bg-[#002D62] hover:bg-[#001d42]"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t.saving}
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
    );
}