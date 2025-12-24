import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import TroyjoLogo from '@/components/branding/TroyjoLogo';

import { 
    ArrowLeft, Globe, BookOpen, Award, MessageSquare, 
    Trash2, Eye, Plus, Calendar, Loader2, Database, Info, FileSpreadsheet, FileJson,
    Sparkles, ToggleLeft, ToggleRight, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import PersonaSettings from '@/components/dashboard/PersonaSettings';
import AegisIndicator from '@/components/security/AegisIndicator';
import InsightsSection from '@/components/dashboard/InsightsSection';
import KnowledgeHub from '@/components/knowledge/KnowledgeHub';
import ProfileSettings from '@/components/profile/ProfileSettings';
import TopicTracker from '@/components/profile/TopicTracker';
import DocumentManager from '@/components/documents/DocumentManager';
import DocumentChat from '@/components/chat/DocumentChat';
import RAGDocumentManager from '@/components/documents/RAGDocumentManager';
import ExecutiveReports from '@/components/reports/ExecutiveReports';
import ProactiveSuggestions from '@/components/suggestions/ProactiveSuggestions';
import PublicationsSection from '@/components/dashboard/PublicationsSection';
import VoiceCalibration from '@/components/voice-calibration/VoiceCalibration';
import PersonaAnalytics from '@/components/dashboard/PersonaAnalytics';
import CustomizableDashboard from '@/components/dashboard/CustomizableDashboard';

import TopicDeepDive from '@/components/topics/TopicDeepDive';
import CustomPersonaTraits from '@/components/persona/CustomPersonaTraits';
import CustomPersonaManager from '@/components/persona/CustomPersonaManager';
import PersonaHistoryViewer from '@/components/persona/PersonaHistoryViewer';
import GeopoliticalAlertPanel from '@/components/alerts/GeopoliticalAlertPanel';
import AlertFeedManager from '@/components/alerts/AlertFeedManager';
import PersonaSuggestionPanel from '@/components/persona/PersonaSuggestionPanel';
import PersonaTraining from '@/components/persona/PersonaTraining';
import InterviewSimulation from '@/components/persona/InterviewSimulation';
import MultiModalRAGInterface from '@/components/interviews/MultiModalRAGInterface';
import GeopoliticalRiskMonitor from '@/components/dashboard/GeopoliticalRiskMonitor';
import UsageMeter from '@/components/subscription/UsageMeter';
import MultiModelChat from '@/components/ai/MultiModelChat';
import MultiModelWorkflow from '@/components/ai/MultiModelWorkflow';
import EnhancedAIChat from '@/components/ai/EnhancedAIChat';
import AgentPerformanceDashboard from '@/components/analytics/AgentPerformanceDashboard';
import IntelligenceResources from '@/components/dashboard/IntelligenceResources';
import InterviewTranscriptManager from '@/components/interviews/InterviewTranscriptManager';
import ExternalDataFeeds from '@/components/dashboard/ExternalDataFeeds';
import CorporateFactManager from '@/components/ssot/CorporateFactManager';
import FlywheelManager from '@/components/flywheel/FlywheelManager';
import ReportScheduler from '@/components/automation/ReportScheduler';
import AgentManager from '@/components/admin/AgentManager';
import BulkArticleGenerator from '@/components/content/BulkArticleGenerator';
import AuditDashboard from '@/components/audit/AuditDashboard';
import QualityGateIndicator from '@/components/quality/QualityGateIndicator';

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
        search: "Buscar conversas...",
        noResults: "Nenhuma conversa encontrada",
        summaries: "Resumos AI",
        generateSummary: "Gerar Resumo",
        generating: "Gerando...",
        summary: "Resumo",
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
        search: "Search conversations...",
        noResults: "No conversations found",
        summaries: "AI Summaries",
        generateSummary: "Generate Summary",
        generating: "Generating...",
        summary: "Summary",
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
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('todos');

    const [searchQuery, setSearchQuery] = useState('');
    const [summariesEnabled, setSummariesEnabled] = useState(false);
    const [generatingSummary, setGeneratingSummary] = useState(null);
    const [conversationSummaries, setConversationSummaries] = useState({});
    const [pendingReviews, setPendingReviews] = useState({ twin: 0, human: 0 });
    const t = translations[lang];

    const tabs = [
        { id: 'todos', label: lang === 'pt' ? 'Todos' : 'All' },
        { id: 'discursos', label: lang === 'pt' ? 'Discursos' : 'Speeches' },
        { id: 'livros', label: lang === 'pt' ? 'Livros' : 'Books' },
        { id: 'artigos', label: lang === 'pt' ? 'Artigos' : 'Articles' },
        { id: 'pesquisas', label: lang === 'pt' ? 'Pesquisas' : 'Research' },
        { id: 'entrevistas', label: lang === 'pt' ? 'Entrevistas' : 'Interviews' },
        { id: 'relatorios', label: lang === 'pt' ? 'Relatórios' : 'Reports' },
        { id: 'documentos', label: lang === 'pt' ? 'Documentos Políticos' : 'Policy Documents' },
        { id: 'outros', label: lang === 'pt' ? 'Outros' : 'Others' }
    ];

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
    }, [lang]);

    useEffect(() => {
        loadConversations();
        loadPendingReviews();
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

    const loadPendingReviews = async () => {
        try {
            const twinGenerated = await base44.entities.Article.filter({
                quality_tier: 'ai_generated',
                approval_status: 'pendente'
            });
            const humanVerified = await base44.entities.Article.filter({
                quality_tier: 'curator_approved',
                approval_status: 'human_verified'
            });
            setPendingReviews({
                twin: twinGenerated.length,
                human: humanVerified.length
            });
        } catch (error) {
            console.error('Error loading pending reviews:', error);
        }
    };

    const handleDeleteConversation = async (conversationId) => {
        if (!confirm(t.deleteConfirm)) return;
        
        try {
            await base44.agents.deleteConversation(conversationId);
            setConversations(conversations.filter(c => c.id !== conversationId));
            toast.success(lang === 'pt' ? 'Conversa excluída com sucesso!' : 'Conversation deleted successfully!');
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error(lang === 'pt' ? 'Erro ao excluir conversa' : 'Error deleting conversation');
        }
    };

    const handleGenerateSummary = async (conversationId) => {
        setGeneratingSummary(conversationId);
        try {
            const response = await base44.functions.invoke('generateConversationSummary', {
                conversation_id: conversationId
            });
            setConversationSummaries(prev => ({
                ...prev,
                [conversationId]: response.data.summary
            }));
            toast.success(lang === 'pt' ? 'Resumo gerado!' : 'Summary generated!');
        } catch (error) {
            console.error('Error generating summary:', error);
            toast.error(lang === 'pt' ? 'Erro ao gerar resumo' : 'Error generating summary');
        } finally {
            setGeneratingSummary(null);
        }
    };

    const exportConversationsCSV = () => {
        const headers = ['Name', 'Created Date', 'Messages Count'];
        const rows = conversations.map(conv => [
            conv.metadata?.name || `Conversa ${new Date(conv.created_date).toLocaleDateString()}`,
            new Date(conv.created_date).toLocaleDateString(),
            conv.messages?.length || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversations_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'Conversas exportadas com sucesso!' : 'Conversations exported successfully!');
    };

    const exportConversationsJSON = () => {
        const dataStr = JSON.stringify(conversations, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversations_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success(lang === 'pt' ? 'Conversas exportadas com sucesso!' : 'Conversations exported successfully!');
    };

    const toggleLanguage = () => {
        const newLang = lang === 'pt' ? 'en' : 'pt';
        setLang(newLang);
        localStorage.setItem('troyjo_lang', newLang);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]" data-ai-screen="Dashboard">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                            <img 
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69335f9184b5ddfb48500fe5/7b4794e58_CapturadeTela2025-12-23s93044PM.png"
                                alt="MT Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-[#002D62] text-base">{t.title}</h1>
                            <p className="text-xs text-[#333F48]/60">{t.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {(pendingReviews.twin > 0 || pendingReviews.human > 0) && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                                <span className="text-xs font-semibold text-amber-900">
                                    {pendingReviews.twin > 0 && `${pendingReviews.twin} AI`}
                                    {pendingReviews.twin > 0 && pendingReviews.human > 0 && ' | '}
                                    {pendingReviews.human > 0 && `${pendingReviews.human} Troyjo`}
                                </span>
                            </div>
                        )}
                        <Link to={createPageUrl('Consultation')}>
                                <Button 
                                    data-ai-id="btn_new_chat"
                                    data-ai-role="button"
                                    className="bg-[#002D62] hover:bg-[#001d42] text-white gap-2 shadow-sm"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t.newChat}</span>
                                </Button>
                            </Link>
                    </div>
                </div>
                </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
                {/* Tab Navigation */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-lg border border-gray-200 p-2">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-[#002D62] text-white'
                                            : 'text-[#333F48] hover:bg-gray-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* AEGIS Protocol Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <AegisIndicator lang={lang} />
                </motion.div>

                {/* Usage Meter */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <UsageMeter lang={lang} />
                </motion.div>

                {/* Conditional Content Based on Active Tab */}
                {activeTab === 'todos' && (
                    <>
                        {/* Quick Actions */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="grid md:grid-cols-4 gap-4">
                                <Link to={createPageUrl('Consultation')}>
                                    <Card className="hover:shadow-lg transition-all cursor-pointer border-[#002D62]/20 hover:border-[#002D62]">
                                        <CardContent className="p-6 text-center">
                                            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-[#002D62]" />
                                            <h3 className="font-semibold text-sm">{lang === 'pt' ? 'Nova Consulta' : 'New Consultation'}</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                                <Link to={createPageUrl('KnowledgeBase')}>
                                    <Card className="hover:shadow-lg transition-all cursor-pointer border-[#00654A]/20 hover:border-[#00654A]">
                                        <CardContent className="p-6 text-center">
                                            <BookOpen className="w-8 h-8 mx-auto mb-3 text-[#00654A]" />
                                            <h3 className="font-semibold text-sm">{lang === 'pt' ? 'Base de Conhecimento' : 'Knowledge Base'}</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                                <Link to={createPageUrl('AnalyticsDashboard')}>
                                    <Card className="hover:shadow-lg transition-all cursor-pointer border-[#8B1538]/20 hover:border-[#8B1538]">
                                        <CardContent className="p-6 text-center">
                                            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-[#8B1538]" />
                                            <h3 className="font-semibold text-sm">Analytics</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                                <Link to={createPageUrl('Website')}>
                                    <Card className="hover:shadow-lg transition-all cursor-pointer border-[#D4AF37]/20 hover:border-[#D4AF37]">
                                        <CardContent className="p-6 text-center">
                                            <Globe className="w-8 h-8 mx-auto mb-3 text-[#D4AF37]" />
                                            <h3 className="font-semibold text-sm">{lang === 'pt' ? 'Website Público' : 'Public Website'}</h3>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Customizable Dashboard */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <CustomizableDashboard lang={lang} />
                        </motion.div>

                        {/* SSOT - Corporate Facts Manager */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.005 }}>
                            <CorporateFactManager lang={lang} />
                        </motion.div>

                        {/* External Data Feeds - Full Width */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.01 }}>
                            <ExternalDataFeeds lang={lang} />
                        </motion.div>

                        {/* Bulk Article Generation */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.012 }}>
                            <BulkArticleGenerator lang={lang} />
                        </motion.div>

                        {/* Quality Gate & Audit - Side by Side */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.012 }}>
                                <QualityGateIndicator lang={lang} />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.013 }}>
                                <AuditDashboard lang={lang} />
                            </motion.div>
                        </div>

                        {/* Automation & Agent Management */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.015 }}>
                            <ReportScheduler lang={lang} />
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.018 }}>
                            <AgentManager lang={lang} />
                        </motion.div>

                        {/* Geopolitical Section - Side by Side */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
                                <AlertFeedManager lang={lang} />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
                                <GeopoliticalAlertPanel userContext={{}} personaMode="tecnico" lang={lang} />
                            </motion.div>
                        </div>

                        {/* First Row - Profile Settings Full Width */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <ProfileSettings lang={lang} />
                        </motion.div>

                {/* Second Row - Custom Persona Manager Full Width */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <CustomPersonaManager lang={lang} />
                </motion.div>

                {/* Third Row - Custom Traits & AI Suggestions */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="h-full">
                        <CustomPersonaTraits lang={lang} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }} className="h-full">
                        <PersonaSuggestionPanel lang={lang} />
                    </motion.div>
                </div>

                {/* Persona Training & Interview Simulation */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="h-full">
                        <PersonaTraining lang={lang} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }} className="h-full">
                        <InterviewSimulation lang={lang} />
                    </motion.div>
                </div>

                {/* Fourth Row - RAG & Reports Side by Side */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
                        <RAGDocumentManager lang={lang} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.095 }}>
                        <ExecutiveReports lang={lang} />
                    </motion.div>
                </div>

                {/* Fifth Row - Documents Side by Side */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.10 }} className="h-full">
                        <DocumentManager lang={lang} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }} className="h-full">
                        <DocumentChat lang={lang} />
                    </motion.div>
                </div>

                {/* Geopolitical Risk Monitor */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <GeopoliticalRiskMonitor lang={lang} />
                </motion.div>

                {/* Intelligence Resources */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}>
                    <IntelligenceResources lang={lang} />
                </motion.div>

                {/* Interview Transcripts RAG */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }}>
                    <InterviewTranscriptManager lang={lang} />
                </motion.div>

                {/* Multi-Modal RAG Interface */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}>
                    <MultiModalRAGInterface lang={lang} />
                </motion.div>

                {/* Agent Performance Dashboard */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}>
                    <AgentPerformanceDashboard lang={lang} />
                </motion.div>

                {/* Enhanced AI Chat with History & Metrics */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}>
                    <EnhancedAIChat lang={lang} />
                </motion.div>

                {/* Multi-Model Workflow */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                    <MultiModelWorkflow lang={lang} />
                </motion.div>

                {/* Multi-Model AI Chat Comparison */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
                    <MultiModelChat lang={lang} />
                </motion.div>

                {/* Third Row - Knowledge Hub Full Width */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <KnowledgeHub lang={lang} />
                </motion.div>

                {/* Fourth Row - Topic Tracker & Persona Analytics (Compact Cards) */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                        <TopicTracker lang={lang} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
                        <PersonaAnalytics lang={lang} />
                    </motion.div>
                </div>

                {/* Fifth Row - Proactive Suggestions & Topic Deep Dive (Taller Cards) */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
                        <ProactiveSuggestions lang={lang} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
                        <TopicDeepDive lang={lang} />
                    </motion.div>
                </div>

                {/* Sixth Row - Expertise Full Width */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#8B1538]">
                                <BookOpen className="w-5 h-5" />
                                {t.expertise}
                            </CardTitle>
                            <CardDescription>{t.expertiseDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                {t.expertiseAreas.map((area, index) => (
                                    <div key={index} className="p-3 rounded-lg border border-gray-100 hover:border-[#8B1538]/20 transition-colors">
                                        <h4 className="font-semibold text-sm text-[#8B1538] mb-1">{area.title}</h4>
                                        <p className="text-xs text-[#333F48]/70">{area.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm text-[#8B1538] mb-3">
                                    {lang === 'pt' ? 'Princípios Fundamentais' : 'Foundational Principles'}
                                </h4>
                                <ul className="grid sm:grid-cols-2 gap-2">
                                    {t.principles.map((principle, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-[#333F48]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                                            {principle}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                        {/* Seventh Row - Insights */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
                        <InsightsSection lang={lang} />
                        </motion.div>

                {/* Eighth Row - Persona Settings & History */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }} className="h-full">
                        <PersonaSettings lang={lang} />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }} className="h-full">
                        <PersonaHistoryViewer lang={lang} />
                    </motion.div>
                </div>

                {/* Ninth Row - Conversations */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}>
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                            <MessageSquare className="w-5 h-5" />
                                            {t.conversations}
                                        </CardTitle>
                                        <CardDescription>{t.conversationsDesc}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {conversations.length > 0 && (
                                            <div className="flex gap-1">
                                                <Button onClick={exportConversationsCSV} variant="ghost" size="sm">
                                                    <FileSpreadsheet className="w-4 h-4" />
                                                </Button>
                                                <Button onClick={exportConversationsJSON} variant="ghost" size="sm">
                                                    <FileJson className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                        <Button
                                            variant={summariesEnabled ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setSummariesEnabled(!summariesEnabled)}
                                            className="gap-2"
                                        >
                                            {summariesEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            <Sparkles className="w-4 h-4" />
                                            <span className="hidden md:inline">{t.summaries}</span>
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                                        <CardContent>
                                        {conversations.length > 0 && (
                                        <div className="mb-4">
                                        <Input
                                            placeholder={t.search}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full"
                                        />
                                        </div>
                                        )}
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
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {(() => {
                                            const filtered = conversations.filter(conv => {
                                                const name = conv.metadata?.name || `Conversa ${new Date(conv.created_date).toLocaleDateString()}`;
                                                return name.toLowerCase().includes(searchQuery.toLowerCase());
                                            });

                                            if (filtered.length === 0 && searchQuery) {
                                                return (
                                                    <div className="text-center py-8 text-gray-500 text-sm">
                                                        {t.noResults}
                                                    </div>
                                                );
                                            }

                                            return filtered.map((conv) => (
                                            <div key={conv.id} className="p-3 rounded-lg border border-gray-100 hover:border-[#002D62]/20 hover:bg-gray-50/50 transition-all space-y-2">
                                                <div className="flex items-center justify-between">
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
                                                        {summariesEnabled && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="h-8 px-2"
                                                                onClick={() => handleGenerateSummary(conv.id)}
                                                                disabled={generatingSummary === conv.id || conversationSummaries[conv.id]}
                                                            >
                                                                {generatingSummary === conv.id ? (
                                                                    <>
                                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                        <span className="text-xs">{t.generating}</span>
                                                                    </>
                                                                ) : conversationSummaries[conv.id] ? (
                                                                    <span className="text-xs text-green-600">✓</span>
                                                                ) : (
                                                                    <>
                                                                        <Sparkles className="w-3 h-3 mr-1" />
                                                                        <span className="text-xs">{t.generateSummary}</span>
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                        <Link to={createPageUrl('Consultation') + `?conversationId=${conv.id}`}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteConversation(conv.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {conversationSummaries[conv.id] && (
                                                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                                                        <p className="text-xs font-semibold text-blue-900 mb-1">{t.summary}:</p>
                                                        <p className="text-xs text-blue-800 leading-relaxed">{conversationSummaries[conv.id]}</p>
                                                    </div>
                                                )}
                                            </div>
                                            ));
                                                })()}
                                                </div>
                                )}
                            </CardContent>
                        </Card>
                </motion.div>

                {/* Bottom Section - Reorganized Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Books & Awards Combined */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="h-full">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                    <BookOpen className="w-5 h-5" />
                                    {t.books}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <ul className="space-y-3">
                                    {t.booksList.map((book, index) => (
                                        <li key={index} className="flex items-center justify-between p-2 rounded-lg border border-gray-100">
                                            <span className="text-sm text-[#333F48]">{book.title}</span>
                                            <Badge variant="outline" className="ml-2">{book.year}</Badge>
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Award className="w-5 h-5 text-[#002D62]" />
                                        <h4 className="font-semibold text-[#002D62]">{t.awards}</h4>
                                    </div>
                                    <ul className="space-y-2">
                                        {t.awardsList.map((award, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-[#333F48]">
                                                <span className="w-2 h-2 rounded-full bg-[#B8860B] mt-1.5 flex-shrink-0" />
                                                {award}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Knowledge Base & Language */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }} className="h-full">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                    <Database className="w-5 h-5" />
                                    {t.knowledgeBase}
                                </CardTitle>
                                <CardDescription>{t.knowledgeBaseDesc}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                                    <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
                                    <span className="text-xs font-medium text-amber-900">{t.cutoffDate}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {t.sources.map((source, index) => (
                                        <div key={index} className="p-2.5 rounded-lg border border-gray-100 hover:border-[#002D62]/20 transition-colors">
                                            <h5 className="font-semibold text-xs text-[#002D62] mb-1">{source.category}</h5>
                                            <p className="text-xs text-[#333F48]/70 line-clamp-2">{source.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="w-4 h-4 text-[#002D62]" />
                                        <h4 className="font-semibold text-sm text-[#002D62]">{t.language}</h4>
                                    </div>
                                    <Button onClick={toggleLanguage} variant="outline" className="w-full justify-between">
                                        <span>{lang === 'pt' ? 'Português (Brasil)' : 'English (US)'}</span>
                                        <Globe className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Publications Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}>
                    <PublicationsSection lang={lang} />
                </motion.div>

                {/* Voice Calibration Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}>
                    <VoiceCalibration lang={lang} />
                </motion.div>
                </>
                )}

                {/* Discursos Tab */}
                {activeTab === 'discursos' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">
                                    {lang === 'pt' ? 'Discursos Públicos' : 'Public Speeches'}
                                </CardTitle>
                                <CardDescription>
                                    {lang === 'pt' 
                                        ? 'Palestras, conferências e apresentações oficiais de Marcos Troyjo'
                                        : 'Lectures, conferences and official presentations by Marcos Troyjo'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#333F48]/60 text-center py-8">
                                    {lang === 'pt' ? 'Conteúdo em desenvolvimento' : 'Content in development'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Livros Tab */}
                {activeTab === 'livros' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">
                                    {lang === 'pt' ? 'Livros Publicados' : 'Published Books'}
                                </CardTitle>
                                <CardDescription>
                                    {lang === 'pt' 
                                        ? 'Obras acadêmicas e análises econômicas'
                                        : 'Academic works and economic analyses'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#333F48]/60 text-center py-8">
                                    {lang === 'pt' ? 'Conteúdo em desenvolvimento' : 'Content in development'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Artigos Tab */}
                {activeTab === 'artigos' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">
                                    {lang === 'pt' ? 'Artigos & Ensaios' : 'Articles & Essays'}
                                </CardTitle>
                                <CardDescription>
                                    {lang === 'pt' 
                                        ? 'Publicações em periódicos especializados'
                                        : 'Publications in specialized journals'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#333F48]/60 text-center py-8">
                                    {lang === 'pt' ? 'Conteúdo em desenvolvimento' : 'Content in development'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Pesquisas Tab */}
                {activeTab === 'pesquisas' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">
                                    {lang === 'pt' ? 'Pesquisas Acadêmicas' : 'Academic Research'}
                                </CardTitle>
                                <CardDescription>
                                    {lang === 'pt' 
                                        ? 'Trabalhos de pesquisa e estudos acadêmicos'
                                        : 'Research papers and academic studies'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#333F48]/60 text-center py-8">
                                    {lang === 'pt' ? 'Conteúdo em desenvolvimento' : 'Content in development'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Entrevistas Tab */}
                {activeTab === 'entrevistas' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <InterviewTranscriptManager lang={lang} />
                    </motion.div>
                )}

                {/* Relatórios Tab */}
                {activeTab === 'relatorios' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">
                                    {lang === 'pt' ? 'Relatórios Institucionais' : 'Institutional Reports'}
                                </CardTitle>
                                <CardDescription>
                                    {lang === 'pt' 
                                        ? 'Relatórios do NDB e análises de política comercial'
                                        : 'NDB reports and trade policy analyses'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#333F48]/60 text-center py-8">
                                    {lang === 'pt' ? 'Conteúdo em desenvolvimento' : 'Content in development'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Documentos Tab */}
                {activeTab === 'documentos' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">
                                    {lang === 'pt' ? 'Documentos Políticos' : 'Policy Documents'}
                                </CardTitle>
                                <CardDescription>
                                    {lang === 'pt' 
                                        ? 'Policy papers e documentos estratégicos'
                                        : 'Policy papers and strategic documents'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#333F48]/60 text-center py-8">
                                    {lang === 'pt' ? 'Conteúdo em desenvolvimento' : 'Content in development'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Outros Tab */}
                {activeTab === 'outros' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-[#002D62]">
                                    {lang === 'pt' ? 'Outros Conteúdos' : 'Other Content'}
                                </CardTitle>
                                <CardDescription>
                                    {lang === 'pt' 
                                        ? 'Materiais diversos e conteúdo adicional'
                                        : 'Miscellaneous materials and additional content'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-[#333F48]/60 text-center py-8">
                                    {lang === 'pt' ? 'Conteúdo em desenvolvimento' : 'Content in development'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
                </main>


                </div>
                );
                }