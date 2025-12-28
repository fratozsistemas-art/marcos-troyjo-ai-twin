import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Award, FileText, ExternalLink, Globe, MessageSquare, LayoutDashboard, Filter, Lightbulb, BarChart3, Shield, Zap, Users, Star, ChevronRight, Sparkles, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import NeologismShowcase from '@/components/neologisms/NeologismShowcase';
import AudienceSegmentation from '@/components/audience/AudienceSegmentation';
import ConceptEvolutionTimeline from '@/components/neologisms/ConceptEvolutionTimeline';
import PublicationCard from '@/components/media/PublicationCard';
import PolicyObservatory from '@/components/observatory/PolicyObservatory';
import { useAdvancedTracking, useSectionTracking } from '@/components/tracking/AdvancedTracker';

export default function PublicHome() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [publications, setPublications] = useState([]);
    const [books, setBooks] = useState([]);
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState('all');
    const [publicationTypeFilter, setPublicationTypeFilter] = useState('all');
    
    const { trackPurchaseClick } = useAdvancedTracking('page', 'public_home', 'Public Home Page', { page_type: 'public_home' });
    
    useSectionTracking('books', 'books-section');
    useSectionTracking('publications', 'publications-section');
    useSectionTracking('neologisms', 'neologisms-section');
    
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pubs, bks, awds] = await Promise.all([
                base44.entities.Publication.list('-publication_date', 50),
                base44.entities.Book.filter({ featured: true }, 'order'),
                base44.entities.Award.filter({ featured: true }, 'order')
            ]);
            setPublications(pubs || []);
            setBooks(bks || []);
            setAwards(awds || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const t = {
        pt: {
            title: 'Formador de Opinião Global 24/7',
            subtitle: 'De "desglobalização" (2015) a "Novo ESG" (2025): uma década de inovação conceitual',
            tagline: 'Marcos Troyjo · Economista · Ex-Presidente do Banco do BRICS',
            about: 'Expertise Geopolítica de Classe Mundial',
            aboutText: 'Ex-Presidente do Novo Banco de Desenvolvimento (NDB/BRICS, 2020-2023), primeiro ocidental a liderar a instituição. Fellow na Blavatnik School of Government (Oxford), Research Scholar na Columbia University. Criador de frameworks conceituais que moldaram o debate geopolítico brasileiro: de "desglobalização" a "trumpulência" e "Novo ESG".',
            books: 'Principais Livros',
            awards: 'Prêmios & Reconhecimentos',
            publications: 'Artigos & Entrevistas',
            filterAll: 'Todos',
            filterArticles: 'Artigos',
            filterInterviews: 'Entrevistas',
            allYears: 'Todos os Anos',
            purchase: 'Adquirir',
            accessTwin: 'Acessar Digital Twin',
            viewPlans: 'Ver Planos',
            cta: 'Iniciar Consulta',
            contextUpdate: 'Atualização Geopolítica (nov/2025)',
            contextText: 'Após meses de volatilidade máxima (Mar-Set 2025), o ambiente comercial global apresenta distensão tática — cessar-fogo EUA-China (até nov/2026), Brasil negocia acordo provisório. A trumpulência está GERENCIADA, não eliminada.',
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
            ctaSection: {
                title: 'Pronto para Começar?',
                subtitle: 'Junte-se a líderes globais que já utilizam o Troyjo Twin',
                button: 'Iniciar Gratuitamente'
            }
        },
        en: {
            title: 'Global Thought Leader 24/7',
            subtitle: 'From "deglobalization" (2015) to "New ESG" (2025): a decade of conceptual innovation',
            tagline: 'Marcos Troyjo · Economist · Former BRICS Bank President',
            about: 'World-Class Geopolitical Expertise',
            aboutText: 'Former President of New Development Bank (NDB/BRICS, 2020-2023), first Westerner to lead the institution. Fellow at Blavatnik School of Government (Oxford), Research Scholar at Columbia University. Creator of conceptual frameworks that shaped Brazilian geopolitical debate: from "deglobalization" to "trumpulence" and "New ESG".',
            books: 'Main Books',
            awards: 'Awards & Recognition',
            publications: 'Articles & Interviews',
            filterAll: 'All',
            filterArticles: 'Articles',
            filterInterviews: 'Interviews',
            allYears: 'All Years',
            purchase: 'Purchase',
            accessTwin: 'Access Digital Twin',
            viewPlans: 'View Plans',
            cta: 'Start Consultation',
            contextUpdate: 'Geopolitical Update (Nov/2025)',
            contextText: 'After months at maximum volatility (Mar-Sep 2025), global trade environment shows tactical détente — US-China ceasefire (until Nov/2026), Brazil negotiates provisional agreement. Trumpulence is MANAGED, not eliminated.',
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
            ctaSection: {
                title: 'Ready to Start?',
                subtitle: 'Join global leaders already using Troyjo Twin',
                button: 'Start Free'
            }
        }
    };

    const text = t[lang];

    const filteredPublications = publications.filter(pub => {
        const typeMatch = publicationTypeFilter === 'all' || pub.type === publicationTypeFilter;
        const yearMatch = yearFilter === 'all' || (pub.publication_date && pub.publication_date.startsWith(yearFilter));
        return typeMatch && yearMatch;
    });

    const filteredBooks = books.filter(book => {
        return yearFilter === 'all' || book.year === yearFilter;
    });

    const uniqueYears = [...new Set([
        ...publications.map(p => p.publication_date?.substring(0, 4)).filter(Boolean),
        ...books.map(b => b.year).filter(Boolean)
    ])].sort((a, b) => b.localeCompare(a));

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link to={createPageUrl('PublicHome')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/7b4794e58_CapturadeTela2025-12-23s93044PM.png"
                                alt="MT Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="font-bold text-[#06101F] text-lg">Troyjo Twin</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-[#06101F] bg-white hover:bg-gray-50 transition-all text-sm font-medium">
                                <Globe className="w-4 h-4 text-[#06101F]" />
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
                                        className={`w-full text-left px-4 py-3 hover:bg-[#06101F] hover:text-white transition-colors flex items-center gap-3 ${
                                            lang === l ? 'bg-[#06101F]/5 text-[#06101F] font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                        <span className="text-lg">{
                                            l === 'pt' ? '🇧🇷' : 
                                            l === 'en' ? '🇺🇸' :
                                            l === 'zh' ? '🇨🇳' :
                                            l === 'ar' ? '🇸🇦' :
                                            l === 'ru' ? '🇷🇺' :
                                            l === 'hi' ? '🇮🇳' :
                                            l === 'fr' ? '🇫🇷' :
                                            l === 'es' ? '🇪🇸' : '🌐'
                                        }</span>
                                        <span className="flex-1">{langNames[l]}</span>
                                        {lang === l && <span className="text-xs">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Link to={createPageUrl('Pricing')}>
                            <Button className="bg-[#06101F] hover:bg-[#00513d]">
                                <DollarSign className="w-4 h-4 mr-2" />
                                {lang === 'pt' ? 'Planos' : 'Plans'}
                            </Button>
                        </Link>
                        <Link to={createPageUrl('Home')}>
                            <Button className="bg-[#06101F] hover:bg-[#050D19]">
                                {text.accessTwin}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#06101F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#2D2D2D]/60">{lang === 'pt' ? 'Carregando...' : 'Loading...'}</p>
                    </div>
                </div>
            ) : (
            <>
            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-[#050D19] via-[#06101F] to-[#003366] py-32">
                    <div className="max-w-7xl mx-auto px-4 md:px-6">
                        <div className="text-center max-w-5xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-sm font-medium mb-8">
                                    <Sparkles className="w-4 h-4 text-blue-300" />
                                    <span className="text-blue-200">{lang === 'pt' ? '🧠 Inteligência Estratégica Reimaginada' : '🧠 Strategic Intelligence Reimagined'}</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
                                    Marcos Prado Troyjo<br />
                                    <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Digital Twin</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                                    {lang === 'pt' 
                                        ? 'Uma plataforma de inteligência cognitiva que replica com fidelidade máxima o raciocínio estratégico, a retórica diplomática e os frameworks analíticos de Marcos Prado Troyjo.'
                                        : 'A cognitive intelligence platform that replicates with maximum fidelity the strategic reasoning, diplomatic rhetoric and analytical frameworks of Marcos Prado Troyjo.'}
                                </p>
                                
                                <div className="bg-white rounded-lg border-l-4 border-[#C7A763] p-4 mb-6">
                                    <p className="text-sm text-[#2D2D2D] leading-relaxed">
                                        <strong>📊 {text.contextUpdate}:</strong> {text.contextText}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap justify-center gap-4 mb-12">
                                    <Link to={createPageUrl('Consultation')}>
                                        <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white gap-2 text-lg px-10 py-6 rounded-full shadow-xl">
                                            <MessageSquare className="w-5 h-5" />
                                            {lang === 'pt' ? 'Iniciar Consulta' : 'Start Consultation'}
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-white mb-2">30+</div>
                                        <div className="text-sm text-gray-400">{lang === 'pt' ? 'Anos de Experiência' : 'Years of Experience'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-white mb-2">BRICS</div>
                                        <div className="text-sm text-gray-400">{lang === 'pt' ? 'Ex-Presidente do Banco' : 'Former Bank President'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-white mb-2">3</div>
                                        <div className="text-sm text-gray-400">{lang === 'pt' ? 'Livros Publicados' : 'Published Books'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-white mb-2">Global</div>
                                        <div className="text-sm text-gray-400">{lang === 'pt' ? 'Alcance Geopolítico' : 'Geopolitical Reach'}</div>
                                    </div>
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="aspect-square max-w-md mx-auto relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/15 to-[#C7A763]/15 rounded-2xl transform rotate-6" />
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
                                        <img 
                                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/8c955389f_Replace_the_transparent_checkered_background_with_-1765063055494.png"
                                            alt="Marcos Prado Troyjo"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#06101F]/90 via-transparent to-transparent" />
                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4, duration: 0.6 }}
                                            className="absolute bottom-8 left-8 right-8"
                                        >
                                            <BookOpen className="w-8 h-8 text-[#C7A763] mb-3" />
                                            <p className="text-white text-lg italic leading-relaxed font-light" style={{ fontFamily: 'Crimson Text, serif' }}>
                                                "{lang === 'pt' 
                                                    ? 'Temos todas as cartas na mão, mas só jogaremos bem se fizermos a lição de casa antes do colapso.'
                                                    : 'We have all the cards in hand, but we will only play well if we do our homework before the collapse.'}"
                                            </p>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Four Pillars Section */}
                <section className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-[#06101F] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Quatro Pilares de uma Arquitetura Cognitiva Robusta' : 'Four Pillars of a Robust Cognitive Architecture'}
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                {lang === 'pt' 
                                    ? 'O Gêmeo Digital é sustentado por uma arquitetura interdependente projetada para garantir autenticidade, relevância, inteligência e segurança.'
                                    : 'The Digital Twin is supported by an interdependent architecture designed to ensure authenticity, relevance, intelligence and security.'}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Pilar 1: Persona */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl transform group-hover:scale-105 transition-transform" />
                                <div className="relative bg-white rounded-2xl p-8 border-2 border-gray-100 group-hover:border-blue-500/30 transition-all shadow-lg">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                                        <Users className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#06101F] mb-4">
                                        {lang === 'pt' ? 'Persona Autêntica' : 'Authentic Persona'}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        {lang === 'pt'
                                            ? 'Modelos multimodais de raciocínio que capturam estilos analíticos únicos: Professor, Técnico, Diplomático e Consultor.'
                                            : 'Multimodal reasoning models that capture unique analytical styles: Professor, Technical, Diplomatic and Consultant.'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-blue-100 text-blue-800">Professor</Badge>
                                        <Badge className="bg-blue-100 text-blue-800">{lang === 'pt' ? 'Técnico' : 'Technical'}</Badge>
                                        <Badge className="bg-blue-100 text-blue-800">{lang === 'pt' ? 'Diplomático' : 'Diplomatic'}</Badge>
                                        <Badge className="bg-blue-100 text-blue-800">{lang === 'pt' ? 'Consultor' : 'Consultant'}</Badge>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pilar 2: Base de Conhecimento */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl transform group-hover:scale-105 transition-transform" />
                                <div className="relative bg-white rounded-2xl p-8 border-2 border-gray-100 group-hover:border-green-500/30 transition-all shadow-lg">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6">
                                        <BookOpen className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#06101F] mb-4">
                                        {lang === 'pt' ? 'Base de Conhecimento Viva' : 'Living Knowledge Base'}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        {lang === 'pt'
                                            ? 'Corpus fundacional enriquecido continuamente com dados externos em tempo real para análises sempre relevantes.'
                                            : 'Foundational corpus continuously enriched with real-time external data for always relevant analyses.'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-green-100 text-green-800">{lang === 'pt' ? '30+ anos' : '30+ years'}</Badge>
                                        <Badge className="bg-green-100 text-green-800">{lang === 'pt' ? '11 Neologismos' : '11 Neologisms'}</Badge>
                                        <Badge className="bg-green-100 text-green-800">RAG</Badge>
                                        <Badge className="bg-green-100 text-green-800">Real-time</Badge>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pilar 3: Motor de IA */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl transform group-hover:scale-105 transition-transform" />
                                <div className="relative bg-white rounded-2xl p-8 border-2 border-gray-100 group-hover:border-purple-500/30 transition-all shadow-lg">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6">
                                        <Zap className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#06101F] mb-4">
                                        {lang === 'pt' ? 'Motor de Inteligência Adaptativa' : 'Adaptive Intelligence Engine'}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        {lang === 'pt'
                                            ? 'Sistema nervoso que aprende com cada interação, refinando persona e profundidade analítica continuamente.'
                                            : 'Nervous system that learns from each interaction, continuously refining persona and analytical depth.'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-purple-100 text-purple-800">{lang === 'pt' ? 'Aprendizado' : 'Learning'}</Badge>
                                        <Badge className="bg-purple-100 text-purple-800">{lang === 'pt' ? 'Adaptação' : 'Adaptation'}</Badge>
                                        <Badge className="bg-purple-100 text-purple-800">Multi-Model</Badge>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Pilar 4: Protocolos */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl transform group-hover:scale-105 transition-transform" />
                                <div className="relative bg-white rounded-2xl p-8 border-2 border-gray-100 group-hover:border-amber-500/30 transition-all shadow-lg">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6">
                                        <Shield className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#06101F] mb-4">
                                        {lang === 'pt' ? 'Protocolos de Elite' : 'Elite Protocols'}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        {lang === 'pt'
                                            ? 'Framework HUA garante excelência em cada insight. Protocolo AEGIS protege propriedade intelectual contra extração.'
                                            : 'HUA framework ensures excellence in every insight. AEGIS protocol protects intellectual property against extraction.'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-amber-100 text-amber-800">HUA 95%+</Badge>
                                        <Badge className="bg-amber-100 text-amber-800">AEGIS</Badge>
                                        <Badge className="bg-amber-100 text-amber-800">{lang === 'pt' ? 'Segurança' : 'Security'}</Badge>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-[#06101F]">
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
                                    <div className="text-4xl font-bold text-[#C7A763] mb-2">{stat.value}</div>
                                    <div className="text-white/80">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Concept Evolution Timeline */}
                <section className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#06101F] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Evolução Conceitual' : 'Conceptual Evolution'}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {lang === 'pt' ? 'Acompanhe a jornada intelectual de 2015 a 2025' : 'Follow the intellectual journey from 2015 to 2025'}
                            </p>
                        </motion.div>
                        <ConceptEvolutionTimeline lang={lang} />
                    </div>
                </section>

                {/* Neologisms Showcase */}
                <section id="neologisms-section" className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#06101F] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Inovação Conceitual' : 'Conceptual Innovation'}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {lang === 'pt' ? 'Os 11 neologismos que definem o pensamento estratégico' : 'The 11 neologisms that define strategic thinking'}
                            </p>
                        </motion.div>
                        <NeologismShowcase lang={lang} />
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-4 md:px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-[#06101F] mb-4">{text.features.title}</h2>
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
                                        <Card className="h-full hover:shadow-lg transition-all border-gray-200 hover:border-[#06101F]">
                                            <CardHeader>
                                                <div className="w-12 h-12 rounded-xl bg-[#06101F]/10 flex items-center justify-center mb-4">
                                                    <Icon className="w-6 h-6 text-[#06101F]" />
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

                {/* Policy Observatory */}
                <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#06101F] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Observatório de Políticas' : 'Policy Observatory'}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {lang === 'pt' ? 'Linha do tempo de eventos geopolíticos críticos desde 2023' : 'Timeline of critical geopolitical events since 2023'}
                            </p>
                        </motion.div>
                        <PolicyObservatory lang={lang} />
                    </div>
                </section>

                {/* Personas Section */}
                <section className="py-20 px-4 md:px-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-[#06101F] mb-4">{text.personas.title}</h2>
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
                                        <div className="w-16 h-16 rounded-full bg-[#06101F]/10 flex items-center justify-center mx-auto mb-4">
                                            <Star className="w-8 h-8 text-[#06101F]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[#06101F] mb-2">{persona.title}</h3>
                                        <p className="text-sm text-gray-600">{persona.desc}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Audience Segmentation */}
                <section className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#06101F] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Quem Você É?' : 'Who Are You?'}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {lang === 'pt' ? 'Experiência customizada para diferentes contextos' : 'Customized experience for different contexts'}
                            </p>
                        </motion.div>
                        <AudienceSegmentation lang={lang} />
                    </div>
                </section>

                {/* About Section */}
                <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#06101F] mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {text.about}
                        </h2>
                        <p className="text-lg text-[#2D2D2D] leading-relaxed max-w-4xl">{text.aboutText}</p>
                    </div>
                </section>

                {/* Books */}
                <section id="books-section" className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#06101F] mb-4 flex items-center justify-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                                <BookOpen className="w-9 h-9" />
                                {text.books}
                            </h2>
                            {uniqueYears.length > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <Filter className="w-4 h-4 text-[#06101F]" />
                                    <select
                                        value={yearFilter}
                                        onChange={(e) => setYearFilter(e.target.value)}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#06101F] bg-white shadow-sm"
                                    >
                                        <option value="all">{text.allYears}</option>
                                        {uniqueYears.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </motion.div>
                        {filteredBooks.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {books.map((book, idx) => (
                                    <motion.div
                                        key={book.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Card className="group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 bg-white h-full flex flex-col">
                                            {book.cover_url && (
                                                <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                                    <img
                                                        src={book.cover_url}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-3 right-3">
                                                        <Badge className="bg-[#C7A763] text-[#2D2D2D] font-bold shadow-lg">
                                                            {book.year}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}
                                            <CardHeader className="pb-3 flex-grow">
                                                <CardTitle className="text-base font-bold text-[#06101F] leading-tight group-hover:text-[#00D4FF] transition-colors">
                                                    {book.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3 pt-0">
                                                <p className="text-sm text-[#2D2D2D]/70 leading-relaxed line-clamp-3">
                                                    {book.description}
                                                </p>
                                                {book.purchase_link && (
                                                    <a 
                                                        href={book.purchase_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        onClick={() => trackPurchaseClick(book.purchase_link)}
                                                    >
                                                        <Button 
                                                            size="sm" 
                                                            className="w-full gap-2 bg-gradient-to-r from-[#06101F] to-[#06101F] hover:from-[#050D19] hover:to-[#004a37] text-white shadow-md"
                                                        >
                                                            <BookOpen className="w-4 h-4" />
                                                            {text.purchase}
                                                            <ExternalLink className="w-3 h-3 ml-auto" />
                                                        </Button>
                                                    </a>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                {lang === 'pt' ? 'Nenhum livro disponível' : 'No books available'}
                            </div>
                        )}
                    </div>
                </section>

                {/* Awards */}
                <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#06101F] mb-8 flex items-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                            <Award className="w-8 h-8" />
                            {text.awards}
                        </h2>
                        {awards.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {awards.map((award) => (
                                    <div key={award.id} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-white hover:border-[#C7A763]/30 hover:shadow-md transition-all">
                                        <Award className="w-5 h-5 text-[#C7A763] flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-[#2D2D2D] font-medium">{award.title}</span>
                                            {award.organization && <p className="text-sm text-gray-600 mt-1">{award.organization}</p>}
                                            {award.year && <p className="text-xs text-gray-500 mt-1">{award.year}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                {lang === 'pt' ? 'Nenhum prêmio disponível' : 'No awards available'}
                            </div>
                        )}
                    </div>
                </section>

                {/* Publications */}
                <section id="publications-section" className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#06101F] mb-8 flex items-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                            <FileText className="w-8 h-8" />
                            {text.publications}
                        </h2>

                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="flex gap-2">
                                <Button
                                    variant={publicationTypeFilter === 'all' ? 'default' : 'outline'}
                                    onClick={() => setPublicationTypeFilter('all')}
                                    className={publicationTypeFilter === 'all' ? 'bg-[#06101F]' : ''}
                                >
                                    {text.filterAll}
                                </Button>
                                <Button
                                    variant={publicationTypeFilter === 'article' ? 'default' : 'outline'}
                                    onClick={() => setPublicationTypeFilter('article')}
                                    className={publicationTypeFilter === 'article' ? 'bg-[#06101F]' : ''}
                                >
                                    {text.filterArticles}
                                </Button>
                                <Button
                                    variant={publicationTypeFilter === 'interview' ? 'default' : 'outline'}
                                    onClick={() => setPublicationTypeFilter('interview')}
                                    className={publicationTypeFilter === 'interview' ? 'bg-[#06101F]' : ''}
                                >
                                    {text.filterInterviews}
                                </Button>
                            </div>
                        </div>

                        {filteredPublications.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {filteredPublications.map((pub, idx) => (
                                    <PublicationCard key={idx} publication={pub} lang={lang} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-[#2D2D2D]/60">
                                {lang === 'pt' ? 'Nenhuma publicação encontrada' : 'No publications found'}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-[#06101F] to-[#06101F]">
                    <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">{text.ctaSection.title}</h2>
                        <p className="text-xl text-white/80 mb-8">{text.ctaSection.subtitle}</p>
                        <Link to={createPageUrl('Home')}>
                            <Button size="lg" className="bg-white text-[#06101F] hover:bg-gray-100 text-lg px-8 py-6">
                                {text.ctaSection.button}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#2D2D2D] text-[#FAF7F2] py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <h4 className="text-[#C7A763] font-semibold mb-4">Marcos Troyjo Digital Twin</h4>
                            <p className="text-sm text-[#FAF7F2]/70 leading-relaxed">
                                {lang === 'pt' 
                                    ? 'Expertise geopolítica de classe mundial, disponível 24/7 via IA com 95%+ de fidelidade HUA-validada.'
                                    : 'World-class geopolitical expertise, available 24/7 via AI with 95%+ HUA-validated fidelity.'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[#C7A763] font-semibold mb-4">{lang === 'pt' ? 'Produto' : 'Product'}</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to={createPageUrl('Home')} className="text-[#FAF7F2]/70 hover:text-[#C7A763] transition-colors">
                                    {lang === 'pt' ? 'Acessar Twin' : 'Access Twin'}
                                </Link></li>
                                <li><Link to={createPageUrl('Pricing')} className="text-[#FAF7F2]/70 hover:text-[#C7A763] transition-colors">
                                    {lang === 'pt' ? 'Planos' : 'Pricing'}
                                </Link></li>
                                <li><Link to={createPageUrl('Dashboard')} className="text-[#FAF7F2]/70 hover:text-[#C7A763] transition-colors">
                                    Dashboard
                                </Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[#C7A763] font-semibold mb-4">{lang === 'pt' ? 'Recursos' : 'Resources'}</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to={createPageUrl('StrategicIntelligenceBlog')} className="text-[#FAF7F2]/70 hover:text-[#C7A763] transition-colors">
                                    Blog
                                </Link></li>
                                <li><Link to={createPageUrl('KnowledgeBase')} className="text-[#FAF7F2]/70 hover:text-[#C7A763] transition-colors">
                                    {lang === 'pt' ? 'Base de Conhecimento' : 'Knowledge Base'}
                                </Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[#C7A763] font-semibold mb-4">{lang === 'pt' ? 'Legal' : 'Legal'}</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to={createPageUrl('PrivacyPolicy')} className="text-[#FAF7F2]/70 hover:text-[#C7A763] transition-colors">
                                    {lang === 'pt' ? 'Privacidade' : 'Privacy'}
                                </Link></li>
                                <li><Link to={createPageUrl('TermsOfService')} className="text-[#FAF7F2]/70 hover:text-[#C7A763] transition-colors">
                                    {lang === 'pt' ? 'Termos de Serviço' : 'Terms of Service'}
                                </Link></li>
                            </ul>
                        </div>
                    </div>
                    <Separator className="bg-[#6B6B6B] mb-8" />
                    <div className="text-center space-y-2">
                        <p className="text-sm text-[#FAF7F2]/60">
                            © 2025 Marcos Troyjo Digital Twin. {lang === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}
                        </p>
                        <p className="text-xs text-[#FAF7F2]/40">
                            {lang === 'pt' 
                                ? 'Desenvolvido por CAIO ESIOS AI | TSI v9.3 Framework | HUA Protocol 95%+ Fidelity'
                                : 'Developed by CAIO ESIOS AI | TSI v9.3 Framework | HUA Protocol 95%+ Fidelity'}
                        </p>
                    </div>
                </div>
            </footer>
            </>
            )}
        </div>
    );
}