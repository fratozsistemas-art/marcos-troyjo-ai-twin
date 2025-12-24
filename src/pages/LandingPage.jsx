import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
    ArrowRight, CheckCircle, Globe, BookOpen, MessageSquare, 
    BarChart3, Shield, Zap, Users, Star, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');

    const supportedLangs = ['pt', 'en', 'zh', 'ar', 'ru', 'hi', 'fr', 'es'];
    const langNames = {
        pt: 'Português',
        en: 'English',
        zh: '中文',
        ar: 'العربية',
        ru: 'Русский',
        hi: 'हिन्दी',
        fr: 'Français',
        es: 'Español'
    };

    const t = {
        pt: {
            hero: {
                badge: 'Lançamento BETA',
                title: 'Expertise Geopolítica Mundial',
                subtitle: 'Agora Disponível 24/7 via IA',
                description: 'Acesse o conhecimento de Marcos Troyjo, ex-presidente do Banco do BRICS, com 95%+ de fidelidade HUA-validada.',
                cta: 'Começar Agora',
                demo: 'Ver Demonstração'
            },
            features: {
                title: 'Recursos Avançados',
                subtitle: 'Tudo que você precisa para análise geopolítica de classe mundial',
                items: [
                    { icon: MessageSquare, title: 'Consultas Inteligentes', desc: 'Perguntas e respostas em tempo real com contexto histórico' },
                    { icon: BookOpen, title: 'Base de Conhecimento', desc: 'Acesso a décadas de pesquisas e publicações' },
                    { icon: BarChart3, title: 'Analytics Avançado', desc: 'Visualizações e insights de dados geopolíticos' },
                    { icon: Shield, title: 'Protocolo AEGIS', desc: 'Segurança e validação de respostas' },
                    { icon: Zap, title: 'Respostas Rápidas', desc: 'Processamento em tempo real via IA' },
                    { icon: Users, title: 'Multi-Personas', desc: 'Adapta-se ao seu contexto e necessidades' }
                ]
            },
            personas: {
                title: 'Para Cada Público',
                subtitle: 'Experiência personalizada baseada em quem você é',
                items: [
                    { title: 'Executivos', desc: 'Insights estratégicos para tomada de decisão' },
                    { title: 'Acadêmicos', desc: 'Análises profundas com referências' },
                    { title: 'Estudantes', desc: 'Explicações didáticas e acessíveis' },
                    { title: 'Jornalistas', desc: 'Contexto histórico e dados verificados' }
                ]
            },
            stats: {
                title: 'Números que Impressionam',
                items: [
                    { value: '95%+', label: 'Fidelidade HUA' },
                    { value: '24/7', label: 'Disponibilidade' },
                    { value: '11', label: 'Neologismos Únicos' },
                    { value: '2020-2023', label: 'Presidente NDB' }
                ]
            },
            cta: {
                title: 'Pronto para Começar?',
                subtitle: 'Junte-se a líderes globais que já utilizam o Troyjo Twin',
                button: 'Iniciar Gratuitamente'
            }
        },
        en: {
            hero: {
                badge: 'BETA Launch',
                title: 'World-Class Geopolitical Expertise',
                subtitle: 'Now Available 24/7 via AI',
                description: 'Access Marcos Troyjo\'s knowledge, former BRICS Bank president, with 95%+ HUA-validated fidelity.',
                cta: 'Get Started',
                demo: 'View Demo'
            },
            features: {
                title: 'Advanced Features',
                subtitle: 'Everything you need for world-class geopolitical analysis',
                items: [
                    { icon: MessageSquare, title: 'Smart Consultations', desc: 'Real-time Q&A with historical context' },
                    { icon: BookOpen, title: 'Knowledge Base', desc: 'Access to decades of research and publications' },
                    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Geopolitical data visualizations and insights' },
                    { icon: Shield, title: 'AEGIS Protocol', desc: 'Security and response validation' },
                    { icon: Zap, title: 'Fast Responses', desc: 'Real-time AI processing' },
                    { icon: Users, title: 'Multi-Personas', desc: 'Adapts to your context and needs' }
                ]
            },
            personas: {
                title: 'For Every Audience',
                subtitle: 'Personalized experience based on who you are',
                items: [
                    { title: 'Executives', desc: 'Strategic insights for decision-making' },
                    { title: 'Academics', desc: 'Deep analysis with references' },
                    { title: 'Students', desc: 'Educational and accessible explanations' },
                    { title: 'Journalists', desc: 'Historical context and verified data' }
                ]
            },
            stats: {
                title: 'Impressive Numbers',
                items: [
                    { value: '95%+', label: 'HUA Fidelity' },
                    { value: '24/7', label: 'Availability' },
                    { value: '11', label: 'Unique Neologisms' },
                    { value: '2020-2023', label: 'NDB President' }
                ]
            },
            cta: {
                title: 'Ready to Start?',
                subtitle: 'Join global leaders already using Troyjo Twin',
                button: 'Start Free'
            }
        }
    };

    const text = t[lang];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/7b4794e58_CapturadeTela2025-12-23s93044PM.png"
                                alt="MT Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="font-bold text-[#002D62] text-lg">Troyjo Twin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-[#002D62] bg-white hover:bg-gray-50 transition-all text-sm font-medium">
                                <Globe className="w-4 h-4 text-[#002D62]" />
                                <span>{langNames[lang]}</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[180px]">
                                {supportedLangs.map(l => (
                                    <button
                                        key={l}
                                        onClick={() => {
                                            setLang(l);
                                            localStorage.setItem('troyjo_lang', l);
                                        }}
                                        className={`w-full text-left px-4 py-3 hover:bg-[#002D62] hover:text-white transition-colors ${
                                            lang === l ? 'bg-[#002D62]/5 text-[#002D62] font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                        {langNames[l]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Link to={createPageUrl('Home')}>
                            <Button className="bg-[#002D62] hover:bg-[#001d42]">
                                {text.hero.cta}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-32 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge className="mb-6 bg-[#002D62] text-white">{text.hero.badge}</Badge>
                            <h1 className="text-5xl md:text-7xl font-bold text-[#002D62] mb-6 leading-tight">
                                {text.hero.title}
                            </h1>
                            <p className="text-2xl md:text-3xl text-gray-600 mb-4">
                                {text.hero.subtitle}
                            </p>
                            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
                                {text.hero.description}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link to={createPageUrl('Home')}>
                                    <Button size="lg" className="bg-[#002D62] hover:bg-[#001d42] text-lg px-8 py-6">
                                        {text.hero.cta}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Link to={createPageUrl('Website')}>
                                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-[#002D62] text-[#002D62]">
                                        {text.hero.demo}
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-[#002D62]">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">{text.stats.title}</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {text.stats.items.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold text-[#D4AF37] mb-2">{stat.value}</div>
                                <div className="text-white/80">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#002D62] mb-4">{text.features.title}</h2>
                        <p className="text-lg text-gray-600">{text.features.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {text.features.items.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-all border-gray-200 hover:border-[#002D62]">
                                        <CardHeader>
                                            <div className="w-12 h-12 rounded-xl bg-[#002D62]/10 flex items-center justify-center mb-4">
                                                <Icon className="w-6 h-6 text-[#002D62]" />
                                            </div>
                                            <CardTitle className="text-xl">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600">{feature.desc}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Personas Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#002D62] mb-4">{text.personas.title}</h2>
                        <p className="text-lg text-gray-600">{text.personas.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {text.personas.items.map((persona, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="text-center p-6 hover:shadow-lg transition-all">
                                    <div className="w-16 h-16 rounded-full bg-[#00654A]/10 flex items-center justify-center mx-auto mb-4">
                                        <Star className="w-8 h-8 text-[#00654A]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#002D62] mb-2">{persona.title}</h3>
                                    <p className="text-sm text-gray-600">{persona.desc}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#002D62] to-[#00654A]">
                <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">{text.cta.title}</h2>
                    <p className="text-xl text-white/80 mb-8">{text.cta.subtitle}</p>
                    <Link to={createPageUrl('Home')}>
                        <Button size="lg" className="bg-white text-[#002D62] hover:bg-gray-100 text-lg px-8 py-6">
                            {text.cta.button}
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                    <p className="text-gray-400">
                        © 2025 Troyjo Twin. {lang === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
                    </p>
                </div>
            </footer>
        </div>
    );
}