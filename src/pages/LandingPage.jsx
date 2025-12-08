import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
    ArrowRight, Globe, TrendingUp, BookOpen, Calendar, 
    LayoutDashboard, MessageSquare, Mail, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArticleCard from '@/components/editorial/ArticleCard';
import EditorialCard from '@/components/editorial/EditorialCard';
import { toast } from 'sonner';

const translations = {
    pt: {
        headline: 'Geopolítica, tecnologia e Brasil em posição de ataque.',
        subheadline: 'Análises assinadas por Marcos Troyjo, com suporte de inteligência artificial estratégica.',
        ctaRead: 'Ler artigo da semana',
        ctaNewsletter: 'Receber análises por e-mail',
        featured: 'Artigos em Destaque',
        backlog: 'Calendário Editorial',
        nextWeeks: 'Próximas Semanas',
        dailyContent: 'Conteúdo Diário',
        about: 'Sobre o Projeto',
        aboutText: 'O Troyjo Digital Twin combina a expertise de Marcos Prado Troyjo em economia global, comércio internacional e competitividade com sistemas avançados de IA para análise estratégica. O projeto oferece consultas personalizadas, análises de documentos e geração de conteúdo especializado para tomadores de decisão em política pública, defesa e negócios internacionais.',
        subscribe: 'Assine',
        email: 'Seu e-mail',
        contact: 'Contato & Newsletter',
        loading: 'Carregando...',
        subscribeSuccess: 'Inscrição realizada com sucesso!',
        allArticles: 'Ver todos os artigos',
        consultation: 'Iniciar Consulta',
        dashboard: 'Painel de Controle'
    },
    en: {
        headline: 'Geopolitics, technology and Brazil on the offensive.',
        subheadline: 'Analysis by Marcos Troyjo, powered by strategic artificial intelligence.',
        ctaRead: 'Read this week\'s article',
        ctaNewsletter: 'Receive analysis by email',
        featured: 'Featured Articles',
        backlog: 'Editorial Calendar',
        nextWeeks: 'Next Weeks',
        dailyContent: 'Daily Content',
        about: 'About the Project',
        aboutText: 'Troyjo Digital Twin combines Marcos Prado Troyjo\'s expertise in global economics, international trade and competitiveness with advanced AI systems for strategic analysis. The project offers personalized consultations, document analysis and specialized content generation for decision-makers in public policy, defense and international business.',
        subscribe: 'Subscribe',
        email: 'Your email',
        contact: 'Contact & Newsletter',
        loading: 'Loading...',
        subscribeSuccess: 'Successfully subscribed!',
        allArticles: 'View all articles',
        consultation: 'Start Consultation',
        dashboard: 'Dashboard'
    }
};

