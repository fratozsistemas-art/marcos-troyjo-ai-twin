import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Save, Loader2 } from 'lucide-react';

const INDUSTRIES = [
    'Agronegócio', 'Energia', 'Tecnologia', 'Manufatura', 'Serviços Financeiros',
    'Infraestrutura', 'Mineração', 'Comércio', 'Turismo', 'Saúde'
];

const REGIONS = [
    'América Latina', 'América do Norte', 'Europa', 'Ásia-Pacífico', 'China',
    'Índia', 'África', 'Oriente Médio', 'Brasil', 'BRICS'
];

const THEORIES = [
    'Vantagens Comparativas', 'Competitividade Sistêmica', 'Cadeias Globais de Valor',
    'Novo Desenvolvimentismo', 'Crescimento Endógeno', 'Comércio Internacional',
    'Economia Institucional', 'Geopolítica Econômica'
];

export default function ProfileSettings({ lang = 'pt' }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newInterest, setNewInterest] = useState('');
    const [user, setUser] = useState(null);

    const translations = {
        pt: {
            title: 'Preferências de Perfil',
            description: 'Personalize sua experiência com o Digital Twin',
            interests: 'Áreas de Interesse',
            industries: 'Indústrias',
            regions: 'Regiões',
            theories: 'Teorias Econômicas',
            customTopics: 'Tópicos Personalizados',
            addTopic: 'Adicionar tópico',
            dashboard: 'Visualização do Dashboard',
            layout: 'Layout',
            theme: 'Tema',
            language: 'Idioma',
            notifications: 'Notificações',
            contentSuggestions: 'Sugestões de conteúdo',
            topicAlerts: 'Alertas de tópicos',
            save: 'Salvar Preferências',
            saving: 'Salvando...',
            saved: 'Salvo!'
        },
        en: {
            title: 'Profile Preferences',
            description: 'Customize your experience with the Digital Twin',
            interests: 'Areas of Interest',
            industries: 'Industries',
            regions: 'Regions',
            theories: 'Economic Theories',
            customTopics: 'Custom Topics',
            addTopic: 'Add topic',
            dashboard: 'Dashboard View',
            layout: 'Layout',
            theme: 'Theme',
            language: 'Language',
            notifications: 'Notifications',
            contentSuggestions: 'Content suggestions',
            topicAlerts: 'Topic alerts',
            save: 'Save Preferences',
            saving: 'Saving...',
            saved: 'Saved!'
        }
    };

    const t = translations[lang];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);

            const profiles = await base44.entities.UserProfile.filter({
                user_email: currentUser.email
            });

            if (profiles.length > 0) {
                setProfile(profiles[0]);
            } else {
                const newProfile = await base44.entities.UserProfile.create({
                    user_email: currentUser.email,
                    interests: {
                        industries: [],
                        regions: [],
                        economic_theories: [],
                        topics: []
                    },
                    dashboard_preferences: {
                        layout: 'comfortable',
                        visible_sections: ['conversations', 'insights', 'vocabulary', 'agent_control'],
                        theme: 'light',
                        language: lang
                    },
                    notification_preferences: {
                        new_content_suggestions: true,
                        topic_alerts: true
                    }
                });
                setProfile(newProfile);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleInterest = (category, item) => {
        setProfile(prev => {
            const current = prev.interests[category] || [];
            const updated = current.includes(item)
                ? current.filter(i => i !== item)
                : [...current, item];

            return {
                ...prev,
                interests: {
                    ...prev.interests,
                    [category]: updated
                }
            };
        });
    };

    const addCustomTopic = () => {
        if (!newInterest.trim()) return;
        
        setProfile(prev => ({
            ...prev,
            interests: {
                ...prev.interests,
                topics: [...(prev.interests.topics || []), newInterest.trim()]
            }
        }));
        setNewInterest('');
    };

    const removeCustomTopic = (topic) => {
        setProfile(prev => ({
            ...prev,
            interests: {
                ...prev.interests,
                topics: (prev.interests.topics || []).filter(t => t !== topic)
            }
        }));
    };

    const updateDashboardPreference = (key, value) => {
        setProfile(prev => ({
            ...prev,
            dashboard_preferences: {
                ...prev.dashboard_preferences,
                [key]: value
            }
        }));
    };

    const updateNotificationPreference = (key, value) => {
        setProfile(prev => ({
            ...prev,
            notification_preferences: {
                ...prev.notification_preferences,
                [key]: value
            }
        }));
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            await base44.entities.UserProfile.update(profile.id, profile);
            setTimeout(() => setSaving(false), 1000);
        } catch (error) {
            console.error('Error saving profile:', error);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-[#002D62]">{t.title}</CardTitle>
                    <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Interests Section */}
                    <div>
                        <h3 className="font-semibold text-[#002D62] mb-4">{t.interests}</h3>
                        
                        {/* Industries */}
                        <div className="mb-4">
                            <Label className="text-sm text-gray-600 mb-2 block">{t.industries}</Label>
                            <div className="flex flex-wrap gap-2">
                                {INDUSTRIES.map(industry => (
                                    <Badge
                                        key={industry}
                                        onClick={() => toggleInterest('industries', industry)}
                                        className={`cursor-pointer transition-colors ${
                                            profile.interests.industries?.includes(industry)
                                                ? 'bg-[#00654A] text-white hover:bg-[#004d38]'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {industry}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Regions */}
                        <div className="mb-4">
                            <Label className="text-sm text-gray-600 mb-2 block">{t.regions}</Label>
                            <div className="flex flex-wrap gap-2">
                                {REGIONS.map(region => (
                                    <Badge
                                        key={region}
                                        onClick={() => toggleInterest('regions', region)}
                                        className={`cursor-pointer transition-colors ${
                                            profile.interests.regions?.includes(region)
                                                ? 'bg-[#002D62] text-white hover:bg-[#001d42]'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {region}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Economic Theories */}
                        <div className="mb-4">
                            <Label className="text-sm text-gray-600 mb-2 block">{t.theories}</Label>
                            <div className="flex flex-wrap gap-2">
                                {THEORIES.map(theory => (
                                    <Badge
                                        key={theory}
                                        onClick={() => toggleInterest('economic_theories', theory)}
                                        className={`cursor-pointer transition-colors ${
                                            profile.interests.economic_theories?.includes(theory)
                                                ? 'bg-[#B8860B] text-white hover:bg-[#8B6508]'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {theory}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Custom Topics */}
                        <div>
                            <Label className="text-sm text-gray-600 mb-2 block">{t.customTopics}</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomTopic()}
                                    placeholder={t.addTopic}
                                    className="flex-1"
                                />
                                <Button onClick={addCustomTopic} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(profile.interests.topics || []).map(topic => (
                                    <Badge
                                        key={topic}
                                        className="bg-indigo-100 text-indigo-800 pr-1"
                                    >
                                        {topic}
                                        <button
                                            onClick={() => removeCustomTopic(topic)}
                                            className="ml-2 hover:bg-indigo-200 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Preferences */}
                    <div className="pt-6 border-t">
                        <h3 className="font-semibold text-[#002D62] mb-4">{t.dashboard}</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm text-gray-600 mb-2 block">{t.layout}</Label>
                                <Select
                                    value={profile.dashboard_preferences.layout}
                                    onValueChange={(value) => updateDashboardPreference('layout', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="compact">Compacto</SelectItem>
                                        <SelectItem value="comfortable">Confortável</SelectItem>
                                        <SelectItem value="spacious">Espaçoso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-sm text-gray-600 mb-2 block">{t.theme}</Label>
                                <Select
                                    value={profile.dashboard_preferences.theme}
                                    onValueChange={(value) => updateDashboardPreference('theme', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Claro</SelectItem>
                                        <SelectItem value="dark">Escuro</SelectItem>
                                        <SelectItem value="auto">Automático</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="pt-6 border-t">
                        <h3 className="font-semibold text-[#002D62] mb-4">{t.notifications}</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">{t.contentSuggestions}</Label>
                                <Switch
                                    checked={profile.notification_preferences.new_content_suggestions}
                                    onCheckedChange={(checked) => updateNotificationPreference('new_content_suggestions', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">{t.topicAlerts}</Label>
                                <Switch
                                    checked={profile.notification_preferences.topic_alerts}
                                    onCheckedChange={(checked) => updateNotificationPreference('topic_alerts', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-6">
                        <Button
                            onClick={saveProfile}
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}