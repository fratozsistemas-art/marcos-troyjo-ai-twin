import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { AgentProvider } from '@/components/agent/AgentProvider';
import AgentControl from '@/components/agent/AgentControl';
import { 
    ArrowLeft, Globe, BookOpen, Award, MessageSquare, 
    Trash2, Eye, Plus, Calendar, Loader2, Database, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PersonaSettings from '@/components/dashboard/PersonaSettings';
import InsightsSection from '@/components/dashboard/InsightsSection';
import KnowledgeHub from '@/components/knowledge/KnowledgeHub';
import ProfileSettings from '@/components/profile/ProfileSettings';
import TopicTracker from '@/components/profile/TopicTracker';

const translations = {
    pt: {
        back: "Voltar",
        title: "Painel de Controle",
        subtitle: "Visão geral do Digital Twin",
        expertise: "Expertise & Princípios",
        expertiseDesc: "Áreas de conhecimento e fundamentos filosóficos",
        books: "Principais Livros",
        awards: "Prêmios & Reconhecimentos",
        conversations: "Histórico de Conversas",
        conversationsDesc: "Gerencie suas consultas anteriores",
        language: "Idioma",
        languageDesc: "Preferência de comunicação",
        newChat: "Nova Conversa",
        view: "Visualizar",
        delete: "Excluir",
        noConversations: "Nenhuma conversa ainda",
        startFirst: "Inicie sua primeira consulta com o Digital Twin",
        loading: "Carregando...",
        deleteConfirm: "Tem certeza que deseja excluir esta conversa?",
        expertiseAreas: [
            { title: "Economia Global", desc: "Análise das dinâmicas geoeconômicas contemporâneas" },
            { title: "Comércio Internacional", desc: "Estratégias para inserção competitiva global" },
            { title: "BRICS & Emergentes", desc: "O futuro das economias em desenvolvimento" },
            { title: "Diplomacia Econômica", desc: "Negociações e acordos multilaterais" },
            { title: "Inovação & Tecnologia", desc: "Tecnologia como ferramenta diplomática" }
        ],
        principles: [
            "Leitura geoeconomica do mundo em transformação permanente",
            "Competitividade e inovação como vantagens estratégicas",
            "Brasil cosmopolita realista: alimento, energia, sustentabilidade",
            "Diplomacia econômica pragmática sem viés ideológico",
            "Novo ESG: Economia + Segurança + Geopolítica"
        ],
        booksList: [
            { title: "Tecnologia e Diplomacia", year: "2003" },
            { title: "Nação-Comerciante", year: "2007" },
            { title: "Desglobalização", year: "2016" },
            { title: "A Metamorfose dos BRICS", year: "2016" },
            { title: "Trading Up", year: "2022" }
        ],
        awardsList: [
            "Grande Oficial da Ordem do Rio Branco",
            "Personalidade do Comércio Exterior (FUNCEX 2020)",
            "TOYP World (2004)",
            "Presidente do Novo Banco de Desenvolvimento (2020-2023)"
        ],
        knowledgeBase: "Base de Conhecimento",
        knowledgeBaseDesc: "Fontes e tipos de documentos utilizados",
        cutoffDate: "Data de corte: Dezembro de 2025",
        sources: [
            { category: "Discursos Públicos", desc: "Palestras, conferências e apresentações oficiais" },
            { category: "Livros Publicados", desc: "Obras acadêmicas e análises econômicas" },
            { category: "Artigos & Ensaios", desc: "Publicações em periódicos especializados" },
            { category: "Entrevistas", desc: "Mídia, podcasts e painéis de discussão" },
            { category: "Documentos Institucionais", desc: "Relatórios do NDB e análises de política comercial" },
            { category: "Artigos de Opinião", desc: "Colunas e comentários sobre economia global" }
        ]
    },
    en: {
        back: "Back",
        title: "Control Panel",
        subtitle: "Digital Twin Overview",
        expertise: "Expertise & Principles",
        expertiseDesc: "Knowledge areas and philosophical foundations",
        books: "Main Books",
        awards: "Awards & Recognition",
        conversations: "Conversation History",
        conversationsDesc: "Manage your previous consultations",
        language: "Language",
        languageDesc: "Communication preference",
        newChat: "New Chat",
        view: "View",
        delete: "Delete",
        noConversations: "No conversations yet",
        startFirst: "Start your first consultation with the Digital Twin",
        loading: "Loading...",
        deleteConfirm: "Are you sure you want to delete this conversation?",
        expertiseAreas: [
            { title: "Global Economics", desc: "Analysis of contemporary geoeconomic dynamics" },
            { title: "International Trade", desc: "Strategies for competitive global insertion" },
            { title: "BRICS & Emerging Markets", desc: "The future of developing economies" },
            { title: "Economic Diplomacy", desc: "Multilateral negotiations and agreements" },
            { title: "Innovation & Technology", desc: "Technology as diplomatic tool" }
        ],
        principles: [
            "Geoeconomic reading of the world in permanent transformation",
            "Competitiveness and innovation as strategic advantages",
            "Realistic cosmopolitan Brazil: food, energy, sustainability",
            "Pragmatic economic diplomacy without ideological bias",
            "New ESG: Economy + Security + Geopolitics"
        ],
        booksList: [
            { title: "Technology and Diplomacy", year: "2003" },
            { title: "Trading Nation", year: "2007" },
            { title: "Deglobalization", year: "2016" },
            { title: "The Metamorphosis of BRICS", year: "2016" },
            { title: "Trading Up", year: "2022" }
        ],
        awardsList: [
            "Grand Officer of the Order of Rio Branco",
            "Foreign Trade Personality (FUNCEX 2020)",
            "TOYP World (2004)",
            "President of New Development Bank (2020-2023)"
        ],
        knowledgeBase: "Knowledge Base",
        knowledgeBaseDesc: "Sources and document types used",
        cutoffDate: "Cutoff date: December 2025",
        sources: [
            { category: "Public Speeches", desc: "Lectures, conferences and official presentations" },
            { category: "Published Books", desc: "Academic works and economic analyses" },
            { category: "Articles & Essays", desc: "Publications in specialized journals" },
            { category: "Interviews", desc: "Media, podcasts and discussion panels" },
            { category: "Institutional Documents", desc: "NDB reports and trade policy analyses" },
            { category: "Opinion Pieces", desc: "Columns and commentary on global economics" }
        ]
    }
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = translations[lang];

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
    }, [lang]);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        setIsLoading(true);
        try {
            const convs = await base44.agents.listConversations({
                agent_name: "troyjo_twin"
            });
            setConversations(convs || []);
        } catch (error) {
            console.error('Error loading conversations:', error);
            setConversations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!confirm(t.deleteConfirm)) return;
        
        try {
            await base44.agents.deleteConversation(conversationId);
            setConversations(conversations.filter(c => c.id !== conversationId));
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const toggleLanguage = () => {
        const newLang = lang === 'pt' ? 'en' : 'pt';
        setLang(newLang);
        localStorage.setItem('troyjo_lang', newLang);
    };

    return (
        <AgentProvider navigate={navigate}>
            <div className="min-h-screen bg-[#FAFAFA]" data-ai-screen="Dashboard">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.back}</span>
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-lg">{t.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{t.subtitle}</p>
                        </div>
                    </div>
                    <Link to={createPageUrl('Consultation')}>
                        <Button 
                            data-ai-id="btn_new_chat"
                            data-ai-role="button"
                            className="bg-[#002D62] hover:bg-[#001d42] text-white gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.newChat}</span>
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Column - Agent Control */}
                    <div className="space-y-6">
                        {/* Agent Control */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <AgentControl lang={lang} />
                        </motion.div>
                        </div>

                        {/* Right Column - Profile Settings */}
                        <div className="space-y-6">
                        {/* Profile Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <ProfileSettings lang={lang} />
                        </motion.div>
                        </div>
                        </div>

                        {/* Bottom Row - Full Width Cards */}
                        <div className="grid lg:grid-cols-3 gap-6 mt-6">
                        {/* Topic Tracker */}
                        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        >
                        <TopicTracker lang={lang} />
                        </motion.div>

                        {/* Knowledge Hub */}
                        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="lg:col-span-2"
                        >
                        <KnowledgeHub lang={lang} />
                        </motion.div>
                        </div>

                        {/* Additional Cards Row */}
                        <div className="grid lg:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-6">

                        {/* Expertise */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                        <BookOpen className="w-5 h-5" />
                                        {t.expertise}
                                    </CardTitle>
                                    <CardDescription>{t.expertiseDesc}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {t.expertiseAreas.map((area, index) => (
                                            <div key={index} className="p-3 rounded-lg border border-gray-100 hover:border-[#002D62]/20 transition-colors">
                                                <h4 className="font-semibold text-sm text-[#002D62] mb-1">{area.title}</h4>
                                                <p className="text-xs text-[#333F48]/70">{area.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div>
                                        <h4 className="font-semibold text-sm text-[#002D62] mb-3">
                                            {lang === 'pt' ? 'Princípios Fundamentais' : 'Foundational Principles'}
                                        </h4>
                                        <ul className="space-y-2">
                                            {t.principles.map((principle, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-[#333F48]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-1.5 flex-shrink-0" />
                                                    {principle}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* AI Insights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <InsightsSection lang={lang} />
                        </motion.div>
                        </div>

                        <div className="space-y-6">
                        {/* Persona Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <PersonaSettings lang={lang} />
                        </motion.div>

                        {/* Conversations History */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                        <MessageSquare className="w-5 h-5" />
                                        {t.conversations}
                                    </CardTitle>
                                    <CardDescription>{t.conversationsDesc}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                                            <span className="ml-2 text-sm text-[#333F48]/60">{t.loading}</span>
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageSquare className="w-12 h-12 text-[#333F48]/20 mx-auto mb-3" />
                                            <p className="text-sm text-[#333F48]/60 mb-1">{t.noConversations}</p>
                                            <p className="text-xs text-[#333F48]/40">{t.startFirst}</p>
                                            <Link to={createPageUrl('Consultation')}>
                                                <Button className="mt-4 bg-[#002D62] hover:bg-[#001d42]">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    {t.newChat}
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {conversations.map((conv) => (
                                                <div
                                                    key={conv.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#002D62]/20 hover:bg-gray-50/50 transition-all"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm text-[#333F48] truncate">
                                                            {conv.metadata?.name || `Conversa ${new Date(conv.created_date).toLocaleDateString()}`}
                                                        </h4>
                                                        <p className="text-xs text-[#333F48]/50 flex items-center gap-1 mt-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(conv.created_date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link to={createPageUrl('Consultation') + `?conversationId=${conv.id}`}>
                                                            <Button 
                                                                data-ai-id={`btn_view_conversation_${conv.id}`}
                                                                data-ai-role="button"
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            data-ai-id={`btn_delete_conversation_${conv.id}`}
                                                            data-ai-role="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteConversation(conv.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    </div>

                    {/* Bottom Section - Books, Awards, Knowledge Base */}
                    <div className="grid lg:grid-cols-3 gap-6 mt-6">
                        {/* Language Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#002D62] text-base">
                                        <Globe className="w-5 h-5" />
                                        {t.language}
                                    </CardTitle>
                                    <CardDescription>{t.languageDesc}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        data-ai-id="btn_toggle_language"
                                        data-ai-role="button"
                                        onClick={toggleLanguage}
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        <span>{lang === 'pt' ? 'Português (Brasil)' : 'English (US)'}</span>
                                        <Globe className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Books */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#002D62] text-base">
                                        <BookOpen className="w-5 h-5" />
                                        {t.books}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {t.booksList.map((book, index) => (
                                            <li key={index} className="flex items-start justify-between text-sm">
                                                <span className="text-[#333F48]">{book.title}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">{book.year}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Awards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#002D62] text-base">
                                        <Award className="w-5 h-5" />
                                        {t.awards}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {t.awardsList.map((award, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-[#333F48]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-1.5 flex-shrink-0" />
                                                {award}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Knowledge Base */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-[#002D62] text-base">
                                        <Database className="w-5 h-5" />
                                        {t.knowledgeBase}
                                    </CardTitle>
                                    <CardDescription>{t.knowledgeBaseDesc}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                                        <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
                                        <span className="text-xs font-medium text-amber-900">{t.cutoffDate}</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {t.sources.map((source, index) => (
                                            <div key={index} className="p-2.5 rounded-lg border border-gray-100 hover:border-[#002D62]/10 transition-colors">
                                                <h5 className="font-semibold text-xs text-[#002D62] mb-0.5">{source.category}</h5>
                                                <p className="text-xs text-[#333F48]/70">{source.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </main>
            </div>
        </AgentProvider>
    );
}