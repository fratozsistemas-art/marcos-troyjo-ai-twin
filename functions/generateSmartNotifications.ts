import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = [];

        // Check for new geopolitical alerts
        const recentAlerts = await base44.asServiceRole.entities.GeopoliticalRisk.filter(
            { severity: 'high' },
            '-created_date',
            5
        );

        for (const alert of recentAlerts) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (new Date(alert.created_date) > oneDayAgo) {
                notifications.push({
                    user_email: user.email,
                    title: 'Novo Alerta Geopolítico',
                    message: `Risco identificado: ${alert.title} - ${alert.region}`,
                    type: 'alert',
                    category: 'geopolitical',
                    priority: 'high',
                    action_url: '/dashboard',
                    metadata: { risk_id: alert.id }
                });
            }
        }

        // Check for unread insights
        const insights = await base44.asServiceRole.entities.Insight.filter(
            { status: 'active' },
            '-created_date',
            5
        );

        if (insights.length > 0) {
            notifications.push({
                user_email: user.email,
                title: 'Novos Insights Disponíveis',
                message: `${insights.length} novos insights foram gerados com base em sua atividade`,
                type: 'insight',
                category: 'analytics',
                priority: 'medium',
                action_url: '/dashboard'
            });
        }

        // Check subscription limits
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
            user_email: user.email,
            status: 'active'
        });

        if (subscriptions.length > 0) {
            const sub = subscriptions[0];
            const usage = sub.features_used || {};
            const limits = sub.limits || {};

            if (limits.consultations_per_month !== -1) {
                const consultationUsage = (usage.consultations / limits.consultations_per_month) * 100;
                if (consultationUsage > 80 && consultationUsage < 95) {
                    notifications.push({
                        user_email: user.email,
                        title: 'Limite de Consultas',
                        message: `Você usou ${Math.round(consultationUsage)}% das suas consultas mensais`,
                        type: 'warning',
                        category: 'system',
                        priority: 'medium',
                        action_url: '/pricing'
                    });
                }
            }
        }

        // Check for new knowledge articles related to user interests
        const userProfile = await base44.asServiceRole.entities.UserProfile.filter({
            user_email: user.email
        });

        if (userProfile.length > 0 && userProfile[0].interests?.length > 0) {
            const interests = userProfile[0].interests;
            const recentArticles = await base44.asServiceRole.entities.KnowledgeEntry.filter(
                { status: 'publicado' },
                '-created_date',
                10
            );

            const relevantArticles = recentArticles.filter(article => 
                interests.some(interest => 
                    article.tags?.includes(interest) || article.keywords?.includes(interest)
                )
            );

            if (relevantArticles.length > 0) {
                notifications.push({
                    user_email: user.email,
                    title: 'Novos Artigos Relevantes',
                    message: `${relevantArticles.length} novos artigos sobre tópicos do seu interesse`,
                    type: 'info',
                    category: 'content',
                    priority: 'low',
                    action_url: '/knowledge-base'
                });
            }
        }

        // Create notifications
        const created = [];
        for (const notification of notifications) {
            // Check if similar notification already exists (avoid duplicates)
            const existing = await base44.asServiceRole.entities.UserNotification.filter({
                user_email: notification.user_email,
                title: notification.title,
                read: false
            });

            if (existing.length === 0) {
                const newNotif = await base44.asServiceRole.entities.UserNotification.create(notification);
                created.push(newNotif);
            }
        }

        return Response.json({
            success: true,
            notifications_created: created.length,
            notifications: created
        });

    } catch (error) {
        console.error('Error generating notifications:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});