import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
    Users, Activity, MessageSquare, Share2, FileText, 
    TrendingUp, Calendar, ArrowLeft, Eye, Clock, ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeamDashboard() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [teamActivities, setTeamActivities] = useState([]);
    const [sharedContent, setSharedContent] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalShares: 0,
        totalComments: 0,
        activeMembers: 0,
        collaboration_score: 0
    });

    const t = {
        pt: {
            title: 'Dashboard de Equipe',
            subtitle: 'Visualize atividades e colaborações da sua equipe',
            back: 'Voltar',
            overview: 'Visão Geral',
            activity: 'Atividade',
            shared: 'Compartilhados',
            members: 'Membros',
            totalShares: 'Compartilhamentos',
            totalComments: 'Comentários',
            activeMembers: 'Membros Ativos',
            collaborationScore: 'Score de Colaboração',
            recentActivity: 'Atividade Recente',
            sharedWithTeam: 'Compartilhado com a Equipe',
            noActivity: 'Nenhuma atividade recente',
            noShared: 'Nenhum conteúdo compartilhado',
            viewAll: 'Ver Todos',
            shared_: 'compartilhou',
            commented: 'comentou em',
            viewed: 'visualizou',
            ago: 'atrás'
        },
        en: {
            title: 'Team Dashboard',
            subtitle: 'View team activities and collaborations',
            back: 'Back',
            overview: 'Overview',
            activity: 'Activity',
            shared: 'Shared',
            members: 'Members',
            totalShares: 'Shares',
            totalComments: 'Comments',
            activeMembers: 'Active Members',
            collaborationScore: 'Collaboration Score',
            recentActivity: 'Recent Activity',
            sharedWithTeam: 'Shared with Team',
            noActivity: 'No recent activity',
            noShared: 'No shared content',
            viewAll: 'View All',
            shared_: 'shared',
            commented: 'commented on',
            viewed: 'viewed',
            ago: 'ago'
        }
    }[lang];

    useEffect(() => {
        loadTeamData();
    }, []);

    const loadTeamData = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            
            const [shared, activities, orgMembers] = await Promise.all([
                base44.entities.SharedContent.filter({ active: true }),
                base44.entities.UserActivity.list('-created_date', 50),
                base44.entities.OrganizationMember.filter({ active: true })
            ]);

            setSharedContent(shared || []);
            setTeamActivities(activities || []);
            setTeamMembers(orgMembers || []);

            const comments = await base44.entities.Comment.list();

            setStats({
                totalShares: shared?.length || 0,
                totalComments: comments?.length || 0,
                activeMembers: orgMembers?.length || 0,
                collaboration_score: Math.min(100, (shared?.length || 0) * 5 + (comments?.length || 0) * 2)
            });
        } catch (error) {
            console.error('Error loading team data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type) => {
        switch(type) {
            case 'share': return Share2;
            case 'comment': return MessageSquare;
            case 'view': return Eye;
            default: return Activity;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return `${seconds}s ${t.ago}`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${t.ago}`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${t.ago}`;
        return `${Math.floor(seconds / 86400)}d ${t.ago}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t.back}
                            </Button>
                        </Link>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Share2 className="w-5 h-5 text-blue-600" />
                                    <Badge variant="outline">{t.totalShares}</Badge>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalShares}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    <Badge variant="outline">{t.totalComments}</Badge>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalComments}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Users className="w-5 h-5 text-purple-600" />
                                    <Badge variant="outline">{t.activeMembers}</Badge>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.activeMembers}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="w-5 h-5 text-orange-600" />
                                    <Badge variant="outline">{t.collaborationScore}</Badge>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stats.collaboration_score}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="activity" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="activity">{t.activity}</TabsTrigger>
                        <TabsTrigger value="shared">{t.shared}</TabsTrigger>
                        <TabsTrigger value="members">{t.members}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    {t.recentActivity}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {teamActivities.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">{t.noActivity}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {teamActivities.slice(0, 10).map((activity) => {
                                            const Icon = getActivityIcon(activity.activity_type);
                                            return (
                                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarFallback>
                                                            {activity.user_email?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                                {activity.user_email?.split('@')[0]}
                                                            </span>
                                                            <Icon className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {activity.description || activity.activity_type}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Clock className="w-3 h-3" />
                                                            {getTimeAgo(activity.created_date)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="shared">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    {t.sharedWithTeam}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sharedContent.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">{t.noShared}</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {sharedContent.map((content) => (
                                            <div key={content.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <Badge variant="outline" className="mb-2">
                                                            {content.content_type}
                                                        </Badge>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                            {content.content_title}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">
                                                            {lang === 'pt' ? 'por' : 'by'} {content.owner_email?.split('@')[0]}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {content.access_count || 0}
                                                    </div>
                                                    {content.comments?.length > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <MessageSquare className="w-3 h-3" />
                                                            {content.comments.length}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="members">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {t.members}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {teamMembers.map((member) => (
                                        <div key={member.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarFallback>
                                                        {member.user_email?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                        {member.user_email?.split('@')[0]}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {member.user_email}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {member.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}