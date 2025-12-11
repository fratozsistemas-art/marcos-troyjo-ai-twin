import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, TrendingUp, Building2, Landmark, BookOpen, MessageSquare, LayoutDashboard, Zap, Network, DollarSign, Brain, Badge as BadgeIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        description: "Desvende as complexidades do cenário internacional com a inteligência de Marcos Troyjo, disponível a qualquer momento para análises aprofundadas sobre economia global, riscos geopolíticos, comércio e competitividade.",
        cta: "Iniciar Consulta",
        topics: "Áreas de Expertise",
        topicsList: [
            { icon: Globe, title: "Economia Global", desc: "Análise das dinâmicas geoeconômicas contemporâneas" },
            { icon: TrendingUp, title: "Comércio Internacional", desc: "Estratégias para inserção competitiva global" },
            { icon: Building2, title: "BRICS & Emergentes", desc: "O futuro das economias em desenvolvimento" },
            { icon: Landmark, title: "Diplomacia Econômica", desc: "Negociações e acordos multilaterais" }
        ],
        credentials: "Credenciais",
        credentialsList: [
            "Presidente do Novo Banco de Desenvolvimento (2020-2023)",
            "Secretário Especial de Comércio Exterior do Brasil",
            "Fellow na Blavatnik School of Government, Oxford",
            "Research Scholar, Columbia University"
        ],
        quote: "Competitividade não se declara, se constrói — com educação, infraestrutura e abertura",
        forBoards: "Para Conselhos & Executivos",
        forMedia: "Para Mídia & Analistas"
    },
    en: {
        title: "Your Personal Geopolitical Analyst",
        subtitle: "Available 24/7",
        tagline: "Marcos Troyjo · Economist · Former BRICS Bank President",
        description: "Unravel the complexities of the international landscape with Marcos Troyjo's intelligence, available anytime for in-depth analysis on global economics, geopolitical risks, trade, and competitiveness.",
        cta: "Start Consultation",
        topics: "Areas of Expertise",
        topicsList: [
            { icon: Globe, title: "Global Economics", desc: "Analysis of contemporary geoeconomic dynamics" },
            { icon: TrendingUp, title: "International Trade", desc: "Strategies for competitive global insertion" },
            { icon: Building2, title: "BRICS & Emerging Markets", desc: "The future of developing economies" },
            { icon: Landmark, title: "Economic Diplomacy", desc: "Multilateral negotiations and agreements" }
        ],
        credentials: "Credentials",
        credentialsList: [
            "President of New Development Bank (2020-2023)",
            "Brazil's Special Secretary of Foreign Trade",
            "Fellow at Blavatnik School of Government, Oxford",
            "Research Scholar, Columbia University"
        ],
        quote: "Competitiveness is not declared, it is built — with education, infrastructure and openness",
        forBoards: "For Boards & Executives",
        forMedia: "For Media & Analysts"
    }
};

