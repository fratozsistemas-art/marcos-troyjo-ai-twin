import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Building2, Users, GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailVerification } from '@/components/subscription/VerificationGate';
import UpgradeRequestForm from '@/components/subscription/UpgradeRequestForm';

const PLANS = {
    pt: [
        {
            id: 'free',
            name: 'Gratuito',
            price: 'R$ 0',
            period: '/mês',
            description: 'Para explorar a plataforma',
            icon: Zap,
            features: [
                '5 consultas/mês',
                '2 artigos gerados/mês',
                'Acesso ao Digital Twin básico',
                'Suporte por email'
            ],
            limits: {
                consultations_per_month: 5,
                articles_per_month: 2,
                documents_per_month: 5
            }
        },
        {
            id: 'student',
            name: 'Estudante',
            priceMonthly: 'R$ 97',
            priceYearly: 'R$ 970',
            period: '/mês',
            description: 'Para estudantes e acadêmicos',
            icon: GraduationCap,
            badge: 'Desconto 75%',
            features: [
                '20 consultas/mês',
                '10 artigos gerados/mês',
                'Análise de documentos (50/mês)',
                'Acesso a dashboards',
                'Modo Professor otimizado',
                'Suporte por email'
            ],
            limits: {
                consultations_per_month: 20,
                articles_per_month: 10,
                documents_per_month: 50
            },
            stripeEnabled: true
        },
        {
            id: 'pro',
            name: 'Profissional',
            priceMonthly: 'R$ 397',
            priceYearly: 'R$ 1.497',
            period: '/mês',
            description: 'Para profissionais e analistas',
            icon: Crown,
            badge: 'Mais Popular',
            features: [
                '50 consultas/mês',
                '20 artigos gerados/mês',
                'Análise de documentos ilimitada',
                'Acesso a todos os dashboards',
                'Exportação de dados',
                'Suporte prioritário',
                'Histórico completo'
            ],
            limits: {
                consultations_per_month: 50,
                articles_per_month: 20,
                documents_per_month: -1
            },
            stripeEnabled: true
        },
        {
            id: 'teams',
            name: 'Times',
            price: 'R$ 1.497',
            period: '/mês',
            description: 'Para equipes (até 10 usuários)',
            icon: Users,
            features: [
                '150 consultas/mês (compartilhadas)',
                '60 artigos gerados/mês',
                'Análise ilimitada de documentos',
                'Workspace colaborativo',
                'Gestão de usuários',
                'Analytics de time',
                'Suporte prioritário',
                'Onboarding dedicado'
            ],
            limits: {
                consultations_per_month: 150,
                articles_per_month: 60,
                documents_per_month: -1
            }
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 'Sob consulta',
            period: '',
            description: 'Para grandes organizações',
            icon: Building2,
            features: [
                'Consultas ilimitadas',
                'Artigos ilimitados',
                'API dedicada',
                'Treinamento customizado',
                'SLA garantido',
                'Suporte 24/7',
                'Integração customizada',
                'Revisão Troyjo prioritária'
            ],
            limits: {
                consultations_per_month: -1,
                articles_per_month: -1,
                documents_per_month: -1
            }
        }
    ]
};

