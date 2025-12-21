import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Plus, X, Save, Loader2, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

const REGIONS = [
    'América Latina', 'América do Norte', 'Europa', 'Ásia-Pacífico', 'China',
    'Índia', 'África', 'Oriente Médio', 'Brasil', 'BRICS', 'Rússia'
];

const COUNTRIES = [
    'Brasil', 'China', 'Estados Unidos', 'Índia', 'Rússia', 'África do Sul',
    'Argentina', 'México', 'Alemanha', 'França', 'Reino Unido', 'Japão', 
    'Coreia do Sul', 'Austrália', 'Canadá', 'Arábia Saudita', 'Turquia', 'Irã'
];

const SECTORS = [
    'Agronegócio', 'Energia', 'Tecnologia', 'Finanças', 'Manufatura',
    'Infraestrutura', 'Mineração', 'Comércio', 'Defesa', 'Saúde'
];

const RISK_TYPES = {
    pt: [
        { value: 'political', label: 'Político' },
        { value: 'economic', label: 'Econômico' },
        { value: 'security', label: 'Segurança' },
        { value: 'social', label: 'Social' },
        { value: 'environmental', label: 'Ambiental' },
        { value: 'trade', label: 'Comércio' },
        { value: 'diplomatic', label: 'Diplomático' }
    ],
    en: [
        { value: 'political', label: 'Political' },
        { value: 'economic', label: 'Economic' },
        { value: 'security', label: 'Security' },
        { value: 'social', label: 'Social' },
        { value: 'environmental', label: 'Environmental' },
        { value: 'trade', label: 'Trade' },
        { value: 'diplomatic', label: 'Diplomatic' }
    ]
};

