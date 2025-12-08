import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Edit, Trash2, Star, Copy, CheckCircle, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PersonaProfileEditor from '@/components/persona/PersonaProfileEditor';

const translations = {
    pt: {
        title: 'Gerenciamento de Personas',
        subtitle: 'Crie e gerencie perfis de comunicação personalizados',
        back: 'Voltar',
        myProfiles: 'Meus Perfis',
        presets: 'Perfis Pré-definidos',
        createNew: 'Criar Novo Perfil',
        edit: 'Editar',
        delete: 'Excluir',
        duplicate: 'Duplicar',
        setDefault: 'Definir como Padrão',
        default: 'Padrão',
        active: 'Ativo',
        inactive: 'Inativo',
        usageCount: 'Usado {count}x',
        noProfiles: 'Nenhum perfil personalizado ainda',
        createFirst: 'Crie seu primeiro perfil de persona',
        deleteConfirm: 'Tem certeza que deseja excluir este perfil?'
    },
    en: {
        title: 'Persona Management',
        subtitle: 'Create and manage custom communication profiles',
        back: 'Back',
        myProfiles: 'My Profiles',
        presets: 'Preset Profiles',
        createNew: 'Create New Profile',
        edit: 'Edit',
        delete: 'Delete',
        duplicate: 'Duplicate',
        setDefault: 'Set as Default',
        default: 'Default',
        active: 'Active',
        inactive: 'Inactive',
        usageCount: 'Used {count}x',
        noProfiles: 'No custom profiles yet',
        createFirst: 'Create your first persona profile',
        deleteConfirm: 'Are you sure you want to delete this profile?'
    }
};

