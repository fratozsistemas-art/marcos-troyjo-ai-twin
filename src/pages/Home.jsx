import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
    ArrowRight, Globe, TrendingUp, Building2, Landmark, BookOpen, 
    MessageSquare, LayoutDashboard, Sparkles, Eye, Newspaper, Activity,
    BarChart3, FileText, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TroyjoLogo from '@/components/branding/TroyjoLogo';
import NeologismShowcase from '@/components/neologisms/NeologismShowcase';
import AudienceSegmentation from '@/components/audience/AudienceSegmentation';
import ConceptEvolutionTimeline from '@/components/neologisms/ConceptEvolutionTimeline';

const translations = {
    pt: {
        title: "Seu Analista Geopolítico Pessoal",
        subtitle: "Disponível 24 horas por dia, 7 dias por semana",
        tagline: "Marcos Troyjo · Economista · Ex-Presidente do Banco do BRICS",
        cta: "Iniciar Consulta",
        topics: "Áreas de Expertise",
        topicsList: [
            { icon: Globe, title: "Economia Global", desc: "Análise das dinâmicas geoeconômicas contemporâneas" },
            { icon: TrendingUp, title: "Comércio Internacional", desc: "Estratégias para inserção competitiva global" },
            { icon: Building2, title: "BRICS & Emergentes", desc: "O futuro das economias em desenvolvimento" },
            { icon: Landmark, title: "Diplomacia Econômica", desc: "Negociações e acordos multilaterais" }
        ]
    },
    en: {
        title: "Your Personal Geopolitical Analyst",
        subtitle: "Available 24/7",
        tagline: "Marcos Troyjo · Economist · Former BRICS Bank President",
        cta: "Start Consultation",
        topics: "Areas of Expertise",
        topicsList: [
            { icon: Globe, title: "Global Economics", desc: "Analysis of contemporary geoeconomic dynamics" },
            { icon: TrendingUp, title: "International Trade", desc: "Strategies for competitive global insertion" },
            { icon: Building2, title: "BRICS & Emerging Markets", desc: "The future of developing economies" },
            { icon: Landmark, title: "Economic Diplomacy", desc: "Multilateral negotiations and agreements" }
        ]
    }
};

