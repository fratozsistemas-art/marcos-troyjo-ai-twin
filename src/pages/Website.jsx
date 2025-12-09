import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Award, FileText, Video, ExternalLink, Globe, Mail, Sparkles, MessageSquare, LayoutDashboard, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import NeologismShowcase from '@/components/neologisms/NeologismShowcase';
import AudienceSegmentation from '@/components/audience/AudienceSegmentation';
import ConceptEvolutionTimeline from '@/components/neologisms/ConceptEvolutionTimeline';
import PublicationCard from '@/components/media/PublicationCard';

export default function Website() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPublications();
    }, []);

    const loadPublications = async () => {
        setLoading(true);
        try {
            const pubs = await base44.entities.Publication.list('-publication_date', 50);
            setPublications(pubs);
        } catch (error) {
            console.error('Error loading publications:', error);
        } finally {
            setLoading(false);
        }
    };

    const t = {
        pt: {
            title: 'O Pensador que Criou "Trumpulência"',
            subtitle: 'De "desglobalização" (2015) a "Novo ESG" (2025): uma década de inovação conceitual',
            tagline: 'Marcos Troyjo · Economista · Ex-Presidente do Banco do BRICS',
            about: 'Expertise Geopolítica de Classe Mundial',
            aboutText: 'Ex-Presidente do Novo Banco de Desenvolvimento (NDB/BRICS, 2020-2023), primeiro ocidental a liderar a instituição. Fellow na Blavatnik School of Government (Oxford), Research Scholar na Columbia University. Criador de frameworks conceituais que moldaram o debate geopolítico brasileiro: de "desglobalização" a "trumpulência" e "Novo ESG".',
            books: 'Principais Livros',
            awards: 'Prêmios & Reconhecimentos',
            publications: 'Artigos & Entrevistas',
            articles: 'Artigos',
            interviews: 'Entrevistas',
            viewArticle: 'Ver artigo',
            watch: 'Assistir',
            purchase: 'Adquirir',
            newsletter: 'Newsletter',
            newsletterDesc: 'Receba análises e insights sobre economia global',
            subscribe: 'Inscrever',
            accessTwin: 'Acessar Digital Twin',
            dashboard: 'Painel',
            filterAll: 'Todos',
            filterArticles: 'Artigos',
            filterInterviews: 'Entrevistas',
            cta: 'Iniciar Consulta',
            contextUpdate: 'Atualização Geopolítica (09/Dez/2025)',
            contextText: 'Após meses de volatilidade máxima (Mar-Set 2025), o ambiente comercial global apresenta distensão tática — cessar-fogo EUA-China (até nov/2026), Brasil negocia acordo provisório. A trumpulência está GERENCIADA, não eliminada.',
            capabilities: 'Capacidades do Digital Twin',
            audiences: 'Quem Você É?',
            audiencesDesc: 'Experiência customizada para diferentes contextos',
            neologisms: 'Inovação Conceitual',
            neologismsDesc: 'Os 11 neologismos que definem o pensamento estratégico',
            conceptEvolution: 'Evolução Conceitual'
        },
        en: {
            title: 'The Thinker who Created "Trumpulence"',
            subtitle: 'From "deglobalization" (2015) to "New ESG" (2025): a decade of conceptual innovation',
            tagline: 'Marcos Troyjo · Economist · Former BRICS Bank President',
            about: 'World-Class Geopolitical Expertise',
            aboutText: 'Former President of New Development Bank (NDB/BRICS, 2020-2023), first Westerner to lead the institution. Fellow at Blavatnik School of Government (Oxford), Research Scholar at Columbia University. Creator of conceptual frameworks that shaped Brazilian geopolitical debate: from "deglobalization" to "trumpulence" and "New ESG".',
            books: 'Main Books',
            awards: 'Awards & Recognition',
            publications: 'Articles & Interviews',
            articles: 'Articles',
            interviews: 'Interviews',
            viewArticle: 'View article',
            watch: 'Watch',
            purchase: 'Purchase',
            newsletter: 'Newsletter',
            newsletterDesc: 'Receive analysis and insights on global economics',
            subscribe: 'Subscribe',
            accessTwin: 'Access Digital Twin',
            dashboard: 'Dashboard',
            filterAll: 'All',
            filterArticles: 'Articles',
            filterInterviews: 'Interviews',
            cta: 'Start Consultation',
            contextUpdate: 'Geopolitical Update (09/Dec/2025)',
            contextText: 'After months at maximum volatility (Mar-Sep 2025), global trade environment shows tactical détente — US-China ceasefire (until Nov/2026), Brazil negotiates provisional agreement. Trumpulence is MANAGED, not eliminated.',
            capabilities: 'Digital Twin Capabilities',
            audiences: 'Who Are You?',
            audiencesDesc: 'Customized experience for different contexts',
            neologisms: 'Conceptual Innovation',
            neologismsDesc: 'The 11 neologisms that define strategic thinking',
            conceptEvolution: 'Conceptual Evolution'
        }
    };

    const text = t[lang];

    const books = [
        { 
            title: 'Tecnologia e Diplomacia', 
            year: '2003', 
            description: 'Análise sobre o papel da tecnologia nas relações internacionais',
            purchaseLink: 'https://www.amazon.com.br/s?k=Tecnologia+Diplomacia+Marcos+Troyjo'
        },
        { 
            title: 'Nação-Comerciante', 
            year: '2007', 
            description: 'Estratégias de inserção internacional competitiva',
            purchaseLink: 'https://www.amazon.com.br/Na%C3%A7%C3%A3o-Comerciante-Marcos-Troyjo/dp/8535220496'
        },
        { 
            title: 'Desglobalização', 
            year: '2016', 
            description: 'Reflexões sobre o futuro da globalização',
            purchaseLink: 'https://www.amazon.com.br/Desglobaliza%C3%A7%C3%A3o-Marcos-Troyjo/dp/8501109568'
        },
        { 
            title: 'A Metamorfose dos BRICS', 
            year: '2016', 
            description: 'Transformações nas economias emergentes',
            purchaseLink: 'https://www.amazon.com.br/Metamorfose-dos-BRICS-Marcos-Troyjo/dp/8501110477'
        },
        { 
            title: 'Trading Up', 
            year: '2022', 
            description: 'Competitividade global no século XXI',
            purchaseLink: 'https://www.amazon.com.br/Trading-Up-Brasil-tornar-pot%C3%AAncia/dp/8501117420'
        }
    ];

    const awards = [
        'Grande Oficial da Ordem do Rio Branco',
        'Personalidade do Comércio Exterior (FUNCEX 2020)',
        'TOYP World (The Outstanding Young Person) - 2004',
        'Presidente do Novo Banco de Desenvolvimento (NDB) - 2020-2023',
        'Professor visitante - Columbia University',
        'Membro do Conselho de Administração - múltiplas organizações internacionais',
        'Consultor sênior - organizações multilaterais'
    ];

    const [filter, setFilter] = useState('all');

    const filteredPublications = publications.filter(pub => {
        if (filter === 'all') return true;
        return pub.type === filter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative">
            {/* Beta Watermark */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 opacity-5 select-none">
                <span className="text-[200px] font-black text-[#002D62] tracking-wider transform -rotate-45">
                    BETA
                </span>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm relative">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">MT</span>
                        </div>
                        <span className="font-bold text-[#002D62] text-xl">{text.title}</span>
                        <Badge variant="outline" className="ml-2 text-xs border-[#B8860B] text-[#B8860B]">BETA</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Globe className="w-4 h-4" />
                            {lang === 'pt' ? 'EN' : 'PT'}
                        </button>
                        <Link to={createPageUrl('Home')}>
                            <Button className="bg-[#002D62] hover:bg-[#001d42]">
                                {text.accessTwin}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="bg-gradient-to-b from-[#FAF7F2] to-white py-24">
                    <div className="max-w-7xl mx-auto px-4 md:px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-medium mb-6">
                                    <Sparkles className="w-4 h-4 text-amber-600" />
                                    <span className="text-amber-900">
                                        {lang === 'pt' ? 'Contexto Atualizado: 09/Dez/2025' : 'Updated Context: 09/Dec/2025'}
                                    </span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold text-[#002D62] leading-tight mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                    {lang === 'pt' ? (
                                        <>O Pensador que Cunhou <span className="text-[#D4AF37]">"Trumpulência"</span></>
                                    ) : (
                                        <>The Thinker who Coined <span className="text-[#D4AF37]">"Trumpulence"</span></>
                                    )}
                                </h1>
                                <p className="text-xl text-[#2D2D2D] mb-3">{text.subtitle}</p>
                                <p className="text-lg text-[#2D2D2D]/80 mb-6">{text.tagline}</p>
                                
                                <div className="bg-white rounded-lg border-l-4 border-[#D4AF37] p-4 mb-6">
                                    <p className="text-sm text-[#2D2D2D] leading-relaxed">
                                        <strong>📊 {text.contextUpdate}:</strong>{' '}
                                        {text.contextText}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-4">
                                    <Link to={createPageUrl('Consultation')}>
                                        <Button size="lg" className="bg-[#002D62] hover:bg-[#001d42] text-white gap-2 text-lg px-8">
                                            {text.cta}
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Link to={createPageUrl('Dashboard')}>
                                        <Button size="lg" variant="outline" className="gap-2 text-lg px-8 border-[#002D62] text-[#002D62] hover:bg-[#002D62] hover:text-white">
                                            <LayoutDashboard className="w-5 h-5" />
                                            {text.dashboard}
                                        </Button>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-4 gap-4 mt-8">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#002D62]">95%+</div>
                                        <div className="text-xs text-[#6B6B6B]">
                                            {lang === 'pt' ? 'Fidelidade HUA' : 'HUA Fidelity'}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#002D62]">24/7</div>
                                        <div className="text-xs text-[#6B6B6B]">
                                            {lang === 'pt' ? 'Disponível' : 'Available'}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#002D62]">11</div>
                                        <div className="text-xs text-[#6B6B6B]">
                                            {lang === 'pt' ? 'Neologismos' : 'Neologisms'}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#002D62]">2020-2023</div>
                                        <div className="text-xs text-[#6B6B6B]">
                                            {lang === 'pt' ? 'Pres. NDB' : 'NDB Pres.'}
                                        </div>
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
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B1538]/15 to-[#D4AF37]/15 rounded-2xl transform rotate-6" />
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl">
                                        <img 
                                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/8c955389f_Replace_the_transparent_checkered_background_with_-1765063055494.png"
                                            alt="Marcos Prado Troyjo"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#8B1538]/90 via-[#8B1538]/20 to-transparent" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#002D62]/90 via-[#002D62]/20 to-transparent" />
                                        <motion.div 
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.4, duration: 0.6 }}
                                            className="absolute bottom-8 left-8 right-8"
                                        >
                                            <BookOpen className="w-8 h-8 text-[#D4AF37] mb-3" />
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

                {/* Concept Evolution Timeline - Option D */}
                <section className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {text.conceptEvolution}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {lang === 'pt'
                                    ? 'Acompanhe a jornada intelectual de 2015 a 2025'
                                    : 'Follow the intellectual journey from 2015 to 2025'}
                            </p>
                        </motion.div>
                        <ConceptEvolutionTimeline lang={lang} />
                    </div>
                </section>

                {/* Neologisms Showcase */}
                <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {text.neologisms}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {text.neologismsDesc}
                            </p>
                        </motion.div>
                        <NeologismShowcase lang={lang} />
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
                            <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {text.audiences}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {text.audiencesDesc}
                            </p>
                        </motion.div>
                        <AudienceSegmentation lang={lang} />
                    </div>
                </section>

                {/* About Section */}
                <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {text.about}
                        </h2>
                        <p className="text-lg text-[#2D2D2D] leading-relaxed max-w-4xl">{text.aboutText}</p>
                    </div>
                </section>

                {/* About */}
                <section>
                    <h2 className="text-3xl font-bold text-[#002D62] mb-6">{text.about}</h2>
                    <p className="text-lg text-[#333F48] leading-relaxed">{text.aboutText}</p>
                </section>

                {/* Books */}
                <section className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-8 flex items-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                            <BookOpen className="w-8 h-8" />
                            {text.books}
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.map((book, idx) => (
                                <Card key={idx} className="hover:shadow-lg hover:border-[#8B1538]/30 transition-all group">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg text-[#002D62]">{book.title}</CardTitle>
                                            <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37]">{book.year}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-[#2D2D2D]/70">{book.description}</p>
                                        {book.purchaseLink && (
                                            <a href={book.purchaseLink} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" className="w-full gap-2 bg-[#D4AF37] hover:bg-[#C19B2A] text-[#2D2D2D]">
                                                    <BookOpen className="w-4 h-4" />
                                                    {text.purchase}
                                                </Button>
                                            </a>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Awards */}
                <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-8 flex items-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                            <Award className="w-8 h-8" />
                            {text.awards}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {awards.map((award, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-white hover:border-[#D4AF37]/30 hover:shadow-md transition-all">
                                    <Award className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                    <span className="text-[#2D2D2D]">{award}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Publications */}
                <section className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-8 flex items-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                            <FileText className="w-8 h-8" />
                            {text.publications}
                        </h2>

                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilter('all')}
                                className={filter === 'all' ? 'bg-[#002D62] hover:bg-[#001d42]' : 'border-[#002D62] text-[#002D62] hover:bg-[#002D62] hover:text-white'}
                            >
                                {text.filterAll}
                            </Button>
                            <Button
                                variant={filter === 'article' ? 'default' : 'outline'}
                                onClick={() => setFilter('article')}
                                className={filter === 'article' ? 'bg-[#002D62] hover:bg-[#001d42]' : 'border-[#002D62] text-[#002D62] hover:bg-[#002D62] hover:text-white'}
                            >
                                {text.filterArticles}
                            </Button>
                            <Button
                                variant={filter === 'interview' ? 'default' : 'outline'}
                                onClick={() => setFilter('interview')}
                                className={filter === 'interview' ? 'bg-[#002D62] hover:bg-[#001d42]' : 'border-[#002D62] text-[#002D62] hover:bg-[#002D62] hover:text-white'}
                            >
                                {text.filterInterviews}
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredPublications.map((pub, idx) => (
                                <PublicationCard key={idx} publication={pub} lang={lang} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#2D2D2D] text-[#FAF7F2] py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <h4 className="text-[#D4AF37] font-semibold mb-4">Marcos Troyjo Digital Twin</h4>
                            <p className="text-sm text-[#FAF7F2]/70 leading-relaxed">
                                {lang === 'pt' 
                                    ? 'Expertise geopolítica de classe mundial, disponível 24/7 via IA com 95%+ de fidelidade HUA-validada.'
                                    : 'World-class geopolitical expertise, available 24/7 via AI with 95%+ HUA-validated fidelity.'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[#D4AF37] font-semibold mb-4">
                                {lang === 'pt' ? 'Produto' : 'Product'}
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#neologisms" className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    {lang === 'pt' ? 'Neologismos' : 'Neologisms'}
                                </a></li>
                                <li><a href="#audiences" className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    {lang === 'pt' ? 'Audiências' : 'Audiences'}
                                </a></li>
                                <li><Link to={createPageUrl('Dashboard')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    Dashboard
                                </Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[#D4AF37] font-semibold mb-4">
                                {lang === 'pt' ? 'Recursos' : 'Resources'}
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to={createPageUrl('StrategicIntelligenceBlog')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    Blog
                                </Link></li>
                                <li><a href="#concept-evolution" className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    ConceptEvolution
                                </a></li>
                                <li><a href="#hua-protocol" className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    {lang === 'pt' ? 'Protocolo HUA' : 'HUA Protocol'}
                                </a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[#D4AF37] font-semibold mb-4">
                                {lang === 'pt' ? 'Empresa' : 'Company'}
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to={createPageUrl('PrivacyPolicy')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    {lang === 'pt' ? 'Privacidade' : 'Privacy'}
                                </Link></li>
                                <li><Link to={createPageUrl('TermsOfService')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    {lang === 'pt' ? 'Termos' : 'Terms'}
                                </Link></li>
                                <li><a href="https://caiovision.com.br" target="_blank" className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">
                                    CAIO.Vision
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    <Separator className="bg-[#6B6B6B] mb-8" />
                    <div className="text-center space-y-2">
                        <p className="text-sm text-[#FAF7F2]/60">
                            © 2025 Marcos Troyjo Digital Twin. {lang === 'pt' ? 'Parte do Ecossistema CAIO. Todos os direitos reservados.' : 'Part of CAIO Ecosystem. All rights reserved.'}
                        </p>
                        <p className="text-xs text-[#FAF7F2]/40">
                            {lang === 'pt' 
                                ? 'Desenvolvido com TSI v9.3 Framework | HUA Protocol 95%+ Fidelity'
                                : 'Developed with TSI v9.3 Framework | HUA Protocol 95%+ Fidelity'}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}