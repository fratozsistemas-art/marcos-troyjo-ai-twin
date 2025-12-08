import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Zap } from 'lucide-react';

export function useSubscription() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubscription();
    }, []);

    const loadSubscription = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const subs = await base44.entities.Subscription.filter({
                user_email: user.email
            });

            if (subs.length > 0) {
                const sub = subs[0];
                
                // Check trial expiration
                if (sub.status === 'trial' && sub.trial_end_date) {
                    const trialEnd = new Date(sub.trial_end_date);
                    if (new Date() > trialEnd) {
                        await base44.entities.Subscription.update(sub.id, {
                            status: 'expired',
                            plan: 'free'
                        });
                        sub.status = 'expired';
                        sub.plan = 'free';
                    }
                }
                
                setSubscription(sub);
            } else {
                // Create default free subscription
                const user = await base44.auth.me();
                const newSub = await base44.entities.Subscription.create({
                    user_email: user.email,
                    plan: 'free',
                    status: 'active',
                    limits: {
                        consultations_per_month: 5,
                        articles_per_month: 2,
                        documents_per_month: 5
                    }
                });
                setSubscription(newSub);
            }
        } catch (error) {
            console.error('Error loading subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const canUseFeature = (feature) => {
        if (!subscription) return false;
        if (subscription.status === 'expired') return false;
        if (subscription.plan === 'enterprise') return true;
        if (subscription.status === 'trial') return true;
        if (subscription.status === 'active' && subscription.plan === 'pro') return true;
        
        const limits = subscription.limits || {};
        const used = subscription.features_used || {};
        
        if (limits[feature] === -1) return true;
        return (used[feature] || 0) < (limits[feature] || 0);
    };

    const incrementUsage = async (feature) => {
        if (!subscription) return;
        
        const used = subscription.features_used || {};
        used[feature] = (used[feature] || 0) + 1;
        
        await base44.entities.Subscription.update(subscription.id, {
            features_used: used
        });
    };

    const daysLeftInTrial = () => {
        if (!subscription || subscription.status !== 'trial') return 0;
        const end = new Date(subscription.trial_end_date);
        const now = new Date();
        const diff = end - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return { subscription, loading, canUseFeature, incrementUsage, daysLeftInTrial };
}

export default function SubscriptionGate({ feature, children, fallback }) {
    const { subscription, loading, canUseFeature } = useSubscription();
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    if (loading) return null;

    if (!canUseFeature(feature)) {
        return fallback || (
            <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                        <Lock className="w-5 h-5" />
                        {lang === 'pt' ? 'Limite Atingido' : 'Limit Reached'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-amber-800 mb-4">
                        {lang === 'pt' 
                            ? 'Você atingiu o limite do seu plano. Faça upgrade para continuar usando este recurso.'
                            : 'You have reached your plan limit. Upgrade to continue using this feature.'}
                    </p>
                    <Link to={createPageUrl('Pricing')}>
                        <Button className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                            <Zap className="w-4 h-4" />
                            {lang === 'pt' ? 'Ver Planos' : 'View Plans'}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return children;
}