export default function Home() {
    const navigate = useNavigate();
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [recentInsights, setRecentInsights] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        redirectIfFirstTime();
        loadDashboardStats();
        loadRecentInsights();
    }, []);

    const redirectIfFirstTime = async () => {
        try {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) {
                navigate(createPageUrl('PublicHome'));
                return;
            }

            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            
            if (profiles.length === 0 || !user.onboarding_completed) {
                navigate(createPageUrl('Welcome'));
            }
        } catch (error) {
            console.error('Error checking first time:', error);
        }
    };

    const loadDashboardStats = async () => {
        try {
            const user = await base44.auth.me();
            const [conversations, documents, interactions] = await Promise.all([
                base44.agents.listConversations({ agent_name: "troyjo_twin" }),
                base44.entities.Document.filter({ created_by: user.email }),
                base44.entities.UserInteraction.filter({ user_email: user.email })
            ]);

            setDashboardStats({
                conversations: conversations?.length || 0,
                documents: documents?.length || 0,
                insights: interactions?.length || 0,
                lastActivity: interactions?.[0]?.created_date || null
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const loadRecentInsights = async () => {
        try {
            const articles = await base44.entities.Article.list('-created_date', 5);
            setRecentInsights(articles || []);
        } catch (error) {
            console.error('Error loading insights:', error);
        }
    };

    const t = translations[lang];

    const slides = [
        {
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/8c955389f_Replace_the_transparent_checkered_background_with_-1765063055494.png",
            type: "photo",
            quote: lang === 'pt' 
                ? "Temos todas as cartas na mão, mas só jogaremos bem se fizermos a lição de casa antes do colapso."
                : "We have all the cards in hand, but we will only play well if we do our homework before the collapse."
        },
        {
            image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/b0d511c23_Edit_the_image_with_a_subtle_integration_of_gold_a-1765055553586.png",
            type: "digital",
            quote: lang === 'pt'
                ? "Competitividade não se declara, se constrói — com educação, infraestrutura e abertura"
                : "Competitiveness is not declared, it is built — with education, infrastructure and openness"
        },
        {
            type: "narrative",
            text: lang === 'pt' 
                ? "Inteligência Geopolítica de Elite, disponível 24/7"
                : "Elite Geopolitical Intelligence, available 24/7"
        }
    ];

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
    }, [lang]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to={createPageUrl('PublicHome')} className="flex items-center gap-3">
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/7b4794e58_CapturadeTela2025-12-23s93044PM.png"
                            alt="MT Logo"
                            className="w-10 h-10 object-cover rounded-md"
                        />
                        <span className="font-bold text-[#002D62] text-lg">Troyjo Twin</span>
                    </Link>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden md:inline">{lang === 'pt' ? 'Painel' : 'Dashboard'}</span>
                            </Button>
                        </Link>
                        <Link to={createPageUrl('PublicHome')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <Globe className="w-4 h-4" />
                                <span className="hidden md:inline">{lang === 'pt' ? 'Página Pública' : 'Public Page'}</span>
                            </Button>
                        </Link>
                        <button
                            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-[#333F48]"
                        >
                            <Globe className="w-4 h-4" />
                            {lang === 'pt' ? 'EN' : 'PT'}
                        </button>
                        <Link to={createPageUrl('Consultation')}>
                            <Button className="bg-[#002D62] hover:bg-[#001d42] text-white gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.cta}</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Quick Stats */}
            <section className="pt-24 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="bg-white hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <MessageSquare className="w-5 h-5 text-[#002D62]" />
                                        <Badge variant="outline" className="text-xs">
                                            {lang === 'pt' ? 'Total' : 'Total'}
                                        </Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-[#002D62]">
                                        {loadingStats ? '...' : dashboardStats?.conversations || 0}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {lang === 'pt' ? 'Consultas Realizadas' : 'Consultations'}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="bg-white hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <FileText className="w-5 h-5 text-[#00654A]" />
                                        <Badge variant="outline" className="text-xs">
                                            {lang === 'pt' ? 'Biblioteca' : 'Library'}
                                        </Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-[#00654A]">
                                        {loadingStats ? '...' : dashboardStats?.documents || 0}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {lang === 'pt' ? 'Documentos Carregados' : 'Documents Loaded'}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="bg-white hover:shadow-lg transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Activity className="w-5 h-5 text-[#D4AF37]" />
                                        <Badge variant="outline" className="text-xs">
                                            {lang === 'pt' ? 'Engajamento' : 'Engagement'}
                                        </Badge>
                                    </div>
                                    <p className="text-2xl font-bold text-[#D4AF37]">
                                        {loadingStats ? '...' : dashboardStats?.insights || 0}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {lang === 'pt' ? 'Interações' : 'Interactions'}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <Link to={createPageUrl('Dashboard')} className="block">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <Card className="bg-gradient-to-br from-[#002D62] to-[#00654A] text-white hover:shadow-xl transition-all h-full">
                                    <CardContent className="p-4 flex flex-col justify-between h-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <LayoutDashboard className="w-5 h-5" />
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold mb-1">
                                                {lang === 'pt' ? 'Meu Painel' : 'My Dashboard'}
                                            </p>
                                            <p className="text-xs opacity-90">
                                                {lang === 'pt' ? 'Ver tudo →' : 'View all →'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Hero */}
            <section className="pt-8 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-medium mb-6">
                                <Sparkles className="w-4 h-4 text-amber-600" />
                                <span className="text-amber-900">
                                    {lang === 'pt' ? 'Contexto Atualizado: Nov/2025' : 'Updated Context: Nov/2025'}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-[#002D62] leading-tight mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? (
                                    <>Líder Global de Pensamento <span className="text-[#D4AF37]">24/7</span></>
                                ) : (
                                    <>Global Thought Leader <span className="text-[#D4AF37]">24/7</span></>
                                )}
                            </h1>
                            <p className="text-xl text-[#2D2D2D] mb-3">
                                {lang === 'pt' 
                                    ? 'De "desglobalização" (2015) a "Novo ESG" (2025): uma década de inovação conceitual'
                                    : 'From "deglobalization" (2015) to "New ESG" (2025): a decade of conceptual innovation'}
                            </p>
                            <p className="text-lg text-[#2D2D2D]/80 mb-6">{t.tagline}</p>
                            <div className="bg-white rounded-lg border-l-4 border-[#D4AF37] p-4 mb-6 max-w-2xl">
                                <p className="text-sm text-[#2D2D2D] leading-relaxed mb-2">
                                    <strong>{lang === 'pt' ? '📊 Atualização Geopolítica (nov/2025):' : '📊 Geopolitical Update (Nov/2025):'}</strong>{' '}
                                    {lang === 'pt'
                                        ? 'Após meses de pico da trumpulência, observamos sinais de estabilização — cessar-fogo tarifário EUA-China, distensão com Brasil.'
                                        : 'After months at peak trumpulence, we observe signs of stabilization — US-China tariff ceasefire, détente with Brazil.'}
                                </p>
                                <Link to={createPageUrl('StrategicIntelligenceBlog')} className="text-xs text-[#002D62] hover:text-[#D4AF37] underline font-medium">
                                    {lang === 'pt' ? 'Ler artigo completo →' : 'Read full article →'}
                                </Link>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <Link to={createPageUrl('Consultation')}>
                                    <Button size="lg" className="bg-[#002D62] hover:bg-[#001d42] text-white gap-2 text-lg px-8 rounded">
                                        {t.cta}
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link to={createPageUrl('PublicHome')}>
                                    <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                                        {lang === 'pt' ? 'Conheça Mais' : 'Learn More'}
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="aspect-square max-w-md mx-auto relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#8B1538]/15 to-[#D4AF37]/15 rounded-2xl transform rotate-6" />
                                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
                                    {slides.map((slide, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0 }}
                                            animate={{ 
                                                opacity: currentSlide === index ? 1 : 0,
                                                scale: currentSlide === index ? 1 : 1.1
                                            }}
                                            transition={{ duration: 0.8 }}
                                            className="absolute inset-0"
                                        >
                                            {slide.type === "narrative" ? (
                                                <div className="w-full h-full bg-gradient-to-br from-[#F5F1E8] via-[#FDFBF7] to-[#F5F1E8] flex items-center justify-center p-12">
                                                    <motion.p 
                                                        className="text-3xl md:text-4xl font-light text-[#8B1538] text-center leading-relaxed"
                                                        style={{ fontFamily: 'Crimson Text, serif' }}
                                                    >
                                                        {slide.text}
                                                    </motion.p>
                                                </div>
                                            ) : (
                                                <>
                                                    <img 
                                                        src={slide.image}
                                                        alt="Marcos Prado Troyjo"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {slide.quote && (
                                                        <>
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#8B1538]/90 via-[#8B1538]/20 to-transparent" />
                                                            <motion.div 
                                                                className="absolute bottom-8 left-8 right-8"
                                                            >
                                                                <BookOpen className="w-8 h-8 text-[#D4AF37] mb-3" />
                                                                <p className="text-white text-lg italic leading-relaxed font-light" style={{ fontFamily: 'Crimson Text, serif' }}>
                                                                    "{slide.quote}"
                                                                </p>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>
                                    ))}
                                    
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                        {slides.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${
                                                    currentSlide === index ? 'bg-white w-8' : 'bg-white/50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Concept Evolution Timeline */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {lang === 'pt' ? 'Evolução Conceitual: 2015-2025' : 'Conceptual Evolution: 2015-2025'}
                        </h2>
                        <p className="text-lg text-[#2D2D2D]/70 max-w-3xl mx-auto">
                            {lang === 'pt'
                                ? 'Acompanhe a jornada intelectual que moldou o pensamento geopolítico brasileiro'
                                : 'Follow the intellectual journey that shaped Brazilian geopolitical thinking'}
                        </p>
                    </motion.div>
                    <ConceptEvolutionTimeline lang={lang} />
                </div>
            </section>

            {/* Neologisms Showcase */}
            <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {lang === 'pt' ? 'Inovação Conceitual: 2015-2025' : 'Conceptual Innovation: 2015-2025'}
                        </h2>
                        <p className="text-lg text-[#2D2D2D]/70 max-w-3xl mx-auto">
                            {lang === 'pt' 
                                ? 'Os 11 neologismos e frameworks que definem o pensamento estratégico de Troyjo'
                                : 'The 11 neologisms and frameworks that define Troyjo\'s strategic thinking'}
                        </p>
                    </motion.div>
                    <NeologismShowcase lang={lang} />
                </div>
            </section>

            {/* Audience Segmentation */}
            <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {lang === 'pt' ? 'Quem Você É?' : 'Who Are You?'}
                        </h2>
                        <p className="text-lg text-[#2D2D2D]/70">
                            {lang === 'pt' 
                                ? 'Experiência customizada para diferentes contextos e necessidades'
                                : 'Customized experience for different contexts and needs'}
                        </p>
                    </motion.div>
                    <AudienceSegmentation lang={lang} />
                </div>
            </section>

            {/* Recent Insights Feed */}
            <section className="py-12 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[#002D62] mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Novidades & Insights' : 'Latest & Insights'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {lang === 'pt' ? 'Análises recentes e conteúdo relevante' : 'Recent analysis and relevant content'}
                            </p>
                        </div>
                        <Link to={createPageUrl('StrategicIntelligenceBlog')}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Newspaper className="w-4 h-4" />
                                {lang === 'pt' ? 'Ver Todos' : 'View All'}
                            </Button>
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {recentInsights.slice(0, 3).map((insight, index) => (
                            <motion.div
                                key={insight.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={createPageUrl('ArticleView') + `?id=${insight.id}`}>
                                    <Card className="hover:shadow-lg transition-all h-full">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {insight.category || 'Análise'}
                                                </Badge>
                                                <Eye className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <CardTitle className="text-base line-clamp-2">
                                                {insight.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                                {insight.summary || insight.content?.substring(0, 120)}...
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>
                                                    {new Date(insight.created_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                                </span>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Expertise Areas - Interactive */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-[#8B1538] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>{t.topics}</h2>
                        <p className="text-gray-600">
                            {lang === 'pt' ? 'Clique para explorar cada área de expertise' : 'Click to explore each expertise area'}
                        </p>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {t.topicsList.map((topic, index) => (
                            <Link key={index} to={createPageUrl('Consultation')}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    className="group p-6 rounded-lg border-2 border-gray-100 hover:border-[#002D62] hover:shadow-xl transition-all duration-300 bg-white cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <topic.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#002D62] group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h3 className="font-bold text-lg text-[#2D2D2D] mb-2 group-hover:text-[#002D62] transition-colors">
                                        {topic.title}
                                    </h3>
                                    <p className="text-sm text-[#2D2D2D]/70 group-hover:text-[#2D2D2D] transition-colors">
                                        {topic.desc}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-[#002D62] font-medium">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{lang === 'pt' ? 'Iniciar consulta' : 'Start consultation'}</span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col items-center md:items-start gap-2 text-sm text-[#2D2D2D]/70">
                            <p>© 2025 Marcos Prado Troyjo Digital Twin</p>
                            <p className="font-medium text-[#8B1538]">
                                Desenvolvido por Grupo Fratoz. Powered by CAIO.Vision.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                            <Link to={createPageUrl('PrivacyPolicy')} className="text-[#2D2D2D]/70 hover:text-[#002D62] transition-colors">
                                {lang === 'pt' ? 'Privacidade' : 'Privacy'}
                            </Link>
                            <span className="text-[#2D2D2D]/40">•</span>
                            <Link to={createPageUrl('TermsOfService')} className="text-[#2D2D2D]/70 hover:text-[#002D62] transition-colors">
                                {lang === 'pt' ? 'Termos' : 'Terms'}
                            </Link>
                        </div>

                        <p className="text-sm text-[#2D2D2D]/70">
                            {lang === 'pt' ? 'Conhecimento base até dezembro de 2025' : 'Knowledge base up to December 2025'}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}