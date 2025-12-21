import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, Globe, TrendingUp, BookOpen, Calendar, 
    LayoutDashboard, MessageSquare, Mail, Sparkles, Users,
    Target, Award, ExternalLink, Menu, X, CheckCircle, Zap,
    Shield, Database, Brain, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArticleCard from '@/components/editorial/ArticleCard';
import EditorialCard from '@/components/editorial/EditorialCard';
import TroyjoLogo from '@/components/branding/TroyjoLogo';
import { toast } from 'sonner';

const translations = {
    pt: {
        hero: {
            badge: 'Powered by AI',
            title: 'Geopolítica, tecnologia e Brasil em posição de ataque.',
            subtitle: 'Análises assinadas por Marcos Troyjo, com suporte de inteligência artificial estratégica.',
            cta1: 'Começar Consulta',
            cta2: 'Ver Artigos'
        },
        capabilities: {
            title: 'Capacidades do Sistema',
            subtitle: 'Tecnologia avançada de IA aplicada à análise geopolítica',
            items: [
                { icon: Brain, title: 'Adaptação de Persona', desc: 'Comunicação ajustada ao seu perfil' },
                { icon: Database, title: 'Base de Conhecimento', desc: 'Pensamento público até dez/2025' },
                { icon: BarChart3, title: 'Análise de Documentos', desc: 'Upload e chat com PDFs/DOCX' },
                { icon: Shield, title: 'Monitor de Riscos', desc: 'Alertas geopolíticos personalizados' }
            ]
        },
        evolution: {
            title: 'Evolução Conceitual',
            subtitle: 'Neologismos e conceitos desenvolvidos ao longo da carreira',
            concepts: [
                { year: '2003', term: 'Tecnodiplomacia', desc: 'Tecnologia como ferramenta diplomática' },
                { year: '2007', term: 'Nação-Comerciante', desc: 'Estado como agente comercial estratégico' },
                { year: '2016', term: 'Desglobalização', desc: 'Retração dos fluxos globais' },
                { year: '2022', term: 'Trading Up', desc: 'Posicionamento estratégico no comércio global' }
            ]
        },
        audience: {
            title: 'Audiências-Alvo',
            subtitle: 'Conteúdo especializado para diferentes perfis de decisores',
            segments: [
                { icon: Shield, title: 'Defesa', desc: 'Análise de segurança e estratégia militar' },
                { icon: Users, title: 'Diplomatas', desc: 'Inteligência geopolítica e relações internacionais' },
                { icon: TrendingUp, title: 'Indústria', desc: 'Competitividade e cadeias de valor' },
                { icon: BookOpen, title: 'Academia', desc: 'Pesquisa e debate teórico' }
            ]
        },
        expertise: {
            title: 'Áreas de Expertise',
            items: [
                'Economia Global',
                'Comércio Internacional',
                'BRICS & Emergentes',
                'Diplomacia Econômica',
                'Inovação & Tecnologia'
            ]
        },
        vision: {
            title: 'Visão de Futuro',
            items: [
                'Brasil como potência em alimentos, energia e sustentabilidade',
                'Novo ESG: Economia + Segurança + Geopolítica',
                'Competitividade através da inovação tecnológica',
                'Integração estratégica nos BRICS+',
                'Diplomacia econômica pragmática e sem viés ideológico'
            ]
        },
        credentials: {
            title: 'Credenciais',
            positions: [
                'Presidente do Novo Banco de Desenvolvimento (NDB) 2020-2023',
                'Secretário de Comércio Exterior do Brasil',
                'Professor Visitante na Columbia University',
                'Presidente do BRICLab'
            ],
            awards: [
                'Grande Oficial da Ordem do Rio Branco',
                'Personalidade do Comércio Exterior (FUNCEX 2020)',
                'TOYP World (2004)'
            ]
        },
        articles: {
            title: 'Artigos em Destaque',
            all: 'Todos',
            certified: '© Troyjo',
            verified: 'Verificado',
            loading: 'Carregando...',
            viewAll: 'Ver todos os artigos'
        },
        calendar: {
            title: 'Calendário Editorial',
            nextWeeks: 'Próximas Semanas',
            daily: 'Conteúdo Diário',
            noItems: 'Nenhum item programado'
        },
        blog: {
            title: 'Inteligência Estratégica',
            articleTitle: 'Como Escolher Ferramentas de Inteligência para o C-Suite',
            date: '8 de Dezembro, 2025',
            readMore: 'Ler artigo completo'
        },
        newsletter: {
            title: 'Newsletter',
            subtitle: 'Receba análises semanais diretamente no seu e-mail',
            email: 'Seu e-mail',
            subscribe: 'Assinar',
            success: 'Inscrição realizada com sucesso!'
        },
        nav: {
            dashboard: 'Painel',
            consultation: 'Consulta',
            menu: 'Menu'
        }
    },
    en: {
        hero: {
            badge: 'Powered by AI',
            title: 'Geopolitics, technology and Brazil on the offensive.',
            subtitle: 'Analysis by Marcos Troyjo, powered by strategic artificial intelligence.',
            cta1: 'Start Consultation',
            cta2: 'View Articles'
        },
        capabilities: {
            title: 'System Capabilities',
            subtitle: 'Advanced AI technology applied to geopolitical analysis',
            items: [
                { icon: Brain, title: 'Persona Adaptation', desc: 'Communication adjusted to your profile' },
                { icon: Database, title: 'Knowledge Base', desc: 'Public thinking until Dec/2025' },
                { icon: BarChart3, title: 'Document Analysis', desc: 'Upload and chat with PDFs/DOCX' },
                { icon: Shield, title: 'Risk Monitor', desc: 'Personalized geopolitical alerts' }
            ]
        },
        evolution: {
            title: 'Conceptual Evolution',
            subtitle: 'Neologisms and concepts developed throughout career',
            concepts: [
                { year: '2003', term: 'Technodiplomacy', desc: 'Technology as diplomatic tool' },
                { year: '2007', term: 'Trading Nation', desc: 'State as strategic commercial agent' },
                { year: '2016', term: 'Deglobalization', desc: 'Retraction of global flows' },
                { year: '2022', term: 'Trading Up', desc: 'Strategic positioning in global trade' }
            ]
        },
        audience: {
            title: 'Target Audiences',
            subtitle: 'Specialized content for different decision-maker profiles',
            segments: [
                { icon: Shield, title: 'Defense', desc: 'Security and military strategy analysis' },
                { icon: Users, title: 'Diplomats', desc: 'Geopolitical intelligence and international relations' },
                { icon: TrendingUp, title: 'Industry', desc: 'Competitiveness and value chains' },
                { icon: BookOpen, title: 'Academia', desc: 'Research and theoretical debate' }
            ]
        },
        expertise: {
            title: 'Areas of Expertise',
            items: [
                'Global Economics',
                'International Trade',
                'BRICS & Emerging Markets',
                'Economic Diplomacy',
                'Innovation & Technology'
            ]
        },
        vision: {
            title: 'Future Vision',
            items: [
                'Brazil as a power in food, energy and sustainability',
                'New ESG: Economy + Security + Geopolitics',
                'Competitiveness through technological innovation',
                'Strategic integration in BRICS+',
                'Pragmatic economic diplomacy without ideological bias'
            ]
        },
        credentials: {
            title: 'Credentials',
            positions: [
                'President of New Development Bank (NDB) 2020-2023',
                'Secretary of Foreign Trade of Brazil',
                'Visiting Professor at Columbia University',
                'President of BRICLab'
            ],
            awards: [
                'Grand Officer of the Order of Rio Branco',
                'Foreign Trade Personality (FUNCEX 2020)',
                'TOYP World (2004)'
            ]
        },
        articles: {
            title: 'Featured Articles',
            all: 'All',
            certified: '© Troyjo',
            verified: 'Verified',
            loading: 'Loading...',
            viewAll: 'View all articles'
        },
        calendar: {
            title: 'Editorial Calendar',
            nextWeeks: 'Next Weeks',
            daily: 'Daily Content',
            noItems: 'No items scheduled'
        },
        blog: {
            title: 'Strategic Intelligence',
            articleTitle: 'How to Choose Intelligence Tools for the C-Suite',
            date: 'December 8, 2025',
            readMore: 'Read full article'
        },
        newsletter: {
            title: 'Newsletter',
            subtitle: 'Receive weekly analysis directly in your inbox',
            email: 'Your email',
            subscribe: 'Subscribe',
            success: 'Successfully subscribed!'
        },
        nav: {
            dashboard: 'Dashboard',
            consultation: 'Consultation',
            menu: 'Menu'
        }
    }
};

