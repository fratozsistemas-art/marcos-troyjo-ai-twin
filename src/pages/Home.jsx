import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, TrendingUp, Building2, Landmark, BookOpen, MessageSquare, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const translations = {
    pt: {
        title: "Marcos Prado Troyjo",
        subtitle: "Digital Twin",
        tagline: "Economista · Diplomata · Ex-Presidente do Banco do BRICS",
        description: "Acesse insights estratégicos sobre economia global, comércio internacional e competitividade diretamente da mente que liderou o Novo Banco de Desenvolvimento.",
        cta: "Iniciar Consulta",
        topics: "Áreas de Expertise",
        topicsList: [
            { icon: Globe, title: "Economia Global", desc: "Análise das dinâmicas geoeconômicas contemporâneas" },
            { icon: TrendingUp, title: "Comércio Internacional", desc: "Estratégias para inserção competitiva global" },
            { icon: Building2, title: "BRICS & Emergentes", desc: "O futuro das economias em desenvolvimento" },
            { icon: Landmark, title: "Diplomacia Econômica", desc: "Negociações e acordos multilaterais" },
            { icon: BookOpen, title: "Inovação & Tecnologia", desc: "O papel da tecnologia na competitividade global" },
        ],
        credentials: "Credenciais",
        credentialsList: [
            "Presidente do Novo Banco de Desenvolvimento (2020-2023)",
            "Secretário Especial de Comércio Exterior do Brasil",
            "Fellow na Blavatnik School of Government, Oxford",
            "Research Scholar, Columbia University"
        ],
        quote: "Temos todas as cartas na mão, mas só jogaremos bem se fizermos a lição de casa antes do colapso.",
        forBoards: "Para Conselhos & Executivos",
        forMedia: "Para Mídia & Analistas"
    },
    en: {
        title: "Marcos Prado Troyjo",
        subtitle: "Digital Twin",
        tagline: "Economist · Diplomat · Former BRICS Bank President",
        description: "Access strategic insights on global economics, international trade, and competitiveness directly from the mind that led the New Development Bank.",
        cta: "Start Consultation",
        topics: "Areas of Expertise",
        topicsList: [
            { icon: Globe, title: "Global Economics", desc: "Analysis of contemporary geoeconomic dynamics" },
            { icon: TrendingUp, title: "International Trade", desc: "Strategies for competitive global insertion" },
            { icon: Building2, title: "BRICS & Emerging Markets", desc: "The future of developing economies" },
            { icon: Landmark, title: "Economic Diplomacy", desc: "Multilateral negotiations and agreements" },
            { icon: BookOpen, title: "Innovation & Technology", desc: "Technology's role in global competitiveness" },
        ],
        credentials: "Credentials",
        credentialsList: [
            "President of New Development Bank (2020-2023)",
            "Brazil's Special Secretary of Foreign Trade",
            "Fellow at Blavatnik School of Government, Oxford",
            "Research Scholar, Columbia University"
        ],
        quote: "We have all the cards in hand, but we will only play well if we do our homework before the collapse.",
        forBoards: "For Boards & Executives",
        forMedia: "For Media & Analysts"
    }
};

