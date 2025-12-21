import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
    ArrowRight, Globe, TrendingUp, BookOpen, Calendar, 
    LayoutDashboard, MessageSquare, Mail, Sparkles, Award,
    FileText, Video, Database, Star, Clock, Eye, ThumbsUp,
    Search, Filter, ExternalLink, User, LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import NeologismShowcase from '@/components/neologisms/NeologismShowcase';
import AudienceSegmentation from '@/components/audience/AudienceSegmentation';
import ConceptEvolutionTimeline from '@/components/neologisms/ConceptEvolutionTimeline';
import PublicationCard from '@/components/media/PublicationCard';
import PolicyObservatory from '@/components/observatory/PolicyObservatory';
import ArticleCard from '@/components/editorial/ArticleCard';
import { toast } from 'sonner';

const translations = {
    pt: {
        nav: { home: 'Início', about: 'Sobre', knowledge: 'Conhecimento', blog: 'Blog', pricing: 'Planos', login: 'Entrar', signup: 'Cadastrar' },
        hero: {
            title: 'Formador de Opinião Global',
            subtitle: 'De "desglobalização" (2015) a "Novo ESG" (2025): uma década de inovação conceitual',
            tagline: 'Marcos Troyjo · Economista · Ex-Presidente do Banco do BRICS',
            cta: 'Iniciar Consulta Gratuita',
            ctaDashboard: 'Acessar Dashboard',
            contextUpdate: 'Atualização Geopolítica (nov/2025)',
            contextText: 'Após meses de volatilidade máxima (Mar-Set 2025), o ambiente comercial global apresenta distensão tática — cessar-fogo EUA-China (até nov/2026), Brasil negocia acordo provisório. A trumpulência está GERENCIADA, não eliminada.'
        },
        about: {
            title: 'Expertise Geopolítica de Classe Mundial',
            text: 'Ex-Presidente do Novo Banco de Desenvolvimento (NDB/BRICS, 2020-2023), primeiro ocidental a liderar a instituição. Fellow na Blavatnik School of Government (Oxford), Research Scholar na Columbia University. Criador de frameworks conceituais que moldaram o debate geopolítico brasileiro: de "desglobalização" a "trumpulência" e "Novo ESG".'
        },
        books: { title: 'Principais Livros', purchase: 'Adquirir' },
        awards: { title: 'Prêmios & Reconhecimentos' },
        publications: { title: 'Artigos & Entrevistas', all: 'Todos', articles: 'Artigos', interviews: 'Entrevistas' },
        knowledge: { title: 'Base de Conhecimento', subtitle: 'Encontre respostas, tutoriais e guias', search: 'Buscar...', noResults: 'Nenhum resultado' },
        blog: { title: 'Blog de Inteligência Estratégica', featured: 'Artigos em Destaque', recent: 'Recentes', readMore: 'Ler mais' },
        newsletter: { title: 'Newsletter', subtitle: 'Receba análises semanais', email: 'Seu e-mail', subscribe: 'Assinar' },
        footer: { rights: 'Todos os direitos reservados.', powered: 'Desenvolvido com TSI v9.3 Framework | HUA Protocol 95%+ Fidelity' }
    },
    en: {
        nav: { home: 'Home', about: 'About', knowledge: 'Knowledge', blog: 'Blog', pricing: 'Pricing', login: 'Login', signup: 'Sign Up' },
        hero: {
            title: 'Global Thought Leader',
            subtitle: 'From "deglobalization" (2015) to "New ESG" (2025): a decade of conceptual innovation',
            tagline: 'Marcos Troyjo · Economist · Former BRICS Bank President',
            cta: 'Start Free Consultation',
            ctaDashboard: 'Access Dashboard',
            contextUpdate: 'Geopolitical Update (Nov/2025)',
            contextText: 'After months at maximum volatility (Mar-Sep 2025), global trade environment shows tactical détente — US-China ceasefire (until Nov/2026), Brazil negotiates provisional agreement. Trumpulence is MANAGED, not eliminated.'
        },
        about: {
            title: 'World-Class Geopolitical Expertise',
            text: 'Former President of New Development Bank (NDB/BRICS, 2020-2023), first Westerner to lead the institution. Fellow at Blavatnik School of Government (Oxford), Research Scholar at Columbia University. Creator of conceptual frameworks that shaped Brazilian geopolitical debate: from "deglobalization" to "trumpulence" and "New ESG".'
        },
        books: { title: 'Main Books', purchase: 'Purchase' },
        awards: { title: 'Awards & Recognition' },
        publications: { title: 'Articles & Interviews', all: 'All', articles: 'Articles', interviews: 'Interviews' },
        knowledge: { title: 'Knowledge Base', subtitle: 'Find answers, tutorials and guides', search: 'Search...', noResults: 'No results' },
        blog: { title: 'Strategic Intelligence Blog', featured: 'Featured Articles', recent: 'Recent', readMore: 'Read more' },
        newsletter: { title: 'Newsletter', subtitle: 'Receive weekly analysis', email: 'Your email', subscribe: 'Subscribe' },
        footer: { rights: 'All rights reserved.', powered: 'Developed with TSI v9.3 Framework | HUA Protocol 95%+ Fidelity' }
    }
};

