import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
    Check, ArrowRight, Sparkles, Crown, Users, Building2, 
    Zap, Globe, Mail, Shield, Star, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Planos de Assinatura',
        subtitle: 'Escolha o plano ideal para suas necessidades',
        monthly: 'Mensal',
        annual: 'Anual',
        save: 'Economize',
        currentPlan: 'Plano Atual',
        upgrade: 'Fazer Upgrade',
        subscribe: 'Assinar',
        contactUs: 'Falar com Vendas',
        loading: 'Carregando...',
        perMonth: '/mês',
        perYear: '/ano',
        billed: 'cobrado',
        monthly_: 'mensalmente',
        annually: 'anualmente',
        popular: 'Mais Popular',
        freemium: {
            name: 'Freemium',
            description: 'Para começar a explorar',
            price: 'Grátis',
            features: [
                '5 consultas por mês',
                'Acesso básico ao Digital Twin',
                'Respostas padrão',
                'Suporte via email',
                'Base de conhecimento'
            ]
        },
        plus: {
            name: 'Plus',
            description: 'Para usuários individuais',
            features: [
                '50 consultas por mês',
                'Adaptação de persona',
                'Análise de documentos (3/mês)',
                'Exportação em PDF',
                'Histórico de conversas',
                'Suporte prioritário'
            ]
        },
        pro: {
            name: 'Pro',
            description: 'Para profissionais sérios',
            features: [
                '200 consultas por mês',
                'Todas as features Plus',
                'Análise ilimitada de documentos',
                'Alertas geopolíticos personalizados',
                'Geração de relatórios',
                'API access',
                'Suporte 24/7'
            ]
        },
        teams: {
            name: 'Teams',
            description: 'Para equipes e organizações',
            features: [
                '1000 consultas por mês (compartilhadas)',
                'Todas as features Pro',
                'Até 10 usuários',
                'Dashboard colaborativo',
                'SSO (Single Sign-On)',
                'Treinamento de equipe',
                'Gerente de conta dedicado'
            ]
        },
        enterprise: {
            name: 'Enterprise',
            description: 'Para grandes organizações',
            price: 'Personalizado',
            features: [
                'Consultas ilimitadas',
                'Usuários ilimitados',
                'Todas as features Teams',
                'Modelo customizado',
                'Integração API completa',
                'SLA garantido',
                'Suporte white-glove',
                'Treinamento on-site'
            ]
        }
    },
    en: {
        title: 'Subscription Plans',
        subtitle: 'Choose the perfect plan for your needs',
        monthly: 'Monthly',
        annual: 'Annual',
        save: 'Save',
        currentPlan: 'Current Plan',
        upgrade: 'Upgrade',
        subscribe: 'Subscribe',
        contactUs: 'Contact Sales',
        loading: 'Loading...',
        perMonth: '/mo',
        perYear: '/yr',
        billed: 'billed',
        monthly_: 'monthly',
        annually: 'annually',
        popular: 'Most Popular',
        freemium: {
            name: 'Freemium',
            description: 'To start exploring',
            price: 'Free',
            features: [
                '5 consultations per month',
                'Basic Digital Twin access',
                'Standard responses',
                'Email support',
                'Knowledge base'
            ]
        },
        plus: {
            name: 'Plus',
            description: 'For individual users',
            features: [
                '50 consultations per month',
                'Persona adaptation',
                'Document analysis (3/month)',
                'PDF export',
                'Conversation history',
                'Priority support'
            ]
        },
        pro: {
            name: 'Pro',
            description: 'For serious professionals',
            features: [
                '200 consultations per month',
                'All Plus features',
                'Unlimited document analysis',
                'Custom geopolitical alerts',
                'Report generation',
                'API access',
                '24/7 support'
            ]
        },
        teams: {
            name: 'Teams',
            description: 'For teams and organizations',
            features: [
                '1000 shared consultations/month',
                'All Pro features',
                'Up to 10 users',
                'Collaborative dashboard',
                'SSO (Single Sign-On)',
                'Team training',
                'Dedicated account manager'
            ]
        },
        enterprise: {
            name: 'Enterprise',
            description: 'For large organizations',
            price: 'Custom',
            features: [
                'Unlimited consultations',
                'Unlimited users',
                'All Teams features',
                'Custom model',
                'Full API integration',
                'Guaranteed SLA',
                'White-glove support',
                'On-site training'
            ]
        }
    }
};