export default function Home() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const t = translations[lang];

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
    }, [lang]);

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">MT</span>
                        </div>
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
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#B8860B]/10 text-[#B8860B] text-sm font-medium mb-6">
                                <span className="w-2 h-2 rounded-full bg-[#B8860B] animate-pulse" />
                                Digital Twin Active
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-[#002D62] leading-tight mb-4">
                                {t.title}
                            </h1>
                            <p className="text-2xl text-[#00654A] font-light mb-2">{t.subtitle}</p>
                            <p className="text-lg text-[#333F48]/70 mb-6">{t.tagline}</p>
                            <p className="text-[#333F48] text-lg leading-relaxed mb-8 max-w-xl">
                                {t.description}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to={createPageUrl('Consultation')}>
                                    <Button size="lg" className="bg-[#002D62] hover:bg-[#001d42] text-white gap-2 text-lg px-8">
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
                                <div className="absolute inset-0 bg-gradient-to-br from-[#002D62]/20 to-[#00654A]/20 rounded-3xl transform rotate-6" />
                                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
                                    <img 
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Marcos_Troyjo_2020.jpg/800px-Marcos_Troyjo_2020.jpg"
                                        alt="Marcos Prado Troyjo"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#002D62]/90 via-[#002D62]/20 to-transparent" />
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <BookOpen className="w-8 h-8 text-[#B8860B] mb-3" />
                                        <p className="text-white text-lg italic leading-relaxed font-light">
                                            "{t.quote}"
                                        </p>
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
                                icon: '🎭',
                                title: lang === 'pt' ? 'Adaptação de Persona' : 'Persona Adaptation',
                                desc: lang === 'pt' 
                                    ? 'O Digital Twin ajusta automaticamente seu estilo de comunicação (Professor, Técnico, Diplomático) baseado no seu perfil e interações'
                                    : 'The Digital Twin automatically adjusts its communication style (Professor, Technical, Diplomatic) based on your profile and interactions'
                            },
                            {
                                icon: '📈',
                                title: lang === 'pt' ? 'Rastreamento de Tópicos' : 'Topic Tracking',
                                desc: lang === 'pt'
                                    ? 'Sistema inteligente que monitora tópicos frequentes e oferece sugestões proativas de conteúdo relevante'
                                    : 'Intelligent system that monitors frequent topics and offers proactive suggestions for relevant content'
                            },
                            {
                                icon: '⚙️',
                                title: lang === 'pt' ? 'Perfil Personalizável' : 'Customizable Profile',
                                desc: lang === 'pt'
                                    ? 'Defina suas áreas de interesse (indústrias, regiões, teorias) para experiência sob medida'
                                    : 'Define your areas of interest (industries, regions, theories) for tailored experience'
                            },
                            {
                                icon: '👍',
                                title: lang === 'pt' ? 'Feedback Integrado' : 'Integrated Feedback',
                                desc: lang === 'pt'
                                    ? 'Avalie respostas diretamente nas mensagens para refinar continuamente a qualidade das interações'
                                    : 'Rate responses directly in messages to continuously refine interaction quality'
                            },
                            {
                                icon: '🎯',
                                title: lang === 'pt' ? 'Dashboard Dinâmico' : 'Dynamic Dashboard',
                                desc: lang === 'pt'
                                    ? 'Visualização customizável com insights, vocabulário técnico e análise de conversas'
                                    : 'Customizable visualization with insights, technical vocabulary and conversation analysis'
                            },
                            {
                                icon: '🧠',
                                title: lang === 'pt' ? 'Protocolo HUA' : 'HUA Protocol',
                                desc: lang === 'pt'
                                    ? 'Validação rigorosa de Hierarquia, Utilidade e Aderência para garantir máxima fidelidade ao pensamento Troyjo'
                                    : 'Rigorous validation of Hierarchy, Utility and Adherence to ensure maximum fidelity to Troyjo\'s thinking'
                            }
                        ].map((capability, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#002D62]/30 hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                                    {capability.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#002D62] mb-3">
                                    {capability.title}
                                </h3>
                                <p className="text-[#333F48] leading-relaxed">
                                    {capability.desc}
                                </p>
                            </motion.div>
                        ))}
                        </div>
                        </div>
                        </section>

            {/* Topics */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-[#002D62] mb-12 text-center"
                    >
                        {t.topics}
                    </motion.h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {t.topicsList.map((topic, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group p-6 rounded-2xl border border-gray-100 hover:border-[#002D62]/20 hover:shadow-lg transition-all duration-300 bg-white"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <topic.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-[#333F48] mb-2">{topic.title}</h3>
                                <p className="text-sm text-[#333F48]/60">{topic.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Credentials */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-[#002D62] to-[#00654A] rounded-3xl p-8 md:p-12"
                    >
                        <h2 className="text-2xl font-bold text-white mb-8">{t.credentials}</h2>
                        <div className="space-y-4">
                            {t.credentialsList.map((credential, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <div className="w-2 h-2 rounded-full bg-[#B8860B]" />
                                    <span className="text-white/90">{credential}</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link to={createPageUrl('Consultation') + '?context=board'}>
                                <Button variant="secondary" className="bg-white text-[#002D62] hover:bg-gray-100 gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {t.forBoards}
                                </Button>
                            </Link>
                            <Link to={createPageUrl('Consultation') + '?context=media'}>
                                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
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
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#333F48]/60">
                    <p>© 2025 Marcos Prado Troyjo Digital Twin</p>
                    <p>{lang === 'pt' ? 'Conhecimento base até dezembro de 2025' : 'Knowledge base up to December 2025'}</p>
                </div>
            </footer>
        </div>
    );
}