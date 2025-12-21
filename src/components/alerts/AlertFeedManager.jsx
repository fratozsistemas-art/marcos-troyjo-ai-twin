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
import { Rss, Plus, Edit, Trash2, Save, X, Loader2, Bell, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

const REGIONS = [
    'América Latina', 'América do Norte', 'Europa', 'Ásia-Pacífico', 'China',
    'Índia', 'África', 'Oriente Médio', 'Brasil', 'BRICS', 'Rússia'
];

const COUNTRIES = [
    'Brasil', 'China', 'Estados Unidos', 'Índia', 'Rússia', 'África do Sul',
    'Argentina', 'México', 'Alemanha', 'França', 'Reino Unido', 'Japão'
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

const FEED_COLORS = [
    '#002D62', '#8B1538', '#D4AF37', '#00654A', '#4B0082',
    '#DC143C', '#FF8C00', '#1E90FF', '#32CD32', '#8B008B'
];

export default function AlertFeedManager({ lang = 'pt', onFeedUpdate }) {
    const [feeds, setFeeds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFeed, setEditingFeed] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        enabled: true,
        regions: [],
        countries: [],
        sectors: [],
        risk_types: [],
        severity_threshold: 'medium',
        keywords: [],
        notification_level: 'medium',
        notification_preferences: {
            push_enabled: true,
            email_enabled: false,
            frequency: 'immediate',
            sound_enabled: false
        },
        color: '#002D62',
        priority: 0
    });

    const t = {
        pt: {
            title: 'Feeds de Alertas',
            desc: 'Crie feeds personalizados de alertas geopolíticos',
            addFeed: 'Criar Feed',
            editFeed: 'Editar Feed',
            noFeeds: 'Nenhum feed criado',
            name: 'Nome do Feed',
            description: 'Descrição',
            enabled: 'Ativo',
            regions: 'Regiões',
            countries: 'Países',
            sectors: 'Setores',
            riskTypes: 'Tipos de Risco',
            severity: 'Severidade Mínima',
            keywords: 'Palavras-chave',
            addKeyword: 'Adicionar',
            notificationLevel: 'Nível de Notificação',
            pushEnabled: 'Push',
            emailEnabled: 'Email',
            soundEnabled: 'Som',
            frequency: 'Frequência',
            color: 'Cor',
            priority: 'Prioridade',
            save: 'Salvar',
            saving: 'Salvando...',
            cancel: 'Cancelar',
            delete: 'Excluir',
            deleteConfirm: 'Excluir este feed?',
            alertCount: 'alertas',
            levels: {
                silent: 'Silencioso',
                low: 'Baixo',
                medium: 'Médio',
                high: 'Alto',
                urgent: 'Urgente'
            },
            severities: {
                low: 'Baixo',
                medium: 'Médio',
                high: 'Alto',
                critical: 'Crítico'
            },
            frequencies: {
                immediate: 'Imediato',
                hourly: 'Por Hora',
                daily: 'Diário',
                weekly: 'Semanal'
            }
        },
        en: {
            title: 'Alert Feeds',
            desc: 'Create custom geopolitical alert feeds',
            addFeed: 'Create Feed',
            editFeed: 'Edit Feed',
            noFeeds: 'No feeds created',
            name: 'Feed Name',
            description: 'Description',
            enabled: 'Enabled',
            regions: 'Regions',
            countries: 'Countries',
            sectors: 'Sectors',
            riskTypes: 'Risk Types',
            severity: 'Minimum Severity',
            keywords: 'Keywords',
            addKeyword: 'Add',
            notificationLevel: 'Notification Level',
            pushEnabled: 'Push',
            emailEnabled: 'Email',
            soundEnabled: 'Sound',
            frequency: 'Frequency',
            color: 'Color',
            priority: 'Priority',
            save: 'Save',
            saving: 'Saving...',
            cancel: 'Cancel',
            delete: 'Delete',
            deleteConfirm: 'Delete this feed?',
            alertCount: 'alerts',
            levels: {
                silent: 'Silent',
                low: 'Low',
                medium: 'Medium',
                high: 'High',
                urgent: 'Urgent'
            },
            severities: {
                low: 'Low',
                medium: 'Medium',
                high: 'High',
                critical: 'Critical'
            },
            frequencies: {
                immediate: 'Immediate',
                hourly: 'Hourly',
                daily: 'Daily',
                weekly: 'Weekly'
            }
        }
    }[lang];

    useEffect(() => {
        loadFeeds();
    }, []);

    const loadFeeds = async () => {
        setIsLoading(true);
        try {
            const user = await base44.auth.me();
            const allFeeds = await base44.entities.AlertFeed.filter({ user_email: user.email }, '-priority');
            setFeeds(allFeeds);
            if (onFeedUpdate) onFeedUpdate(allFeeds);
        } catch (error) {
            console.error('Error loading feeds:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openDialog = (feed = null) => {
        if (feed) {
            setEditingFeed(feed);
            setFormData({
                name: feed.name || '',
                description: feed.description || '',
                enabled: feed.enabled !== false,
                regions: feed.regions || [],
                countries: feed.countries || [],
                sectors: feed.sectors || [],
                risk_types: feed.risk_types || [],
                severity_threshold: feed.severity_threshold || 'medium',
                keywords: feed.keywords || [],
                notification_level: feed.notification_level || 'medium',
                notification_preferences: feed.notification_preferences || {
                    push_enabled: true,
                    email_enabled: false,
                    frequency: 'immediate',
                    sound_enabled: false
                },
                color: feed.color || '#002D62',
                priority: feed.priority || 0
            });
        } else {
            setEditingFeed(null);
            setFormData({
                name: '',
                description: '',
                enabled: true,
                regions: [],
                countries: [],
                sectors: [],
                risk_types: [],
                severity_threshold: 'medium',
                keywords: [],
                notification_level: 'medium',
                notification_preferences: {
                    push_enabled: true,
                    email_enabled: false,
                    frequency: 'immediate',
                    sound_enabled: false
                },
                color: FEED_COLORS[feeds.length % FEED_COLORS.length],
                priority: feeds.length
            });
        }
        setIsDialogOpen(true);
    };

    const toggleArrayItem = (array, item) => {
        return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
    };

    const addKeyword = () => {
        if (!newKeyword.trim() || formData.keywords.includes(newKeyword.trim())) return;
        setFormData({ ...formData, keywords: [...formData.keywords, newKeyword.trim()] });
        setNewKeyword('');
    };

    const removeKeyword = (keyword) => {
        setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
    };

    const saveFeed = async () => {
        if (!formData.name) {
            toast.error(lang === 'pt' ? 'Nome obrigatório' : 'Name required');
            return;
        }

        setIsSaving(true);
        try {
            const user = await base44.auth.me();
            const feedData = { ...formData, user_email: user.email };

            if (editingFeed) {
                await base44.entities.AlertFeed.update(editingFeed.id, feedData);
                toast.success(lang === 'pt' ? 'Feed atualizado' : 'Feed updated');
            } else {
                await base44.entities.AlertFeed.create(feedData);
                toast.success(lang === 'pt' ? 'Feed criado' : 'Feed created');
            }
            setIsDialogOpen(false);
            loadFeeds();
        } catch (error) {
            console.error('Error saving feed:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteFeed = async (feedId) => {
        if (!confirm(t.deleteConfirm)) return;

        try {
            await base44.entities.AlertFeed.delete(feedId);
            toast.success(lang === 'pt' ? 'Feed excluído' : 'Feed deleted');
            loadFeeds();
        } catch (error) {
            console.error('Error deleting feed:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const toggleFeedEnabled = async (feed) => {
        try {
            await base44.entities.AlertFeed.update(feed.id, { enabled: !feed.enabled });
            loadFeeds();
        } catch (error) {
            console.error('Error toggling feed:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <Rss className="w-5 h-5" />
                            {t.title}
                        </CardTitle>
                        <CardDescription>{t.desc}</CardDescription>
                    </div>
                    <Button onClick={() => openDialog()} className="bg-[#002D62]">
                        <Plus className="w-4 h-4 mr-2" />
                        {t.addFeed}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : feeds.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">{t.noFeeds}</div>
                ) : (
                    <div className="space-y-3">
                        {feeds.map(feed => (
                            <div key={feed.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-1 h-12 rounded-full" style={{ backgroundColor: feed.color }} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-[#333F48]">{feed.name}</h3>
                                                <Badge variant={feed.enabled ? 'default' : 'secondary'}>
                                                    {feed.enabled ? (lang === 'pt' ? 'Ativo' : 'Active') : (lang === 'pt' ? 'Inativo' : 'Inactive')}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {t.levels[feed.notification_level]}
                                                </Badge>
                                            </div>
                                            {feed.description && (
                                                <p className="text-sm text-gray-600 mb-2">{feed.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                {feed.regions?.length > 0 && (
                                                    <span>{feed.regions.length} {lang === 'pt' ? 'regiões' : 'regions'}</span>
                                                )}
                                                {feed.sectors?.length > 0 && (
                                                    <span>{feed.sectors.length} {lang === 'pt' ? 'setores' : 'sectors'}</span>
                                                )}
                                                {feed.risk_types?.length > 0 && (
                                                    <span>{feed.risk_types.length} {lang === 'pt' ? 'tipos' : 'types'}</span>
                                                )}
                                                {feed.alert_count > 0 && (
                                                    <span className="font-semibold text-[#002D62]">
                                                        {feed.alert_count} {t.alertCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleFeedEnabled(feed)}
                                        >
                                            {feed.enabled ? <Bell className="w-4 h-4" /> : <Bell className="w-4 h-4 opacity-30" />}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openDialog(feed)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteFeed(feed.id)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingFeed ? t.editFeed : t.addFeed}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t.name}</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>{t.notificationLevel}</Label>
                                <Select
                                    value={formData.notification_level}
                                    onValueChange={(val) => setFormData({ ...formData, notification_level: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(t.levels).map(level => (
                                            <SelectItem key={level} value={level}>{t.levels[level]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>{t.description}</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Visual */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>{t.color}</Label>
                                <div className="flex gap-2">
                                    {FEED_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-8 h-8 rounded-full border-2 ${
                                                formData.color === color ? 'border-gray-900' : 'border-gray-300'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label>{t.priority}</Label>
                                <Input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div>
                            <Label className="mb-2 block">{t.regions}</Label>
                            <div className="flex flex-wrap gap-2">
                                {REGIONS.map(region => (
                                    <Badge
                                        key={region}
                                        variant={formData.regions.includes(region) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => setFormData({
                                            ...formData,
                                            regions: toggleArrayItem(formData.regions, region)
                                        })}
                                    >
                                        {region}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 block">{t.sectors}</Label>
                            <div className="flex flex-wrap gap-2">
                                {SECTORS.map(sector => (
                                    <Badge
                                        key={sector}
                                        variant={formData.sectors.includes(sector) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => setFormData({
                                            ...formData,
                                            sectors: toggleArrayItem(formData.sectors, sector)
                                        })}
                                    >
                                        {sector}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 block">{t.riskTypes}</Label>
                            <div className="flex flex-wrap gap-2">
                                {RISK_TYPES[lang].map(type => (
                                    <Badge
                                        key={type.value}
                                        variant={formData.risk_types.includes(type.value) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => setFormData({
                                            ...formData,
                                            risk_types: toggleArrayItem(formData.risk_types, type.value)
                                        })}
                                    >
                                        {type.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label>{t.severity}</Label>
                            <Select
                                value={formData.severity_threshold}
                                onValueChange={(val) => setFormData({ ...formData, severity_threshold: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(t.severities).map(sev => (
                                        <SelectItem key={sev} value={sev}>{t.severities[sev]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>{t.keywords}</Label>
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={newKeyword}
                                    onChange={(e) => setNewKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                                />
                                <Button onClick={addKeyword} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.keywords.map(keyword => (
                                    <Badge key={keyword} variant="secondary" className="pr-1">
                                        {keyword}
                                        <button onClick={() => removeKeyword(keyword)} className="ml-2">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="space-y-3 border-t pt-4">
                            <h4 className="font-semibold text-[#002D62]">{lang === 'pt' ? 'Notificações' : 'Notifications'}</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <Label>{t.pushEnabled}</Label>
                                    <Switch
                                        checked={formData.notification_preferences.push_enabled}
                                        onCheckedChange={(checked) => setFormData({
                                            ...formData,
                                            notification_preferences: {
                                                ...formData.notification_preferences,
                                                push_enabled: checked
                                            }
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>{t.emailEnabled}</Label>
                                    <Switch
                                        checked={formData.notification_preferences.email_enabled}
                                        onCheckedChange={(checked) => setFormData({
                                            ...formData,
                                            notification_preferences: {
                                                ...formData.notification_preferences,
                                                email_enabled: checked
                                            }
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>{t.soundEnabled}</Label>
                                    <Switch
                                        checked={formData.notification_preferences.sound_enabled}
                                        onCheckedChange={(checked) => setFormData({
                                            ...formData,
                                            notification_preferences: {
                                                ...formData.notification_preferences,
                                                sound_enabled: checked
                                            }
                                        })}
                                    />
                                </div>
                                <div>
                                    <Label>{t.frequency}</Label>
                                    <Select
                                        value={formData.notification_preferences.frequency}
                                        onValueChange={(val) => setFormData({
                                            ...formData,
                                            notification_preferences: {
                                                ...formData.notification_preferences,
                                                frequency: val
                                            }
                                        })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(t.frequencies).map(freq => (
                                                <SelectItem key={freq} value={freq}>{t.frequencies[freq]}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                {t.cancel}
                            </Button>
                            <Button onClick={saveFeed} disabled={isSaving} className="bg-[#002D62]">
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.saving}</>
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" />{t.save}</>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}