export default function PersonaManagement() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [profiles, setProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProfile, setEditingProfile] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setIsLoading(true);
        try {
            const data = await base44.entities.PersonaProfile.list();
            setProfiles(data);
        } catch (error) {
            console.error('Error loading profiles:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar perfis' : 'Error loading profiles');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (profileId) => {
        if (!confirm(t.deleteConfirm)) return;
        
        try {
            await base44.entities.PersonaProfile.delete(profileId);
            setProfiles(profiles.filter(p => p.id !== profileId));
            toast.success(lang === 'pt' ? 'Perfil excluído' : 'Profile deleted');
        } catch (error) {
            console.error('Error deleting profile:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir' : 'Error deleting');
        }
    };

    const handleDuplicate = async (profile) => {
        try {
            const newProfile = {
                ...profile,
                name: `${profile.name} (Cópia)`,
                is_default: false,
                usage_count: 0
            };
            delete newProfile.id;
            delete newProfile.created_date;
            delete newProfile.updated_date;
            delete newProfile.created_by;
            
            const created = await base44.entities.PersonaProfile.create(newProfile);
            setProfiles([...profiles, created]);
            toast.success(lang === 'pt' ? 'Perfil duplicado' : 'Profile duplicated');
        } catch (error) {
            console.error('Error duplicating:', error);
            toast.error(lang === 'pt' ? 'Erro ao duplicar' : 'Error duplicating');
        }
    };

    const handleSetDefault = async (profileId) => {
        try {
            // Remove default from all
            await Promise.all(
                profiles
                    .filter(p => p.is_default)
                    .map(p => base44.entities.PersonaProfile.update(p.id, { is_default: false }))
            );
            
            // Set new default
            await base44.entities.PersonaProfile.update(profileId, { is_default: true });
            
            setProfiles(profiles.map(p => ({
                ...p,
                is_default: p.id === profileId
            })));
            
            toast.success(lang === 'pt' ? 'Perfil padrão atualizado' : 'Default profile updated');
        } catch (error) {
            console.error('Error setting default:', error);
            toast.error(lang === 'pt' ? 'Erro ao atualizar' : 'Error updating');
        }
    };

    const handleEdit = (profile) => {
        setEditingProfile(profile);
        setShowEditor(true);
    };

    const handleCreate = () => {
        setEditingProfile(null);
        setShowEditor(true);
    };

    const handleSaveProfile = async (profileData) => {
        try {
            if (editingProfile) {
                await base44.entities.PersonaProfile.update(editingProfile.id, profileData);
                toast.success(lang === 'pt' ? 'Perfil atualizado' : 'Profile updated');
            } else {
                await base44.entities.PersonaProfile.create(profileData);
                toast.success(lang === 'pt' ? 'Perfil criado' : 'Profile created');
            }
            setShowEditor(false);
            setEditingProfile(null);
            loadProfiles();
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(lang === 'pt' ? 'Erro ao salvar' : 'Error saving');
        }
    };

    const presetProfiles = [
        {
            name: lang === 'pt' ? 'Professor Didático' : 'Didactic Professor',
            base_mode: 'professor',
            description: lang === 'pt' 
                ? 'Explicações pedagógicas com analogias e exemplos práticos'
                : 'Pedagogical explanations with analogies and practical examples',
            icon: '👨‍🏫'
        },
        {
            name: lang === 'pt' ? 'Analista Técnico' : 'Technical Analyst',
            base_mode: 'tecnico',
            description: lang === 'pt'
                ? 'Alta densidade conceitual, dados e modelos econômicos'
                : 'High conceptual density, data and economic models',
            icon: '🧠'
        },
        {
            name: lang === 'pt' ? 'Consultor Executivo' : 'Executive Consultant',
            base_mode: 'consultor',
            description: lang === 'pt'
                ? 'Foco em soluções práticas e recomendações acionáveis'
                : 'Focus on practical solutions and actionable recommendations',
            icon: '🎯'
        },
        {
            name: lang === 'pt' ? 'Pesquisador Acadêmico' : 'Academic Researcher',
            base_mode: 'academico',
            description: lang === 'pt'
                ? 'Rigor científico com citações e referências bibliográficas'
                : 'Scientific rigor with citations and bibliographic references',
            icon: '🎓'
        },
        {
            name: lang === 'pt' ? 'Diplomata Institucional' : 'Institutional Diplomat',
            base_mode: 'diplomatico',
            description: lang === 'pt'
                ? 'Tom cerimonioso ideal para contextos oficiais'
                : 'Ceremonious tone ideal for official contexts',
            icon: '🤝'
        }
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.back}</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{t.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{t.subtitle}</p>
                        </div>
                    </div>
                    <Button onClick={handleCreate} className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.createNew}</span>
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <Tabs defaultValue="my-profiles" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="my-profiles">
                            <Brain className="w-4 h-4 mr-2" />
                            {t.myProfiles}
                        </TabsTrigger>
                        <TabsTrigger value="presets">
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t.presets}
                        </TabsTrigger>
                    </TabsList>

                    {/* My Profiles */}
                    <TabsContent value="my-profiles" className="space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002D62]" />
                            </div>
                        ) : profiles.length === 0 ? (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noProfiles}</h3>
                                    <p className="text-gray-500 mb-4">{t.createFirst}</p>
                                    <Button onClick={handleCreate} className="bg-[#002D62]">
                                        <Plus className="w-4 h-4 mr-2" />
                                        {t.createNew}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {profiles.map((profile) => (
                                    <motion.div
                                        key={profile.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Card className={`h-full ${profile.is_default ? 'border-[#002D62] border-2' : ''}`}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        {profile.name}
                                                        {profile.is_default && (
                                                            <Badge className="bg-[#00654A]">
                                                                <Star className="w-3 h-3 mr-1" />
                                                                {t.default}
                                                            </Badge>
                                                        )}
                                                    </CardTitle>
                                                    <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                                                        {profile.is_active ? t.active : t.inactive}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="line-clamp-2">
                                                    {profile.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Badge variant="outline">{profile.base_mode}</Badge>
                                                        <span className="text-gray-500">
                                                            {t.usageCount.replace('{count}', profile.usage_count || 0)}
                                                        </span>
                                                    </div>
                                                    
                                                    {profile.tags && profile.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {profile.tags.map((tag, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex gap-2 pt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(profile)}
                                                            className="flex-1"
                                                        >
                                                            <Edit className="w-3 h-3 mr-1" />
                                                            {t.edit}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDuplicate(profile)}
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </Button>
                                                        {!profile.is_default && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleSetDefault(profile.id)}
                                                            >
                                                                <Star className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(profile.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Presets */}
                    <TabsContent value="presets" className="space-y-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {presetProfiles.map((preset, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="h-full hover:border-[#002D62]/40 transition-colors">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <span className="text-2xl">{preset.icon}</span>
                                                {preset.name}
                                            </CardTitle>
                                            <CardDescription>{preset.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => {
                                                    setEditingProfile({
                                                        ...preset,
                                                        is_active: true,
                                                        is_default: false
                                                    });
                                                    setShowEditor(true);
                                                }}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                {lang === 'pt' ? 'Usar como Base' : 'Use as Base'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Profile Editor Dialog */}
            <PersonaProfileEditor
                profile={editingProfile}
                open={showEditor}
                onOpenChange={setShowEditor}
                onSave={handleSaveProfile}
                lang={lang}
            />
        </div>
    );
}