export default function Homepage() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [backlogItems, setBacklogItems] = useState([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [tierFilter, setTierFilter] = useState('all');
    const [heroSlide, setHeroSlide] = useState(0);
    const t = translations[lang];

    const heroSlides = [
        {
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920',
            quote: lang === 'pt' ? '"O mundo está em transformação permanente"' : '"The world is in permanent transformation"'
        },
        {
            image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1920',
            quote: lang === 'pt' ? '"Competitividade é a chave estratégica"' : '"Competitiveness is the strategic key"'
        },
        {
            image: 'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=1920',
            quote: lang === 'pt' ? '"Brasil como ator protagonista"' : '"Brazil as a leading actor"'
        }
    ];

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
        loadContent();
    }, [lang]);

    useEffect(() => {
        const timer = setInterval(() => {
            setHeroSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const loadContent = async () => {
        setIsLoading(true);
        try {
            const [articles, calendar] = await Promise.all([
                base44.entities.Article.filter({ status: 'publicado' }),
                base44.entities.EditorialCalendarItem.filter({})
            ]);
            
            const sortedArticles = articles.sort((a, b) => {
                const tierOrder = { troyjo_certified: 3, curator_approved: 2, ai_generated: 1 };
                const tierDiff = (tierOrder[b.quality_tier] || 0) - (tierOrder[a.quality_tier] || 0);
                if (tierDiff !== 0) return tierDiff;
                return new Date(b.publication_date) - new Date(a.publication_date);
            });
            
            setFeaturedArticles(sortedArticles.slice(0, 6));
            setBacklogItems(calendar.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)));
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        try {
            await base44.integrations.Core.SendEmail({
                to: 'contact@troyjo.digital',
                subject: 'Nova Inscrição - Newsletter',
                body: `Novo inscrito: ${email}`
            });
            toast.success(t.newsletter.success);
            setEmail('');
        } catch (error) {
            console.error('Error subscribing:', error);
            toast.error(lang === 'pt' ? 'Erro ao inscrever' : 'Error subscribing');
        }
    };

    const nextWeekItems = backlogItems.filter(item => 
        item.type === 'artigo_longo' || item.type === 'relatorio' || item.type === 'policy_paper'
    ).slice(0, 6);

    const dailyItems = backlogItems.filter(item => 
        item.type === 'post_linkedin' || item.type === 'nota_curta' || 
        item.type === 'grafico' || item.type === 'thread'
    ).slice(0, 8);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TroyjoLogo size={40} />
                        <div className="hidden sm:block">
                            <span className="font-bold text-[#002D62]">Troyjo</span>
                            <span className="text-[#333F48] text-sm ml-2">Digital Twin</span>
                        </div>
                    </div>
                    
                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                {t.nav.dashboard}
                            </Button>
                        </Link>
                        <Link to={createPageUrl('Consultation')}>
                            <Button size="sm" className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                                <MessageSquare className="w-4 h-4" />
                                {t.nav.consultation}
                            </Button>
                        </Link>
                        <button
                            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                        >
                            <Globe className="w-4 h-4" />
                            {lang === 'pt' ? 'EN' : 'PT'}
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t bg-white"
                        >
                            <div className="p-4 space-y-2">
                                <Link to={createPageUrl('Dashboard')}>
                                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                                        <LayoutDashboard className="w-4 h-4" />
                                        {t.nav.dashboard}
                                    </Button>
                                </Link>
                                <Link to={createPageUrl('Consultation')}>
                                    <Button size="sm" className="w-full bg-[#002D62] hover:bg-[#001d42] gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        {t.nav.consultation}
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Hero with Carousel */}
            <section className="relative h-[600px] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={heroSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${heroSlides[heroSlide].image})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#002D62]/95 to-[#002D62]/70" />
                        </div>
                        <div className="relative h-full flex items-center">
                            <div className="max-w-6xl mx-auto px-4 md:px-6 text-white">
                                <Badge className="bg-[#B8860B] text-white mb-6">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    {t.hero.badge}
                                </Badge>
                                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                                    {t.hero.title}
                                </h1>
                                <p className="text-xl mb-2 max-w-3xl">
                                    {t.hero.subtitle}
                                </p>
                                <p className="text-2xl italic mb-8 text-[#D4AF37]">
                                    {heroSlides[heroSlide].quote}
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link to={createPageUrl('Consultation')}>
                                        <Button size="lg" className="bg-white text-[#002D62] hover:bg-gray-100 gap-2">
                                            <MessageSquare className="w-5 h-5" />
                                            {t.hero.cta1}
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })}>
                                        <BookOpen className="w-5 h-5 mr-2" />
                                        {t.hero.cta2}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {heroSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setHeroSlide(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                idx === heroSlide ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </section>

            {/* Capabilities */}
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-3">{t.capabilities.title}</h2>
                        <p className="text-[#333F48]">{t.capabilities.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {t.capabilities.items.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="w-12 h-12 rounded-lg bg-[#002D62] flex items-center justify-center mb-4">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="font-semibold text-[#002D62] mb-2">{item.title}</h3>
                                            <p className="text-sm text-[#333F48]">{item.desc}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Conceptual Evolution */}
            <section className="py-16 px-4 md:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-3">{t.evolution.title}</h2>
                        <p className="text-[#333F48]">{t.evolution.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {t.evolution.concepts.map((concept, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100"
                            >
                                <Badge className="mb-3">{concept.year}</Badge>
                                <h3 className="font-bold text-[#8B1538] mb-2">{concept.term}</h3>
                                <p className="text-sm text-[#333F48]">{concept.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Target Audiences */}
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-3">{t.audience.title}</h2>
                        <p className="text-[#333F48]">{t.audience.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {t.audience.segments.map((segment, idx) => {
                            const Icon = segment.icon;
                            return (
                                <Card key={idx} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 rounded-full bg-[#00654A]/10 flex items-center justify-center mx-auto mb-4">
                                            <Icon className="w-8 h-8 text-[#00654A]" />
                                        </div>
                                        <h3 className="font-semibold text-[#002D62] mb-2">{segment.title}</h3>
                                        <p className="text-sm text-[#333F48]">{segment.desc}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Expertise & Vision */}
            <section className="py-16 px-4 md:px-6 bg-gradient-to-br from-[#002D62] to-[#00654A] text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">{t.expertise.title}</h2>
                            <ul className="space-y-3">
                                {t.expertise.items.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-6">{t.vision.title}</h2>
                            <ul className="space-y-3">
                                {t.vision.items.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <Zap className="w-5 h-5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                                        <span className="text-sm leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Credentials */}
            <section className="py-16 px-4 md:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-[#002D62] mb-8 text-center">{t.credentials.title}</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-[#002D62] mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                {lang === 'pt' ? 'Posições Principais' : 'Main Positions'}
                            </h3>
                            <ul className="space-y-2">
                                {t.credentials.positions.map((pos, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-[#333F48]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#002D62] mt-2" />
                                        {pos}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-[#002D62] mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                {lang === 'pt' ? 'Reconhecimentos' : 'Awards'}
                            </h3>
                            <ul className="space-y-2">
                                {t.credentials.awards.map((award, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-[#333F48]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-2" />
                                        {award}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Articles */}
            <section id="articles" className="py-16 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-[#002D62]">{t.articles.title}</h2>
                        <div className="flex gap-2">
                            <Button
                                variant={tierFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTierFilter('all')}
                            >
                                {t.articles.all}
                            </Button>
                            <Button
                                variant={tierFilter === 'troyjo_certified' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTierFilter('troyjo_certified')}
                                className={tierFilter === 'troyjo_certified' ? 'bg-[#B8860B] hover:bg-[#9a7209]' : ''}
                            >
                                {t.articles.certified}
                            </Button>
                            <Button
                                variant={tierFilter === 'curator_approved' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTierFilter('curator_approved')}
                            >
                                {t.articles.verified}
                            </Button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="text-center py-12 text-[#333F48]/60">{t.articles.loading}</div>
                    ) : (() => {
                        const filtered = tierFilter === 'all' 
                            ? featuredArticles 
                            : featuredArticles.filter(a => a.quality_tier === tierFilter);
                        
                        return filtered.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map((article, index) => (
                                    <ArticleCard key={article.id} article={article} lang={lang} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-[#333F48]/60">
                                {lang === 'pt' ? 'Nenhum artigo nesta categoria' : 'No articles in this category'}
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* Editorial Calendar */}
            <section className="py-16 px-4 md:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <Calendar className="w-8 h-8 text-[#002D62]" />
                        <h2 className="text-3xl font-bold text-[#002D62]">{t.calendar.title}</h2>
                    </div>
                    
                    <Tabs defaultValue="next_weeks" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="next_weeks">{t.calendar.nextWeeks}</TabsTrigger>
                            <TabsTrigger value="daily">{t.calendar.daily}</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="next_weeks">
                            {nextWeekItems.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {nextWeekItems.map((item, index) => (
                                        <EditorialCard key={item.id} item={item} lang={lang} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-[#333F48]/60">{t.calendar.noItems}</div>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="daily">
                            {dailyItems.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {dailyItems.map((item, index) => (
                                        <EditorialCard key={item.id} item={item} lang={lang} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-[#333F48]/60">{t.calendar.noItems}</div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* Strategic Intelligence Blog */}
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-[#002D62] mb-8">{t.blog.title}</h2>
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <Badge className="mb-3">{t.blog.date}</Badge>
                                    <h3 className="text-2xl font-bold text-[#8B1538] mb-4">{t.blog.articleTitle}</h3>
                                    <p className="text-[#333F48] mb-4">
                                        {lang === 'pt' 
                                            ? 'No cenário empresarial moderno, executivos dependem cada vez mais de sistemas de inteligência estratégica. Explore as principais considerações ao selecionar plataformas de análise.'
                                            : 'In the modern business landscape, executives increasingly rely on strategic intelligence systems. Explore key considerations when selecting analysis platforms.'}
                                    </p>
                                    <Link to={createPageUrl('StrategicIntelligenceBlog')}>
                                        <Button variant="outline" className="gap-2">
                                            {t.blog.readMore}
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Newsletter */}
            <section id="newsletter" className="py-16 px-4 md:px-6 bg-gradient-to-br from-[#002D62] to-[#00654A]">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">{t.newsletter.title}</h2>
                    <p className="text-white/90 mb-6">{t.newsletter.subtitle}</p>
                    <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.newsletter.email}
                            className="bg-white"
                            required
                        />
                        <Button type="submit" variant="secondary" className="gap-2">
                            <Mail className="w-4 h-4" />
                            {t.newsletter.subscribe}
                        </Button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 md:px-6 bg-white border-t">
                <div className="max-w-7xl mx-auto text-center text-sm text-[#333F48]/70">
                    <p>© 2025 Marcos Prado Troyjo Digital Twin</p>
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