export default function AlertConfigurationPanel({ lang = 'pt' }) {
    const [config, setConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');

    const t = {
        pt: {
            title: "Configurar Alertas",
            desc: "Personalize seus alertas geopolíticos",
            enabled: "Alertas Ativos",
            regions: "Regiões de Interesse",
            countries: "Países Específicos",
            riskTypes: "Tipos de Risco",
            severity: "Severidade Mínima",
            sectors: "Setores",
            notifications: "Notificações",
            pushEnabled: "Notificações Push",
            emailEnabled: "Notificações por Email",
            frequency: "Frequência",
            immediate: "Imediato",
            daily: "Diário",
            weekly: "Semanal",
            keywords: "Palavras-chave",
            addKeyword: "Adicionar palavra-chave",
            save: "Salvar Configuração",
            saving: "Salvando...",
            saved: "Configuração salva!",
            quietHours: "Horário Silencioso",
            quietStart: "Início",
            quietEnd: "Fim",
            low: "Baixo",
            medium: "Médio",
            high: "Alto",
            critical: "Crítico"
        },
        en: {
            title: "Configure Alerts",
            desc: "Customize your geopolitical alerts",
            enabled: "Alerts Enabled",
            regions: "Regions of Interest",
            countries: "Specific Countries",
            riskTypes: "Risk Types",
            severity: "Minimum Severity",
            sectors: "Sectors",
            notifications: "Notifications",
            pushEnabled: "Push Notifications",
            emailEnabled: "Email Notifications",
            frequency: "Frequency",
            immediate: "Immediate",
            daily: "Daily",
            weekly: "Weekly",
            keywords: "Keywords",
            addKeyword: "Add keyword",
            save: "Save Configuration",
            saving: "Saving...",
            saved: "Configuration saved!",
            quietHours: "Quiet Hours",
            quietStart: "Start",
            quietEnd: "End",
            low: "Low",
            medium: "Medium",
            high: "High",
            critical: "Critical"
        }
    }[lang];

    useEffect(() => {
        if (isOpen) loadConfig();
    }, [isOpen]);

    const loadConfig = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            const configs = await base44.entities.AlertConfiguration.filter({
                user_email: user.email
            });

            if (configs.length > 0) {
                setConfig(configs[0]);
            } else {
                setConfig({
                    user_email: user.email,
                    enabled: true,
                    regions: [],
                    countries: [],
                    risk_types: ['political', 'economic', 'security'],
                    severity_threshold: 'medium',
                    sectors: [],
                    notification_preferences: {
                        push_enabled: true,
                        email_enabled: false,
                        frequency: 'immediate',
                        quiet_hours: { enabled: false }
                    },
                    keywords: []
                });
            }
        } catch (error) {
            console.error('Error loading config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleArrayItem = (array, item) => {
        return array.includes(item) 
            ? array.filter(i => i !== item)
            : [...array, item];
    };

    const addKeyword = () => {
        if (!newKeyword.trim()) return;
        setConfig(prev => ({
            ...prev,
            keywords: [...(prev.keywords || []), newKeyword.trim()]
        }));
        setNewKeyword('');
    };

    const removeKeyword = (keyword) => {
        setConfig(prev => ({
            ...prev,
            keywords: prev.keywords.filter(k => k !== keyword)
        }));
    };

    const saveConfig = async () => {
        setIsSaving(true);
        try {
            if (config.id) {
                await base44.entities.AlertConfiguration.update(config.id, config);
            } else {
                const created = await base44.entities.AlertConfiguration.create(config);
                setConfig(created);
            }
            toast.success(t.saved);
            setIsOpen(false);
        } catch (error) {
            console.error('Error saving config:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    {t.title}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#002D62]" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription>{t.desc}</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Enable/Disable */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                {config?.enabled ? (
                                    <Bell className="w-5 h-5 text-green-600" />
                                ) : (
                                    <BellOff className="w-5 h-5 text-gray-400" />
                                )}
                                <Label className="text-base font-semibold">{t.enabled}</Label>
                            </div>
                            <Switch
                                checked={config?.enabled}
                                onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
                            />
                        </div>

                        {/* Regions */}
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">{t.regions}</Label>
                            <div className="flex flex-wrap gap-2">
                                {REGIONS.map(region => (
                                    <Badge
                                        key={region}
                                        variant={config?.regions?.includes(region) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => setConfig({
                                            ...config,
                                            regions: toggleArrayItem(config.regions || [], region)
                                        })}
                                    >
                                        {region}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Countries */}
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">{t.countries}</Label>
                            <div className="flex flex-wrap gap-2">
                                {COUNTRIES.map(country => (
                                    <Badge
                                        key={country}
                                        variant={config?.countries?.includes(country) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => setConfig({
                                            ...config,
                                            countries: toggleArrayItem(config.countries || [], country)
                                        })}
                                    >
                                        {country}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Risk Types */}
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">{t.riskTypes}</Label>
                            <div className="flex flex-wrap gap-2">
                                {RISK_TYPES[lang].map(type => (
                                    <Badge
                                        key={type.value}
                                        variant={config?.risk_types?.includes(type.value) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => setConfig({
                                            ...config,
                                            risk_types: toggleArrayItem(config.risk_types || [], type.value)
                                        })}
                                    >
                                        {type.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Sectors */}
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">{t.sectors}</Label>
                            <div className="flex flex-wrap gap-2">
                                {SECTORS.map(sector => (
                                    <Badge
                                        key={sector}
                                        variant={config?.sectors?.includes(sector) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => setConfig({
                                            ...config,
                                            sectors: toggleArrayItem(config.sectors || [], sector)
                                        })}
                                    >
                                        {sector}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Severity Threshold */}
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">{t.severity}</Label>
                            <Select
                                value={config?.severity_threshold}
                                onValueChange={(value) => setConfig({...config, severity_threshold: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">{t.low}</SelectItem>
                                    <SelectItem value="medium">{t.medium}</SelectItem>
                                    <SelectItem value="high">{t.high}</SelectItem>
                                    <SelectItem value="critical">{t.critical}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Keywords */}
                        <div>
                            <Label className="text-sm font-semibold mb-2 block">{t.keywords}</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                                    placeholder={t.addKeyword}
                                />
                                <Button onClick={addKeyword} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(config?.keywords || []).map(keyword => (
                                    <Badge key={keyword} variant="secondary" className="pr-1">
                                        {keyword}
                                        <button
                                            onClick={() => removeKeyword(keyword)}
                                            className="ml-2 hover:bg-gray-200 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Notification Preferences */}
                        <div className="space-y-4 border-t pt-4">
                            <h4 className="font-semibold text-[#002D62]">{t.notifications}</h4>
                            
                            <div className="flex items-center justify-between">
                                <Label>{t.pushEnabled}</Label>
                                <Switch
                                    checked={config?.notification_preferences?.push_enabled}
                                    onCheckedChange={(checked) => setConfig({
                                        ...config,
                                        notification_preferences: {
                                            ...config.notification_preferences,
                                            push_enabled: checked
                                        }
                                    })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>{t.emailEnabled}</Label>
                                <Switch
                                    checked={config?.notification_preferences?.email_enabled}
                                    onCheckedChange={(checked) => setConfig({
                                        ...config,
                                        notification_preferences: {
                                            ...config.notification_preferences,
                                            email_enabled: checked
                                        }
                                    })}
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block">{t.frequency}</Label>
                                <Select
                                    value={config?.notification_preferences?.frequency}
                                    onValueChange={(value) => setConfig({
                                        ...config,
                                        notification_preferences: {
                                            ...config.notification_preferences,
                                            frequency: value
                                        }
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="immediate">{t.immediate}</SelectItem>
                                        <SelectItem value="daily">{t.daily}</SelectItem>
                                        <SelectItem value="weekly">{t.weekly}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Save Button */}
                        <Button
                            onClick={saveConfig}
                            disabled={isSaving}
                            className="w-full bg-[#002D62]"
                        >
                            {isSaving ? (
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
                )}
            </DialogContent>
        </Dialog>
    );
}