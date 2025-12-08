import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Clock, Zap } from 'lucide-react';
import { useSubscription } from './SubscriptionGate';

export default function TrialBanner() {
    const { subscription, daysLeftInTrial } = useSubscription();
    const [lang] = React.useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    if (!subscription || subscription.status !== 'trial') return null;

    const daysLeft = daysLeftInTrial();
    
    return (
        <div className="bg-gradient-to-r from-[#B8860B] to-[#9a7209] text-white px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">
                        {lang === 'pt' 
                            ? `${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'} restantes no seu trial Pro`
                            : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left in your Pro trial`}
                    </span>
                </div>
                <Link to={createPageUrl('Pricing')}>
                    <Button size="sm" variant="secondary" className="gap-2">
                        <Zap className="w-4 h-4" />
                        {lang === 'pt' ? 'Fazer Upgrade' : 'Upgrade'}
                    </Button>
                </Link>
            </div>
        </div>
    );
}