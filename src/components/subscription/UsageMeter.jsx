import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, FileText, FileCheck } from 'lucide-react';
import { useSubscription } from './SubscriptionGate';

export default function UsageMeter({ lang = 'pt' }) {
    const { subscription } = useSubscription();

    if (!subscription || subscription.plan === 'enterprise') return null;

    const t = {
        pt: {
            title: 'Uso do Plano',
            consultations: 'Consultas',
            articles: 'Artigos',
            documents: 'Documentos',
            unlimited: 'Ilimitado'
        },
        en: {
            title: 'Plan Usage',
            consultations: 'Consultations',
            articles: 'Articles',
            documents: 'Documents',
            unlimited: 'Unlimited'
        }
    };

    const text = t[lang];
    const used = subscription.features_used || {};
    const limits = subscription.limits || {};

    const metrics = [
        {
            icon: MessageSquare,
            label: text.consultations,
            used: used.consultations || 0,
            limit: limits.consultations_per_month || 0
        },
        {
            icon: FileText,
            label: text.articles,
            used: used.articles_generated || 0,
            limit: limits.articles_per_month || 0
        },
        {
            icon: FileCheck,
            label: text.documents,
            used: used.documents_analyzed || 0,
            limit: limits.documents_per_month || 0
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm text-[#002D62]">{text.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    const percentage = metric.limit === -1 ? 100 : (metric.used / metric.limit) * 100;
                    const isUnlimited = metric.limit === -1;

                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-[#333F48]/60" />
                                    <span className="text-[#333F48]">{metric.label}</span>
                                </div>
                                <span className="text-[#333F48]/60">
                                    {isUnlimited ? text.unlimited : `${metric.used}/${metric.limit}`}
                                </span>
                            </div>
                            {!isUnlimited && (
                                <Progress 
                                    value={percentage} 
                                    className={percentage > 80 ? 'bg-red-100' : 'bg-gray-100'}
                                />
                            )}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}