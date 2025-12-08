import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Award, FileText, Video, ExternalLink, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
            title: 'Marcos Troyjo',
            subtitle: 'Economista, Diplomata e Pensador Global',
            about: 'Sobre',
            aboutText: 'Marcos Prado Troyjo é economista formado pela PUC-Rio, mestre em Relações Internacionais pela Boston University e doutor em Sociologia pela USP. Foi presidente do Novo Banco de Desenvolvimento (NDB/BRICS) entre 2020-2023, secretário especial de Comércio Exterior do Brasil (2019-2020), e ocupou diversos cargos de destaque no governo brasileiro e em instituições internacionais.',
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
            filterAll: 'Todos',
            filterArticles: 'Artigos',
            filterInterviews: 'Entrevistas'
        },
        en: {
            title: 'Marcos Troyjo',
            subtitle: 'Economist, Diplomat and Global Thinker',
            about: 'About',
            aboutText: 'Marcos Prado Troyjo is an economist graduated from PUC-Rio, holds a master\'s degree in International Relations from Boston University and a PhD in Sociology from USP. He was president of the New Development Bank (NDB/BRICS) between 2020-2023, special secretary of Foreign Trade of Brazil (2019-2020), and held several prominent positions in the Brazilian government and international institutions.',
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
            filterAll: 'All',
            filterArticles: 'Articles',
            filterInterviews: 'Interviews'
        }
    };

    const text = t[lang];

    const books = [
        { title: 'Tecnologia e Diplomacia', year: '2003', description: 'Análise sobre o papel da tecnologia nas relações internacionais' },
        { title: 'Nação-Comerciante', year: '2007', description: 'Estratégias de inserção internacional competitiva' },
        { title: 'Desglobalização', year: '2016', description: 'Reflexões sobre o futuro da globalização' },
        { title: 'A Metamorfose dos BRICS', year: '2016', description: 'Transformações nas economias emergentes' },
        { title: 'Trading Up', year: '2022', description: 'Competitividade global no século XXI' }
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

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-16 space-y-24 relative z-10">
                {/* Hero */}
                <section className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-[#002D62]">{text.title}</h1>
                        <p className="text-xl md:text-2xl text-[#333F48]">{text.subtitle}</p>
                    </motion.div>
                </section>

                {/* About */}
                <section>
                    <h2 className="text-3xl font-bold text-[#002D62] mb-6">{text.about}</h2>
                    <p className="text-lg text-[#333F48] leading-relaxed">{text.aboutText}</p>
                </section>

                {/* Books */}
                <section>
                    <h2 className="text-3xl font-bold text-[#002D62] mb-8 flex items-center gap-3">
                        <BookOpen className="w-8 h-8" />
                        {text.books}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book, idx) => (
                            <Card key={idx} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">{book.title}</CardTitle>
                                        <Badge variant="outline">{book.year}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-[#333F48]/70">{book.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Awards */}
                <section>
                    <h2 className="text-3xl font-bold text-[#002D62] mb-8 flex items-center gap-3">
                        <Award className="w-8 h-8" />
                        {text.awards}
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {awards.map((award, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-white">
                                <Award className="w-5 h-5 text-[#B8860B] flex-shrink-0 mt-0.5" />
                                <span className="text-[#333F48]">{award}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Publications */}
                <section>
                    <h2 className="text-3xl font-bold text-[#002D62] mb-8 flex items-center gap-3">
                        <FileText className="w-8 h-8" />
                        {text.publications}
                    </h2>

                    <div className="flex gap-2 mb-6">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                            className={filter === 'all' ? 'bg-[#002D62]' : ''}
                        >
                            {text.filterAll}
                        </Button>
                        <Button
                            variant={filter === 'article' ? 'default' : 'outline'}
                            onClick={() => setFilter('article')}
                            className={filter === 'article' ? 'bg-[#002D62]' : ''}
                        >
                            {text.filterArticles}
                        </Button>
                        <Button
                            variant={filter === 'interview' ? 'default' : 'outline'}
                            onClick={() => setFilter('interview')}
                            className={filter === 'interview' ? 'bg-[#002D62]' : ''}
                        >
                            {text.filterInterviews}
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredPublications.map((pub, idx) => (
                            <Card key={idx} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <Badge variant={pub.type === 'interview' ? 'secondary' : 'default'}>
                                            {pub.type === 'interview' ? text.interviews : text.articles}
                                        </Badge>
                                        {pub.publication_date && (
                                            <span className="text-sm text-[#333F48]/60">
                                                {new Date(pub.publication_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">{pub.title}</CardTitle>
                                    {pub.outlet && (
                                        <p className="text-sm text-[#333F48]/60 mt-1">{pub.outlet}</p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {pub.summary && (
                                        <p className="text-sm text-[#333F48] mb-4">{pub.summary}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {pub.url && (
                                            <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    <ExternalLink className="w-3 h-3" />
                                                    {text.viewArticle}
                                                </Button>
                                            </a>
                                        )}
                                        {pub.video_link && (
                                            <a href={pub.video_link} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="outline" className="gap-2">
                                                    <Video className="w-3 h-3" />
                                                    {text.watch}
                                                </Button>
                                            </a>
                                        )}
                                        {pub.purchase_link && (
                                            <a href={pub.purchase_link} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" className="gap-2 bg-[#B8860B] hover:bg-[#9a7209]">
                                                    <BookOpen className="w-3 h-3" />
                                                    {text.purchase}
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#002D62] text-white py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="text-center">
                        <p className="text-sm opacity-80">
                            © 2025 Marcos Troyjo Digital Twin - {lang === 'pt' ? 'Desenvolvido por' : 'Developed by'} CAIO.Vision
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}