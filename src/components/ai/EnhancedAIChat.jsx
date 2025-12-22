import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    MessageSquare, Send, Loader2, Plus, Clock, ThumbsUp, 
    ThumbsDown, BarChart3, History, Trash2, Star, TrendingUp 
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnhancedAIChat({ lang = 'pt' }) {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState('professor');
    const [newConvTitle, setNewConvTitle] = useState('');
    const [newConvOpen, setNewConvOpen] = useState(false);
    const [metricsOpen, setMetricsOpen] = useState(false);
    const [conversationMetrics, setConversationMetrics] = useState(null);
    const messagesEndRef = useRef(null);

    const t = {
        pt: {
            title: 'Chat com IA',
            newConversation: 'Nova Conversa',
            selectPersona: 'Selecione a Persona',
            conversationTitle: 'Título da Conversa',
            create: 'Criar',
            cancel: 'Cancelar',
            send: 'Enviar',
            placeholder: 'Digite sua mensagem...',
            history: 'Histórico',
            metrics: 'Métricas',
            noConversations: 'Nenhuma conversa ainda',
            avgResponseTime: 'Tempo Médio de Resposta',
            satisfaction: 'Satisfação',
            totalMessages: 'Total de Mensagens',
            loading: 'Carregando...',
            delete: 'Excluir',
            viewMetrics: 'Ver Métricas',
            personas: {
                professor: 'Professor - Educativo e Claro',
                tecnico: 'Técnico - Dados e Análise',
                diplomatico: 'Diplomático - Equilibrado'
            }
        },
        en: {
            title: 'AI Chat',
            newConversation: 'New Conversation',
            selectPersona: 'Select Persona',
            conversationTitle: 'Conversation Title',
            create: 'Create',
            cancel: 'Cancel',
            send: 'Send',
            placeholder: 'Type your message...',
            history: 'History',
            metrics: 'Metrics',
            noConversations: 'No conversations yet',
            avgResponseTime: 'Avg Response Time',
            satisfaction: 'Satisfaction',
            totalMessages: 'Total Messages',
            loading: 'Loading...',
            delete: 'Delete',
            viewMetrics: 'View Metrics',
            personas: {
                professor: 'Professor - Educational & Clear',
                tecnico: 'Technical - Data & Analysis',
                diplomatico: 'Diplomatic - Balanced'
            }
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (currentConversation) {
            loadMessages();
        }
    }, [currentConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const convs = await base44.agents.listConversations({
                agent_name: 'troyjo_twin'
            });
            setConversations(convs || []);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadMessages = async () => {
        if (!currentConversation) return;
        
        try {
            const conv = await base44.agents.getConversation(currentConversation.id);
            setMessages(conv.messages || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleCreateConversation = async () => {
        if (!newConvTitle.trim()) {
            toast.error(lang === 'pt' ? 'Digite um título' : 'Enter a title');
            return;
        }

        try {
            const conv = await base44.agents.createConversation({
                agent_name: 'troyjo_twin',
                metadata: {
                    name: newConvTitle,
                    persona_mode: selectedPersona,
                    created_for_chat: true
                }
            });

            setConversations([conv, ...conversations]);
            setCurrentConversation(conv);
            setMessages([]);
            setNewConvOpen(false);
            setNewConvTitle('');
            toast.success(lang === 'pt' ? 'Conversa criada!' : 'Conversation created!');
        } catch (error) {
            console.error('Error creating conversation:', error);
            toast.error('Error creating conversation');
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !currentConversation || loading) return;

        const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        const startTime = Date.now();

        try {
            await base44.agents.addMessage(currentConversation, {
                role: 'user',
                content: input
            });

            // Poll for response
            let attempts = 0;
            while (attempts < 60) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const conv = await base44.agents.getConversation(currentConversation.id);
                const lastMessage = conv.messages[conv.messages.length - 1];
                
                if (lastMessage?.role === 'assistant' && lastMessage?.content) {
                    const responseTime = Date.now() - startTime;
                    
                    // Log interaction
                    await base44.entities.AgentInteractionLog.create({
                        agent_name: 'troyjo_twin',
                        conversation_id: currentConversation.id,
                        user_email: (await base44.auth.me()).email,
                        prompt: input,
                        response: lastMessage.content,
                        persona_mode: currentConversation.metadata?.persona_mode,
                        response_time_ms: responseTime,
                        used_rag: false
                    });

                    setMessages(conv.messages);
                    break;
                }
                attempts++;
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConversation = async (convId) => {
        if (!confirm(lang === 'pt' ? 'Excluir esta conversa?' : 'Delete this conversation?')) return;

        try {
            await base44.agents.deleteConversation(convId);
            setConversations(conversations.filter(c => c.id !== convId));
            if (currentConversation?.id === convId) {
                setCurrentConversation(null);
                setMessages([]);
            }
            toast.success(lang === 'pt' ? 'Conversa excluída!' : 'Conversation deleted!');
        } catch (error) {
            console.error('Error deleting conversation:', error);
            toast.error('Error deleting conversation');
        }
    };

    const handleViewMetrics = async (convId) => {
        try {
            const logs = await base44.entities.AgentInteractionLog.filter({
                conversation_id: convId
            });

            const avgTime = logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length || 0;
            const avgFeedback = logs.filter(l => l.feedback_score).reduce((sum, log) => sum + log.feedback_score, 0) / logs.filter(l => l.feedback_score).length || 0;
            
            const feedbackDistribution = logs.reduce((acc, log) => {
                if (log.feedback_score >= 4) acc.positive++;
                else if (log.feedback_score <= 2) acc.negative++;
                else if (log.feedback_score === 3) acc.neutral++;
                return acc;
            }, { positive: 0, neutral: 0, negative: 0 });

            setConversationMetrics({
                totalMessages: logs.length,
                avgResponseTime: Math.round(avgTime),
                avgFeedback: avgFeedback.toFixed(1),
                feedbackDistribution,
                logs
            });
            setMetricsOpen(true);
        } catch (error) {
            console.error('Error loading metrics:', error);
            toast.error('Error loading metrics');
        }
    };

    const handleFeedback = async (messageIndex, score) => {
        if (!currentConversation) return;

        try {
            const message = messages[messageIndex];
            if (message.role !== 'assistant') return;

            const logs = await base44.entities.AgentInteractionLog.filter({
                conversation_id: currentConversation.id
            });

            if (logs[messageIndex]) {
                await base44.entities.AgentInteractionLog.update(logs[messageIndex].id, {
                    feedback_score: score
                });

                toast.success(lang === 'pt' ? 'Feedback registrado!' : 'Feedback recorded!');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        {text.title}
                    </CardTitle>
                    <Button onClick={() => setNewConvOpen(true)} className="bg-[#002D62]">
                        <Plus className="w-4 h-4 mr-2" />
                        {text.newConversation}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Sidebar - History */}
                    <div className="lg:col-span-1">
                        <Tabs defaultValue="history">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="history">
                                    <History className="w-4 h-4 mr-2" />
                                    {text.history}
                                </TabsTrigger>
                                <TabsTrigger value="metrics">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    {text.metrics}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="history" className="space-y-2 max-h-[500px] overflow-y-auto mt-4">
                                {conversations.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">{text.noConversations}</p>
                                ) : (
                                    <AnimatePresence>
                                        {conversations.map(conv => (
                                            <motion.div
                                                key={conv.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    currentConversation?.id === conv.id
                                                        ? 'bg-[#002D62] text-white border-[#002D62]'
                                                        : 'bg-white hover:bg-gray-50 border-gray-200'
                                                }`}
                                                onClick={() => setCurrentConversation(conv)}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm truncate">
                                                            {conv.metadata?.name || 'Conversa'}
                                                        </h4>
                                                        {conv.metadata?.persona_mode && (
                                                            <Badge variant="secondary" className="mt-1 text-xs">
                                                                {text.personas[conv.metadata.persona_mode]}
                                                            </Badge>
                                                        )}
                                                        <p className="text-xs opacity-70 mt-1">
                                                            {new Date(conv.created_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteConversation(conv.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </TabsContent>

                            <TabsContent value="metrics" className="space-y-2 max-h-[500px] overflow-y-auto mt-4">
                                {conversations.map(conv => (
                                    <div key={conv.id} className="p-3 rounded-lg border bg-white">
                                        <h4 className="font-medium text-sm truncate mb-2">
                                            {conv.metadata?.name || 'Conversa'}
                                        </h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleViewMetrics(conv.id)}
                                        >
                                            <TrendingUp className="w-3 h-3 mr-2" />
                                            {text.viewMetrics}
                                        </Button>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Main Chat Area */}
                    <div className="lg:col-span-2">
                        {!currentConversation ? (
                            <div className="h-[500px] flex items-center justify-center text-gray-500 border-2 border-dashed rounded-lg">
                                <div className="text-center">
                                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p>{lang === 'pt' ? 'Selecione ou crie uma conversa' : 'Select or create a conversation'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                {/* Chat Header */}
                                <div className="p-4 border-b bg-gray-50">
                                    <h3 className="font-semibold">{currentConversation.metadata?.name}</h3>
                                    {currentConversation.metadata?.persona_mode && (
                                        <Badge variant="outline" className="mt-1">
                                            {text.personas[currentConversation.metadata.persona_mode]}
                                        </Badge>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg p-4 ${
                                                    msg.role === 'user'
                                                        ? 'bg-[#002D62] text-white'
                                                        : 'bg-white border border-gray-200'
                                                }`}
                                            >
                                                {msg.role === 'assistant' ? (
                                                    <>
                                                        <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                        <div className="flex gap-2 mt-3 pt-3 border-t">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2"
                                                                onClick={() => handleFeedback(index, 5)}
                                                            >
                                                                <ThumbsUp className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 px-2"
                                                                onClick={() => handleFeedback(index, 1)}
                                                            >
                                                                <ThumbsDown className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-sm">{msg.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                                <Loader2 className="w-5 h-5 animate-spin text-[#002D62]" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t bg-white flex gap-2">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder={text.placeholder}
                                        className="flex-1"
                                        rows={2}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!input.trim() || loading}
                                        className="bg-[#002D62] hover:bg-[#001d42]"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* New Conversation Dialog */}
                <Dialog open={newConvOpen} onOpenChange={setNewConvOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{text.newConversation}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">{text.conversationTitle}</label>
                                <Input
                                    value={newConvTitle}
                                    onChange={(e) => setNewConvTitle(e.target.value)}
                                    placeholder={lang === 'pt' ? 'Ex: Análise Geopolítica 2025' : 'Ex: Geopolitical Analysis 2025'}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">{text.selectPersona}</label>
                                <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(text.personas).map(persona => (
                                            <SelectItem key={persona} value={persona}>
                                                {text.personas[persona]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setNewConvOpen(false)}>
                                    {text.cancel}
                                </Button>
                                <Button onClick={handleCreateConversation} className="bg-[#002D62]">
                                    {text.create}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Metrics Dialog */}
                <Dialog open={metricsOpen} onOpenChange={setMetricsOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{text.metrics}</DialogTitle>
                        </DialogHeader>
                        {conversationMetrics && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs text-gray-600">{text.avgResponseTime}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-[#002D62]">
                                                {(conversationMetrics.avgResponseTime / 1000).toFixed(1)}s
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star className="w-4 h-4 text-amber-600" />
                                                <span className="text-xs text-gray-600">{text.satisfaction}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-[#002D62]">
                                                {conversationMetrics.avgFeedback || 'N/A'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageSquare className="w-4 h-4 text-green-600" />
                                                <span className="text-xs text-gray-600">{text.totalMessages}</span>
                                            </div>
                                            <p className="text-2xl font-bold text-[#002D62]">
                                                {conversationMetrics.totalMessages}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-3">{lang === 'pt' ? 'Distribuição de Feedback' : 'Feedback Distribution'}</h4>
                                    <div className="flex gap-2">
                                        <Badge className="bg-green-100 text-green-800">
                                            <ThumbsUp className="w-3 h-3 mr-1" />
                                            {conversationMetrics.feedbackDistribution.positive} {lang === 'pt' ? 'Positivo' : 'Positive'}
                                        </Badge>
                                        <Badge className="bg-gray-100 text-gray-800">
                                            {conversationMetrics.feedbackDistribution.neutral} {lang === 'pt' ? 'Neutro' : 'Neutral'}
                                        </Badge>
                                        <Badge className="bg-red-100 text-red-800">
                                            <ThumbsDown className="w-3 h-3 mr-1" />
                                            {conversationMetrics.feedbackDistribution.negative} {lang === 'pt' ? 'Negativo' : 'Negative'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}