export default function Pricing() {
    const navigate = useNavigate();
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [billing, setBilling] = useState('monthly');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(null);

    const t = translations[lang];

    useEffect(() => {
        checkAuthAndSubscription();
    }, []);

    const checkAuthAndSubscription = async () => {
        setLoading(true);
        try {
            const auth = await base44.auth.isAuthenticated();
            setIsAuthenticated(auth);

            if (auth) {
                const user = await base44.auth.me();
                const subscriptions = await base44.entities.Subscription.filter({ 
                    user_email: user.email,
                    status: 'active'
                });
                
                if (subscriptions.length > 0) {
                    setCurrentSubscription(subscriptions[0]);
                }
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (priceId, planName) => {
        if (!isAuthenticated) {
            toast.info(lang === 'pt' ? 'Faça login para assinar' : 'Please login to subscribe');
            base44.auth.redirectToLogin(createPageUrl('Pricing'));
            return;
        }

        setSubscribing(planName);
        try {
            const response = await base44.functions.invoke('createStripeCheckout', {
                priceId,
                mode: 'subscription',
                successUrl: window.location.origin + createPageUrl('Dashboard') + '?payment=success',
                cancelUrl: window.location.origin + createPageUrl('Pricing') + '?payment=cancelled'
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                toast.error(lang === 'pt' ? 'Erro ao criar checkout' : 'Error creating checkout');
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
            toast.error(lang === 'pt' ? 'Erro ao processar assinatura' : 'Error processing subscription');
        } finally {
            setSubscribing(null);
        }
    };

    const handleContactSales = () => {
        window.location.href = 'mailto:contact@troyjo.digital?subject=Enterprise Plan Inquiry';
    };

    const plans = [
        {
            id: 'freemium',
            name: t.freemium.name,
            description: t.freemium.description,
            icon: Sparkles,
            color: 'from-gray-500 to-gray-600',
            priceMonthly: 0,
            priceAnnual: 0,
            stripePriceIdMonthly: 'price_1SgmdtRo0dVPpa4WLPzbGynZ',
            stripePriceIdAnnual: 'price_1SgmdtRo0dVPpa4WLPzbGynZ',
            features: t.freemium.features,
            popular: false,
            cta: t.subscribe
        },
        {
            id: 'plus',
            name: t.plus.name,
            description: t.plus.description,
            icon: Zap,
            color: 'from-blue-500 to-blue-600',
            priceMonthly: 97,
            priceAnnual: 970,
            stripePriceIdMonthly: 'price_1SgmeqRo0dVPpa4WwvshBsl0',
            stripePriceIdAnnual: 'price_1SgmffRo0dVPpa4WzECFaiEL',
            features: t.plus.features,
            popular: false,
            cta: t.subscribe
        },
        {
            id: 'pro',
            name: t.pro.name,
            description: t.pro.description,
            icon: Crown,
            color: 'from-[#D4AF37] to-[#B8860B]',
            priceMonthly: 397,
            priceAnnual: 3970,
            stripePriceIdMonthly: 'price_1SgmgTRo0dVPpa4WvKYlYGeZ',
            stripePriceIdAnnual: 'price_1SgmgnRo0dVPpa4WDwZwIari',
            features: t.pro.features,
            popular: true,
            cta: t.subscribe
        },
        {
            id: 'teams',
            name: t.teams.name,
            description: t.teams.description,
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            priceMonthly: 1497,
            priceAnnual: 14970,
            stripePriceIdMonthly: 'price_1SgmhJRo0dVPpa4W3H4jN37E',
            stripePriceIdAnnual: 'price_1SgmhvRo0dVPpa4WWMA34UFU',
            features: t.teams.features,
            popular: false,
            cta: t.subscribe
        },
        {
            id: 'enterprise',
            name: t.enterprise.name,
            description: t.enterprise.description,
            icon: Building2,
            color: 'from-[#002D62] to-[#001d42]',
            priceMonthly: null,
            priceAnnual: null,
            stripePriceIdMonthly: null,
            stripePriceIdAnnual: null,
            features: t.enterprise.features,
            popular: false,
            cta: t.contactUs
        }
    ];

    const getPriceDisplay = (plan) => {
        if (plan.id === 'freemium') {
            return t.freemium.price;
        }
        if (plan.id === 'enterprise') {
            return t.enterprise.price;
        }

        const price = billing === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
        const period = billing === 'monthly' ? t.perMonth : t.perYear;
        
        return `R$ ${price.toLocaleString('pt-BR')}${period}`;
    };

    const getSavings = (plan) => {
        if (!plan.priceMonthly || !plan.priceAnnual) return null;
        const monthlyYearly = plan.priceMonthly * 12;
        const savings = Math.round(((monthlyYearly - plan.priceAnnual) / monthlyYearly) * 100);
        return savings;
    };

    const isCurrentPlan = (planId) => {
        if (!currentSubscription) return planId === 'freemium';
        
        const priceId = currentSubscription.stripe_price_id;
        const plan = plans.find(p => 
            p.stripePriceIdMonthly === priceId || 
            p.stripePriceIdAnnual === priceId
        );
        
        return plan?.id === planId;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link to={createPageUrl('Home')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">MT</span>
                            </div>
                            <span className="font-bold text-[#002D62]">Troyjo Digital Twin</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                        >
                            <Globe className="w-4 h-4" />
                            {lang === 'pt' ? 'EN' : 'PT'}
                        </button>
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm">
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-16">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-[#002D62] mb-4">
                        {t.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        {t.subtitle}
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-[#002D62]' : 'text-gray-500'}`}>
                            {t.monthly}
                        </span>
                        <button
                            onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
                            className={`relative w-14 h-7 rounded-full transition-colors ${
                                billing === 'annual' ? 'bg-[#002D62]' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                                    billing === 'annual' ? 'translate-x-7' : ''
                                }`}
                            />
                        </button>
                        <span className={`text-sm font-medium ${billing === 'annual' ? 'text-[#002D62]' : 'text-gray-500'}`}>
                            {t.annual}
                        </span>
                        {billing === 'annual' && (
                            <Badge className="bg-green-100 text-green-800">
                                {t.save} 15-20%
                            </Badge>
                        )}
                    </div>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        const isActive = isCurrentPlan(plan.id);
                        const savings = billing === 'annual' ? getSavings(plan) : null;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`h-full flex flex-col relative ${
                                    plan.popular ? 'border-[#D4AF37] border-2 shadow-lg' : ''
                                } ${isActive ? 'ring-2 ring-[#002D62]' : ''}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-[#D4AF37] text-white">
                                                <Star className="w-3 h-3 mr-1" />
                                                {t.popular}
                                            </Badge>
                                        </div>
                                    )}
                                    {isActive && (
                                        <div className="absolute -top-4 right-4">
                                            <Badge className="bg-[#002D62] text-white">
                                                <Check className="w-3 h-3 mr-1" />
                                                {t.currentPlan}
                                            </Badge>
                                        </div>
                                    )}

                                    <CardHeader>
                                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <CardTitle className="text-2xl text-[#002D62]">
                                            {plan.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {plan.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <div className="mb-6">
                                            <div className="text-3xl font-bold text-[#002D62]">
                                                {getPriceDisplay(plan)}
                                            </div>
                                            {plan.id !== 'freemium' && plan.id !== 'enterprise' && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {t.billed} {billing === 'monthly' ? t.monthly_ : t.annually}
                                                </div>
                                            )}
                                            {savings && (
                                                <Badge variant="outline" className="mt-2 border-green-500 text-green-700">
                                                    {t.save} {savings}%
                                                </Badge>
                                            )}
                                        </div>

                                        <ul className="space-y-3">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        {plan.id === 'enterprise' ? (
                                            <Button
                                                onClick={handleContactSales}
                                                className={`w-full bg-gradient-to-r ${plan.color} text-white`}
                                            >
                                                <Mail className="w-4 h-4 mr-2" />
                                                {plan.cta}
                                            </Button>
                                        ) : isActive ? (
                                            <Button
                                                disabled
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                {t.currentPlan}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => {
                                                    const priceId = billing === 'monthly' 
                                                        ? plan.stripePriceIdMonthly 
                                                        : plan.stripePriceIdAnnual;
                                                    handleSubscribe(priceId, plan.id);
                                                }}
                                                disabled={subscribing === plan.id || loading}
                                                className={`w-full ${
                                                    plan.popular 
                                                        ? `bg-gradient-to-r ${plan.color} text-white` 
                                                        : ''
                                                }`}
                                            >
                                                {subscribing === plan.id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        {t.loading}
                                                    </>
                                                ) : (
                                                    <>
                                                        {plan.cta}
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <h2 className="text-3xl font-bold text-[#002D62] mb-4">
                        {lang === 'pt' ? 'Perguntas Frequentes' : 'Frequently Asked Questions'}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {lang === 'pt' 
                            ? 'Tem dúvidas? Estamos aqui para ajudar.' 
                            : 'Have questions? We\'re here to help.'}
                    </p>
                    <Link to={createPageUrl('KnowledgeBase')}>
                        <Button variant="outline" className="gap-2">
                            {lang === 'pt' ? 'Ver Base de Conhecimento' : 'View Knowledge Base'}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white py-8">
                <div className="max-w-7xl mx-auto px-4 md:px-6 text-center text-sm text-gray-600">
                    <p>© 2025 Marcos Troyjo Digital Twin</p>
                    <p className="mt-2">
                        {lang === 'pt' 
                            ? 'Desenvolvido por Grupo Fratoz. Powered by CAIO.Vision.' 
                            : 'Developed by Grupo Fratoz. Powered by CAIO.Vision.'}
                    </p>
                </div>
            </footer>
        </div>
    );
}