export default function PublicWebsite() {
    const navigate = useNavigate();
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [activeSection, setActiveSection] = useState('home');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [publications, setPublications] = useState([]);
    const [knowledgeEntries, setKnowledgeEntries] = useState([]);
    const [blogArticles, setBlogArticles] = useState([]);
    const [pubFilter, setPubFilter] = useState('all');
    const [knowledgeSearch, setKnowledgeSearch] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);

    const t = translations[lang];

    useEffect(() => {
        checkAuth();
        loadContent();
    }, []);

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
    }, [lang]);

    const checkAuth = async () => {
        try {
            const auth = await base44.auth.isAuthenticated();
            setIsAuthenticated(auth);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };

    const loadContent = async () => {
        setLoading(true);
        try {
            const [pubs, knowledge, blog] = await Promise.all([
                base44.entities.Publication.list('-publication_date', 20),
                base44.entities.KnowledgeEntry.filter({ status: 'publicado' }),
                base44.entities.Article.filter({ status: 'publicado' })
            ]);

            setPublications(pubs || []);
            setKnowledgeEntries(knowledge || []);
            setBlogArticles(blog || []);
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = () => {
        base44.auth.redirectToLogin(createPageUrl('Welcome'));
    };

    const handleLogin = () => {
        base44.auth.redirectToLogin(createPageUrl('Dashboard'));
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
            toast.success(lang === 'pt' ? 'Inscrição realizada!' : 'Subscribed successfully!');
            setEmail('');
        } catch (error) {
            console.error('Error subscribing:', error);
            toast.error(lang === 'pt' ? 'Erro ao inscrever' : 'Error subscribing');
        }
    };

    const books = [
        { 
            title: 'Tecnologia e Diplomacia', 
            year: '2003', 
            description: 'Análise sobre o papel da tecnologia nas relações internacionais',
            purchaseLink: 'https://www.amazon.com.br/s?k=Tecnologia+Diplomacia+Marcos+Troyjo',
            cover: 'https://m.media-amazon.com/images/I/51MxQnB7qNL._SY344_BO1,204,203,200_.jpg'
        },
        { 
            title: 'Nação-Comerciante', 
            year: '2007', 
            description: 'Estratégias de inserção internacional competitiva',
            purchaseLink: 'https://www.amazon.com.br/Na%C3%A7%C3%A3o-Comerciante-Marcos-Troyjo/dp/8535220496',
            cover: 'https://m.media-amazon.com/images/I/41YZwQXnCLL._SY344_BO1,204,203,200_.jpg'
        },
        { 
            title: 'Desglobalização', 
            year: '2016', 
            description: 'Reflexões sobre o futuro da globalização',
            purchaseLink: 'https://www.amazon.com.br/Desglobaliza%C3%A7%C3%A3o-Marcos-Troyjo/dp/8501109568',
            cover: 'https://m.media-amazon.com/images/I/51XQmB9VWZL._SY344_BO1,204,203,200_QL70_ML2_.jpg'
        },
        { 
            title: 'A Metamorfose dos BRICS', 
            year: '2016', 
            description: 'Transformações nas economias emergentes',
            purchaseLink: 'https://www.amazon.com.br/Metamorfose-dos-BRICS-Marcos-Troyjo/dp/8501110477',
            cover: 'https://m.media-amazon.com/images/I/51B7sQdLcmL._SY344_BO1,204,203,200_QL70_ML2_.jpg'
        },
        { 
            title: 'Trading Up', 
            year: '2022', 
            description: 'Competitividade global no século XXI',
            purchaseLink: 'https://www.amazon.com.br/Trading-Up-Brasil-tornar-pot%C3%AAncia/dp/8501117420',
            cover: 'https://m.media-amazon.com/images/I/41XyH+JYZRL._SY344_BO1,204,203,200_.jpg'
        }
    ];

    const awards = [
        'Grande Oficial da Ordem do Rio Branco',
        'Personalidade do Comércio Exterior (FUNCEX 2020)',
        'TOYP World (The Outstanding Young Person) - 2004',
        'Presidente do Novo Banco de Desenvolvimento (NDB) - 2020-2023'
    ];

    const filteredPublications = publications.filter(pub => 
        pubFilter === 'all' || pub.type === pubFilter
    );

    const filteredKnowledge = knowledgeEntries.filter(entry => 
        !knowledgeSearch || 
        entry.title?.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
        entry.summary?.toLowerCase().includes(knowledgeSearch.toLowerCase())
    );

    const scrollToSection = (section) => {
        setActiveSection(section);
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Navigation */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                <span className="text-white font-bold text-sm">MT</span>
                            </div>
                            <div>
                                <span className="font-bold text-[#002D62] text-lg">Troyjo</span>
                                <span className="text-[#333F48] text-sm ml-2">Digital Twin</span>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs border-[#B8860B] text-[#B8860B]">BETA</Badge>
                        </div>
                        
                        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
                            <button onClick={() => scrollToSection('home')} className="text-[#333F48] hover:text-[#002D62] transition-colors">
                                {t.nav.home}
                            </button>
                            <button onClick={() => scrollToSection('about')} className="text-[#333F48] hover:text-[#002D62] transition-colors">
                                {t.nav.about}
                            </button>
                            <button onClick={() => scrollToSection('knowledge')} className="text-[#333F48] hover:text-[#002D62] transition-colors">
                                {t.nav.knowledge}
                            </button>
                            <button onClick={() => scrollToSection('blog')} className="text-[#333F48] hover:text-[#002D62] transition-colors">
                                {t.nav.blog}
                            </button>
                            <Link to={createPageUrl('Pricing')} className="text-[#333F48] hover:text-[#002D62] transition-colors">
                                {t.nav.pricing}
                            </Link>
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                            >
                                <Globe className="w-4 h-4" />
                                {lang === 'pt' ? 'EN' : 'PT'}
                            </button>
                            {isAuthenticated ? (
                                <Link to={createPageUrl('Dashboard')}>
                                    <Button size="sm" className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" onClick={handleLogin} className="gap-2">
                                        <LogIn className="w-4 h-4" />
                                        <span className="hidden sm:inline">{t.nav.login}</span>
                                    </Button>
                                    <Button size="sm" onClick={handleSignUp} className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                                        <User className="w-4 h-4" />
                                        <span className="hidden sm:inline">{t.nav.signup}</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section id="home" className="bg-gradient-to-b from-[#FAF7F2] to-white py-24">
                    <div className="max-w-7xl mx-auto px-4 md:px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-medium mb-6">
                                    <Sparkles className="w-4 h-4 text-amber-600" />
                                    <span className="text-amber-900">{t.hero.contextUpdate}</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold text-[#002D62] leading-tight mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                    {t.hero.title} <span className="text-[#D4AF37]">24/7</span>
                                </h1>
                                <p className="text-xl text-[#2D2D2D] mb-3">{t.hero.subtitle}</p>
                                <p className="text-lg text-[#2D2D2D]/80 mb-6">{t.hero.tagline}</p>
                                
                                <div className="bg-white rounded-lg border-l-4 border-[#D4AF37] p-4 mb-6">
                                    <p className="text-sm text-[#2D2D2D] leading-relaxed">
                                        <strong>📊 {t.hero.contextUpdate}:</strong> {t.hero.contextText}
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-4">
                                    <Button size="lg" onClick={handleSignUp} className="bg-[#002D62] hover:bg-[#001d42] text-white gap-2 text-lg px-8">
                                        {t.hero.cta}
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                    {isAuthenticated && (
                                        <Link to={createPageUrl('Dashboard')}>
                                            <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                                                <LayoutDashboard className="w-5 h-5" />
                                                {t.hero.ctaDashboard}
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-4 mt-8">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#002D62]">95%+</div>
                                        <div className="text-xs text-[#6B6B6B]">{lang === 'pt' ? 'Fidelidade HUA' : 'HUA Fidelity'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#002D62]">24/7</div>
                                        <div className="text-xs text-[#6B6B6B]">{lang === 'pt' ? 'Disponível' : 'Available'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#002D62]">11</div>
                                        <div className="text-xs text-[#6B6B6B]">{lang === 'pt' ? 'Neologismos' : 'Neologisms'}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#002D62]">2020-2023</div>
                                        <div className="text-xs text-[#6B6B6B]">{lang === 'pt' ? 'Pres. NDB' : 'NDB Pres.'}</div>
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#002D62]/90 via-transparent to-transparent" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Concept Evolution */}
                <section className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Evolução Conceitual' : 'Conceptual Evolution'}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {lang === 'pt' ? 'Acompanhe a jornada intelectual de 2015 a 2025' : 'Follow the intellectual journey from 2015 to 2025'}
                            </p>
                        </motion.div>
                        <ConceptEvolutionTimeline lang={lang} />
                    </div>
                </section>

                {/* Neologisms */}
                <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Inovação Conceitual' : 'Conceptual Innovation'}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {lang === 'pt' ? 'Os 11 neologismos que definem o pensamento estratégico' : 'The 11 neologisms that define strategic thinking'}
                            </p>
                        </motion.div>
                        <NeologismShowcase lang={lang} />
                    </div>
                </section>

                {/* Audiences */}
                <section className="py-20 px-4 md:px-6 bg-white">
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
                                {lang === 'pt' ? 'Experiência customizada para diferentes contextos' : 'Customized experience for different contexts'}
                            </p>
                        </motion.div>
                        <AudienceSegmentation lang={lang} />
                    </div>
                </section>

                {/* About */}
                <section id="about" className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {t.about.title}
                        </h2>
                        <p className="text-lg text-[#2D2D2D] leading-relaxed max-w-4xl">{t.about.text}</p>
                    </div>
                </section>

                {/* Books */}
                <section className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#002D62] mb-8 flex items-center gap-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                            <BookOpen className="w-8 h-8" />
                            {t.books.title}
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.map((book, idx) => (
                                <Card key={idx} className="hover:shadow-lg transition-all group overflow-hidden">
                                    {book.cover && (
                                        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                                            <img
                                                src={book.cover}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
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
                                                    {t.books.purchase}
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
                            {t.awards.title}
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {awards.map((award, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md transition-all">
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
                            {t.publications.title}
                        </h2>
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={pubFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setPubFilter('all')}
                                className={pubFilter === 'all' ? 'bg-[#002D62]' : ''}
                            >
                                {t.publications.all}
                            </Button>
                            <Button
                                variant={pubFilter === 'article' ? 'default' : 'outline'}
                                onClick={() => setPubFilter('article')}
                                className={pubFilter === 'article' ? 'bg-[#002D62]' : ''}
                            >
                                {t.publications.articles}
                            </Button>
                            <Button
                                variant={pubFilter === 'interview' ? 'default' : 'outline'}
                                onClick={() => setPubFilter('interview')}
                                className={pubFilter === 'interview' ? 'bg-[#002D62]' : ''}
                            >
                                {t.publications.interviews}
                            </Button>
                        </div>
                        {filteredPublications.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {filteredPublications.slice(0, 6).map((pub, idx) => (
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

                {/* Knowledge Base */}
                <section id="knowledge" className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {t.knowledge.title}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70 mb-6">{t.knowledge.subtitle}</p>
                            <div className="max-w-2xl mx-auto relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    placeholder={t.knowledge.search}
                                    value={knowledgeSearch}
                                    onChange={(e) => setKnowledgeSearch(e.target.value)}
                                    className="pl-12 h-12 text-lg"
                                />
                            </div>
                        </div>
                        {filteredKnowledge.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredKnowledge.slice(0, 6).map((entry) => (
                                    <Link key={entry.id} to={createPageUrl('KnowledgeArticle') + `?id=${entry.id}`}>
                                        <Card className="h-full hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <CardTitle className="text-lg line-clamp-2">{entry.title}</CardTitle>
                                                <CardDescription className="line-clamp-2">{entry.summary}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {entry.estimated_reading_time || 5} min
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" />
                                                        {entry.views || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ThumbsUp className="w-3 h-3" />
                                                        {entry.helpful_votes || 0}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">{t.knowledge.noResults}</div>
                        )}
                    </div>
                </section>

                {/* Blog */}
                <section id="blog" className="py-20 px-4 md:px-6 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-8" style={{ fontFamily: 'Crimson Text, serif' }}>
                            {t.blog.title}
                        </h2>
                        {blogArticles.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogArticles.slice(0, 6).map((article, index) => (
                                    <ArticleCard key={article.id} article={article} lang={lang} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                {lang === 'pt' ? 'Em breve, novos artigos' : 'Coming soon, new articles'}
                            </div>
                        )}
                        <div className="text-center mt-8">
                            <Link to={createPageUrl('StrategicIntelligenceBlog')}>
                                <Button variant="outline" className="gap-2">
                                    {t.blog.readMore}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Policy Observatory */}
                <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-[#002D62] mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
                                {lang === 'pt' ? 'Observatório de Políticas' : 'Policy Observatory'}
                            </h2>
                            <p className="text-lg text-[#2D2D2D]/70">
                                {lang === 'pt' ? 'Linha do tempo de eventos geopolíticos críticos desde 2023' : 'Timeline of critical geopolitical events since 2023'}
                            </p>
                        </motion.div>
                        <PolicyObservatory lang={lang} />
                    </div>
                </section>

                {/* Newsletter CTA */}
                <section id="newsletter" className="py-20 px-4 md:px-6 bg-gradient-to-br from-[#002D62] to-[#00654A]">
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
            </main>

            {/* Footer */}
            <footer className="bg-[#2D2D2D] text-[#FAF7F2] py-16">
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
                            <h4 className="text-[#D4AF37] font-semibold mb-4">{lang === 'pt' ? 'Produto' : 'Product'}</h4>
                            <ul className="space-y-2 text-sm">
                                <li><button onClick={() => scrollToSection('home')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">{t.nav.home}</button></li>
                                <li><button onClick={() => scrollToSection('knowledge')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">{t.nav.knowledge}</button></li>
                                <li><Link to={createPageUrl('Pricing')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">{t.nav.pricing}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[#D4AF37] font-semibold mb-4">{lang === 'pt' ? 'Recursos' : 'Resources'}</h4>
                            <ul className="space-y-2 text-sm">
                                <li><button onClick={() => scrollToSection('blog')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">Blog</button></li>
                                <li><Link to={createPageUrl('Dashboard')} className="text-[#FAF7F2]/70 hover:text-[#D4AF37] transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[#D4AF37] font-semibold mb-4">{lang === 'pt' ? 'Legal' : 'Legal'}</h4>
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
                            © 2025 Marcos Troyjo Digital Twin. {t.footer.rights}
                        </p>
                        <p className="text-xs text-[#FAF7F2]/40">{t.footer.powered}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}