export default function Pricing() {
    const [lang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [loading, setLoading] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [billingInterval, setBillingInterval] = useState('monthly');
    const { isVerified } = useEmailVerification();
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const t = {
        pt: {
            title: 'Escolha seu Plano',
            subtitle: 'Comece com 7 dias de teste gratuito no plano Pro',
            trial: '7 dias grátis',
            startTrial: 'Iniciar Teste Grátis',
            subscribe: 'Assinar',
            upgrade: 'Fazer Upgrade',
            current: 'Plano Atual',
            contact: 'Falar com Vendas',
            back: 'Voltar',
            monthly: 'Mensal',
            yearly: 'Anual',
            save: 'Economize 17%'
        }
    };

    const text = t[lang];
    const plans = PLANS[lang];

    useEffect(() => {
        loadSubscription();
        checkPaymentStatus();
    }, []);

    const checkPaymentStatus = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const payment = urlParams.get('payment');
        
        if (payment === 'success') {
            toast.success('Pagamento realizado com sucesso! Sua assinatura está ativa.');
            window.history.replaceState({}, '', createPageUrl('Pricing'));
            loadSubscription();
        } else if (payment === 'cancelled') {
            toast.error('Pagamento cancelado.');
            window.history.replaceState({}, '', createPageUrl('Pricing'));
        }
    };

    const loadSubscription = async () => {
        try {
            const user = await base44.auth.me();
            const subs = await base44.entities.Subscription.filter({
                user_email: user.email
            });
            if (subs.length > 0) {
                setCurrentPlan(subs[0].plan);
            }
        } catch (error) {
            console.error('Error loading subscription:', error);
        }
    };

    const handleStartTrial = async () => {
        if (!isVerified) {
            toast.error('Verifique seu email primeiro');
            return;
        }

        setLoading(true);
        try {
            const user = await base44.auth.me();
            const trialStart = new Date();
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 7);

            const existing = await base44.entities.Subscription.filter({
                user_email: user.email
            });

            if (existing.length > 0) {
                await base44.entities.Subscription.update(existing[0].id, {
                    plan: 'trial',
                    status: 'trial',
                    trial_start_date: trialStart.toISOString(),
                    trial_end_date: trialEnd.toISOString(),
                    limits: plans.find(p => p.id === 'pro').limits,
                    features_used: {
                        consultations: 0,
                        articles_generated: 0,
                        documents_analyzed: 0
                    }
                });
            } else {
                await base44.entities.Subscription.create({
                    user_email: user.email,
                    plan: 'trial',
                    status: 'trial',
                    trial_start_date: trialStart.toISOString(),
                    trial_end_date: trialEnd.toISOString(),
                    limits: plans.find(p => p.id === 'pro').limits,
                    features_used: {
                        consultations: 0,
                        articles_generated: 0,
                        documents_analyzed: 0
                    }
                });
            }

            toast.success('Trial iniciado com sucesso!');
            window.location.href = createPageUrl('Dashboard');
        } catch (error) {
            console.error('Error starting trial:', error);
            toast.error('Erro ao iniciar trial');
        } finally {
            setLoading(false);
        }
    };

    const handleStripeCheckout = async (planId) => {
        if (!isVerified) {
            toast.error('Verifique seu email primeiro');
            return;
        }

        setLoading(true);
        try {
            const response = await base44.functions.invoke('createStripeCheckout', {
                plan: planId,
                interval: billingInterval
            });

            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
            toast.error('Erro ao processar pagamento');
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradeRequest = (plan) => {
        setSelectedPlan(plan);
        setUpgradeDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            {text.back}
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#002D62] mb-4">{text.title}</h1>
                    <p className="text-xl text-[#333F48] mb-6">{text.subtitle}</p>
                    
                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                billingInterval === 'monthly'
                                    ? 'bg-[#002D62] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {text.monthly}
                        </button>
                        <button
                            onClick={() => setBillingInterval('yearly')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                billingInterval === 'yearly'
                                    ? 'bg-[#002D62] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {text.yearly}
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                {text.save}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isCurrent = currentPlan === plan.id;
                        const displayPrice = billingInterval === 'yearly' && plan.priceYearly 
                            ? plan.priceYearly 
                            : plan.priceMonthly || plan.price;
                        
                        return (
                            <Card key={plan.id} className={`relative flex flex-col ${plan.badge ? 'border-[#B8860B] border-2' : ''}`}>
                                {plan.badge && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-[#B8860B] text-white">
                                            {plan.badge}
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Icon className="w-8 h-8 text-[#002D62]" />
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    </div>
                                    <CardDescription>{plan.description}</CardDescription>
                                    <div className="mt-4">
                                        <span className="text-3xl font-bold text-[#002D62]">{displayPrice}</span>
                                        <span className="text-[#333F48]/60">
                                            {billingInterval === 'yearly' && plan.priceYearly ? '/ano' : plan.period}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1 flex flex-col">
                                    <ul className="space-y-2 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-xs text-[#333F48]">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {isCurrent ? (
                                        <Button disabled className="w-full">
                                            {text.current}
                                        </Button>
                                    ) : plan.id === 'free' ? (
                                        <Button disabled className="w-full">
                                            {text.current}
                                        </Button>
                                    ) : plan.id === 'pro' && !currentPlan ? (
                                        <Button 
                                            className="w-full bg-[#002D62] hover:bg-[#001d42]"
                                            onClick={handleStartTrial}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : text.startTrial}
                                        </Button>
                                    ) : plan.stripeEnabled ? (
                                        <Button 
                                            className="w-full bg-[#002D62] hover:bg-[#001d42]"
                                            onClick={() => handleStripeCheckout(plan.id)}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : text.subscribe}
                                        </Button>
                                    ) : (plan.id === 'enterprise' || plan.id === 'teams') ? (
                                        <Button 
                                            className="w-full bg-[#B8860B] hover:bg-[#9a7209]"
                                            onClick={() => handleUpgradeRequest(plan.id)}
                                        >
                                            {text.contact}
                                        </Button>
                                    ) : (
                                        <Button 
                                            className="w-full bg-[#002D62] hover:bg-[#001d42]"
                                            onClick={() => handleUpgradeRequest(plan.id)}
                                        >
                                            {text.upgrade}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </main>

            <UpgradeRequestForm 
                open={upgradeDialogOpen}
                onOpenChange={setUpgradeDialogOpen}
                plan={selectedPlan}
                lang={lang}
            />
        </div>
    );
}