export default function Home() {
    const navigate = useNavigate();
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        redirectIfFirstTime();
    }, []);

    const redirectIfFirstTime = async () => {
        try {
            const isAuth = await base44.auth.isAuthenticated();
            if (!isAuth) return;

            const user = await base44.auth.me();
            const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
            
            if (profiles.length === 0 || !profiles[0].dashboard_preferences?.onboarding_completed) {
                navigate(createPageUrl('Welcome'));
            }
        } catch (error) {
            console.error('Error checking first time:', error);
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
                    <div className="flex items-center gap-3">
                        <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/360deb91f_image-2.jpg"
                            alt="MT Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <span className="font-semibold text-[#333F48] hidden sm:block">Troyjo Digital Twin</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden md:inline">{lang === 'pt' ? 'Painel' : 'Dashboard'}</span>
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

            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
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
                                                <div className="w-full h-full bg-gradient-to-br from-[#F5F1E8] via-[#FDFBF7] to-[#F5F1E8] flex items-center justify-center p-12 relative overflow-hidden">
                                                    <div className="absolute inset-0 opacity-5">
                                                        <svg className="w-full h-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M400,100 Q500,200 400,300 T400,500 T400,700" fill="none" stroke="#8B1538" strokeWidth="2"/>
                                                            <path d="M200,100 Q300,200 200,300 T200,500 T200,700" fill="none" stroke="#D4AF37" strokeWidth="2"/>
                                                            <path d="M600,100 Q700,200 600,300 T600,500 T600,700" fill="none" stroke="#8B1538" strokeWidth="2"/>
                                                            <circle cx="400" cy="400" r="120" fill="none" stroke="#8B1538" strokeWidth="3" opacity="0.3"/>
                                                            <circle cx="400" cy="400" r="90" fill="none" stroke="#D4AF37" strokeWidth="2" opacity="0.3"/>
                                                        </svg>
                                                    </div>
                                                    <motion.p 
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ 
                                                            y: currentSlide === index ? 0 : 20,
                                                            opacity: currentSlide === index ? 1 : 0
                                                        }}
                                                        transition={{ delay: 0.3, duration: 0.6 }}
                                                        className="text-3xl md:text-4xl font-light text-[#8B1538] text-center leading-relaxed relative z-10"
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
                                                                initial={{ y: 20, opacity: 0 }}
                                                                animate={{ 
                                                                    y: currentSlide === index ? 0 : 20,
                                                                    opacity: currentSlide === index ? 1 : 0
                                                                }}
                                                                transition={{ delay: 0.4, duration: 0.6 }}
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
                                    
                                    {/* Slide indicators */}
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                                        {slides.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${
                                                    currentSlide === index 
                                                        ? 'bg-white w-8' 
                                                        : 'bg-white/50'
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

                        {/* System Capabilities */}
                        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                        <div className="max-w-7xl mx-auto px-4 md:px-6">
                        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                        >
                        <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4">
                            {lang === 'pt' ? 'Sistema Avançado de IA' : 'Advanced AI System'}
                        </h2>
                        <p className="text-lg text-[#333F48]">
                            {lang === 'pt' 
                                ? 'Tecnologia de ponta para experiência personalizada e inteligente'
                                : 'Cutting-edge technology for personalized and intelligent experience'}
                        </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: lang === 'pt' ? 'Adaptação de Persona' : 'Persona Adaptation',
                                desc: lang === 'pt' 
                                    ? 'O Digital Twin ajusta automaticamente seu estilo de comunicação (Professor, Técnico, Diplomático) baseado no seu perfil e interações'
                                    : 'The Digital Twin automatically adjusts its communication style (Professor, Technical, Diplomatic) based on your profile and interactions'
                            },
                            {
                                title: lang === 'pt' ? 'Análise de Documentos' : 'Document Analysis',
                                desc: lang === 'pt'
                                    ? 'Upload e chat com documentos PDF, DOCX e TXT para análise geopolítica contextualizada'
                                    : 'Upload and chat with PDF, DOCX and TXT documents for contextualized geopolitical analysis'
                            },
                            {
                                title: lang === 'pt' ? 'Monitoramento de Riscos' : 'Risk Monitoring',
                                desc: lang === 'pt'
                                    ? 'Alertas de riscos geopolíticos por região, país e setor de interesse personalizado'
                                    : 'Geopolitical risk alerts by region, country and customized sector of interest'
                            },
                            {
                                title: lang === 'pt' ? 'Rastreamento de Tópicos' : 'Topic Tracking',
                                desc: lang === 'pt'
                                    ? 'Sistema inteligente que monitora tópicos frequentes e oferece sugestões proativas de conteúdo relevante'
                                    : 'Intelligent system that monitors frequent topics and offers proactive suggestions for relevant content'
                            },
                            {
                                title: lang === 'pt' ? 'Geração de Artigos' : 'Article Generation',
                                desc: lang === 'pt'
                                    ? 'Crie policy papers, relatórios e análises com a voz autêntica de Marcos Troyjo'
                                    : 'Create policy papers, reports and analyses with Marcos Troyjo\'s authentic voice'
                            },
                            {
                                title: lang === 'pt' ? 'Exportação Avançada' : 'Advanced Export',
                                desc: lang === 'pt'
                                    ? 'Exporte conversas em PDF, Markdown ou JSON com formatação profissional'
                                    : 'Export conversations in PDF, Markdown or JSON with professional formatting'
                            },
                            {
                                title: lang === 'pt' ? 'Base de Conhecimento' : 'Knowledge Base',
                                desc: lang === 'pt'
                                    ? 'Acesso a posições conhecidas, vocabulário técnico e evolução conceitual de Troyjo'
                                    : 'Access to known positions, technical vocabulary and Troyjo\'s conceptual evolution'
                            },
                            {
                                title: lang === 'pt' ? 'Protocolo HUA' : 'HUA Protocol',
                                desc: lang === 'pt'
                                    ? 'Validação rigorosa de Hierarquia, Utilidade e Aderência para garantir máxima fidelidade ao pensamento Troyjo'
                                    : 'Rigorous validation of Hierarchy, Utility and Adherence to ensure maximum fidelity to Troyjo\'s thinking'
                            },
                            {
                                title: lang === 'pt' ? 'Analytics de Persona' : 'Persona Analytics',
                                desc: lang === 'pt'
                                    ? 'Visualize como o Digital Twin adapta respostas ao seu perfil ao longo do tempo'
                                    : 'Visualize how the Digital Twin adapts responses to your profile over time'
                            }
                        ].map((capability, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-lg p-6 border border-gray-100 hover:border-[#8B1538]/30 hover:shadow-xl transition-all duration-300 group"
                                >
                                <h3 className="text-xl font-bold text-[#8B1538] mb-3">
                                    {capability.title}
                                </h3>
                                <p className="text-[#2D2D2D] leading-relaxed">
                                    {capability.desc}
                                </p>
                            </motion.div>
                        ))}
                        </div>
                        </div>
                        </section>

            {/* Concept Evolution Timeline - Option D */}
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

            {/* Expertise Areas */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-[#8B1538] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>{t.topics}</h2>
                        <p className="text-lg text-[#2D2D2D]/70">
                            {lang === 'pt' 
                                ? 'Análise profunda em áreas críticas da economia global'
                                : 'Deep analysis in critical areas of the global economy'}
                        </p>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {t.topicsList.map((topic, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-6 rounded-lg border border-gray-100 hover:border-[#002D62]/20 hover:shadow-lg transition-all duration-300 bg-white"
                                >
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <topic.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-[#2D2D2D] mb-2">{topic.title}</h3>
                                <p className="text-sm text-[#2D2D2D]/60">{topic.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Future Vision */}
            <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium mb-4 border border-[#D4AF37]/20">
                            <Zap className="w-4 h-4" />
                            {lang === 'pt' ? 'Evolução Contínua' : 'Continuous Evolution'}
                        </div>
                        <h2 className="text-3xl font-bold text-[#8B1538] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {lang === 'pt' ? 'Próximos Capítulos' : 'Next Chapters'}
                        </h2>
                        <p className="text-lg text-[#2D2D2D]/70 max-w-2xl mx-auto">
                            {lang === 'pt'
                                ? 'O Digital Twin evolui continuamente, integrando novas dimensões do pensamento Troyjo'
                                : 'The Digital Twin evolves continuously, integrating new dimensions of Troyjo\'s thinking'}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: lang === 'pt' ? 'Análise Preditiva' : 'Predictive Analysis',
                                desc: lang === 'pt'
                                    ? 'Cenários geopolíticos e econômicos com base em padrões históricos e tendências'
                                    : 'Geopolitical and economic scenarios based on historical patterns and trends',
                                status: lang === 'pt' ? 'Em desenvolvimento' : 'In development'
                            },
                            {
                                title: lang === 'pt' ? 'Voz Sintética Troyjo' : 'Troyjo Synthetic Voice',
                                desc: lang === 'pt'
                                    ? 'Consultas por áudio com a voz autêntica de Marcos Troyjo'
                                    : 'Audio consultations with Marcos Troyjo\'s authentic voice',
                                status: lang === 'pt' ? 'Planejado' : 'Planned'
                            },
                            {
                                title: lang === 'pt' ? 'Alertas Geoestratégicos' : 'Geostrategic Alerts',
                                desc: lang === 'pt'
                                    ? 'Notificações personalizadas sobre eventos críticos em suas áreas de interesse'
                                    : 'Personalized notifications about critical events in your areas of interest',
                                status: lang === 'pt' ? 'Em breve' : 'Coming soon'
                            },
                            {
                                title: lang === 'pt' ? 'Colaboração em Tempo Real' : 'Real-Time Collaboration',
                                desc: lang === 'pt'
                                    ? 'Co-criação de documentos estratégicos com o Digital Twin'
                                    : 'Co-creation of strategic documents with the Digital Twin',
                                status: lang === 'pt' ? 'Planejado' : 'Planned'
                            },
                            {
                                title: lang === 'pt' ? 'Memória Expandida' : 'Expanded Memory',
                                desc: lang === 'pt'
                                    ? 'Integração de novos livros, artigos e posições públicas em tempo real'
                                    : 'Integration of new books, articles and public positions in real-time',
                                status: lang === 'pt' ? 'Contínuo' : 'Ongoing'
                            },
                            {
                                title: lang === 'pt' ? 'API Empresarial' : 'Enterprise API',
                                desc: lang === 'pt'
                                    ? 'Integração do Digital Twin em sistemas corporativos de análise'
                                    : 'Digital Twin integration into corporate analysis systems',
                                status: lang === 'pt' ? 'Planejado' : 'Planned'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-lg border border-gray-200 bg-white hover:border-[#D4AF37]/30 hover:shadow-lg transition-all"
                                >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="font-semibold text-[#8B1538] text-lg">{feature.title}</h3>
                                    <Badge variant="outline" className="text-xs whitespace-nowrap border-[#D4AF37] text-[#D4AF37]">
                                        {feature.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-[#2D2D2D]/70 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Credentials */}
            <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-6xl mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-[#8B1538] mb-12 text-center"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        {t.credentials}
                    </motion.h2>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {t.credentialsList.map((credential, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-lg p-6 border border-gray-100 hover:border-[#8B1538]/20 hover:shadow-lg transition-all duration-300"
                                >
                                <div className="flex items-start gap-4">
                                    <div className="w-3 h-3 rounded-full bg-[#D4AF37] mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-[#8B1538] font-semibold leading-relaxed">{credential}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-[#002D62] to-[#001d42] rounded-2xl p-8 md:p-12"
                    >
                        <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {lang === 'pt' ? 'Acesso Especializado' : 'Specialized Access'}
                        </h3>
                        <p className="text-white/90 mb-8 leading-relaxed">
                            {lang === 'pt' 
                                ? 'Consultas customizadas para diferentes contextos e audiências, com análises e recomendações sob medida.'
                                : 'Customized consultations for different contexts and audiences, with tailored analysis and recommendations.'}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to={createPageUrl('Consultation') + '?context=board'}>
                                <Button variant="secondary" className="bg-white text-[#002D62] hover:bg-gray-100 gap-2 rounded">
                                    <Building2 className="w-4 h-4" />
                                    {t.forBoards}
                                </Button>
                            </Link>
                            <Link to={createPageUrl('Consultation') + '?context=media'}>
                                <Button variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/20 hover:border-white gap-2 rounded">
                                    <MessageSquare className="w-4 h-4" />
                                    {t.forMedia}
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Left side */}
                        <div className="flex flex-col items-center md:items-start gap-2 text-sm text-[#2D2D2D]/70">
                            <p>© 2025 Marcos Prado Troyjo Digital Twin</p>
                            <p className="font-medium text-[#8B1538]">
                                Desenvolvido por Grupo Fratoz. Powered by CAIO.Vision.
                            </p>
                        </div>
                        
                        {/* Center - Links */}
                        <div className="flex items-center gap-4 text-sm">
                            <Link to={createPageUrl('PrivacyPolicy')} className="text-[#2D2D2D]/70 hover:text-[#002D62] transition-colors">
                                    {lang === 'pt' ? 'Privacidade' : 'Privacy'}
                                </Link>
                                <span className="text-[#2D2D2D]/40">•</span>
                                <Link to={createPageUrl('TermsOfService')} className="text-[#2D2D2D]/70 hover:text-[#002D62] transition-colors">
                                    {lang === 'pt' ? 'Termos' : 'Terms'}
                                </Link>
                        </div>

                        {/* Right side */}
                        <p className="text-sm text-[#2D2D2D]/70">
                            {lang === 'pt' ? 'Conhecimento base até dezembro de 2025' : 'Knowledge base up to December 2025'}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}