export default function LandingPage() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const t = translations[lang];
    
    const [featuredArticles, setFeaturedArticles] = useState([]);
    const [backlogItems, setBacklogItems] = useState([]);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [tierFilter, setTierFilter] = useState('all');

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
        loadContent();
    }, [lang]);

    const loadContent = async () => {
        setIsLoading(true);
        try {
            const [articles, calendar] = await Promise.all([
                base44.entities.Article.filter({ status: 'publicado' }),
                base44.entities.EditorialCalendarItem.filter({})
            ]);
            
            // Sort by tier first, then date
            const sortedArticles = articles.sort((a, b) => {
                const tierOrder = { troyjo_certified: 3, curator_approved: 2, ai_generated: 1 };
                const tierDiff = (tierOrder[b.quality_tier] || 0) - (tierOrder[a.quality_tier] || 0);
                if (tierDiff !== 0) return tierDiff;
                return new Date(b.publication_date) - new Date(a.publication_date);
            });
            
            setFeaturedArticles(sortedArticles.slice(0, 6));
            
            // Sort calendar by date
            const sorted = calendar.sort((a, b) => 
                new Date(a.scheduled_date) - new Date(b.scheduled_date)
            );
            setBacklogItems(sorted);
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
            toast.success(t.subscribeSuccess);
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">MT</span>
                        </div>
                        <div>
                            <span className="font-bold text-[#002D62]">Troyjo</span>
                            <span className="text-[#333F48] text-sm ml-2">Digital Twin</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.dashboard}</span>
                            </Button>
                        </Link>
                        <Link to={createPageUrl('Consultation')}>
                            <Button size="sm" className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.consultation}</span>
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
                </div>
            </header>

            {/* Hero */}
            <section className="py-20 px-4 md:px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Badge className="bg-[#B8860B] text-white mb-6">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {lang === 'pt' ? 'Powered by AI' : 'Powered by AI'}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-[#002D62] mb-4 leading-tight">
                            {t.headline}
                        </h1>
                        <p className="text-xl text-[#333F48] mb-8 max-w-3xl mx-auto">
                            {t.subheadline}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {featuredArticles.length > 0 && (
                                <Link to={createPageUrl('ArticleView') + `?id=${featuredArticles[0].id}`}>
                                    <Button size="lg" className="bg-[#002D62] hover:bg-[#001d42] gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        {t.ctaRead}
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </Link>
                            )}
                            <Button size="lg" variant="outline" className="gap-2" onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}>
                                <Mail className="w-5 h-5" />
                                {t.ctaNewsletter}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Articles */}
            <section className="py-16 px-4 md:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold text-[#002D62]">{t.featured}</h2>
                        <div className="flex gap-2">
                            <Button
                                variant={tierFilter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTierFilter('all')}
                            >
                                {lang === 'pt' ? 'Todos' : 'All'}
                            </Button>
                            <Button
                                variant={tierFilter === 'troyjo_certified' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTierFilter('troyjo_certified')}
                                className={tierFilter === 'troyjo_certified' ? 'bg-[#B8860B] hover:bg-[#9a7209]' : ''}
                            >
                                © Troyjo
                            </Button>
                            <Button
                                variant={tierFilter === 'curator_approved' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTierFilter('curator_approved')}
                            >
                                {lang === 'pt' ? 'Verificado' : 'Verified'}
                            </Button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="text-center py-12 text-[#333F48]/60">{t.loading}</div>
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
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <Calendar className="w-8 h-8 text-[#002D62]" />
                        <h2 className="text-3xl font-bold text-[#002D62]">{t.backlog}</h2>
                    </div>
                    
                    <Tabs defaultValue="next_weeks" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="next_weeks">{t.nextWeeks}</TabsTrigger>
                            <TabsTrigger value="daily">{t.dailyContent}</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="next_weeks">
                            {nextWeekItems.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {nextWeekItems.map((item, index) => (
                                        <EditorialCard key={item.id} item={item} lang={lang} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-[#333F48]/60">
                                    {lang === 'pt' ? 'Nenhum item programado' : 'No items scheduled'}
                                </div>
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
                                <div className="text-center py-12 text-[#333F48]/60">
                                    {lang === 'pt' ? 'Nenhum conteúdo diário programado' : 'No daily content scheduled'}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* About */}
            <section className="py-16 px-4 md:px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-[#002D62] mb-6">{t.about}</h2>
                    <p className="text-lg text-[#333F48] leading-relaxed">
                        {t.aboutText}
                    </p>
                </div>
            </section>

            {/* Newsletter */}
            <section id="newsletter" className="py-16 px-4 md:px-6 bg-gradient-to-br from-[#002D62] to-[#00654A]">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">{t.contact}</h2>
                    <p className="text-white/90 mb-6">
                        {lang === 'pt' 
                            ? 'Receba análises semanais diretamente no seu e-mail' 
                            : 'Receive weekly analysis directly in your inbox'}
                    </p>
                    <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.email}
                            className="bg-white"
                            required
                        />
                        <Button type="submit" variant="secondary" className="gap-2">
                            <Mail className="w-4 h-4" />
                            {t.subscribe}
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