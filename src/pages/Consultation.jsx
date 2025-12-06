import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Globe, Loader2, MessageSquare, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MessageBubble from '@/components/chat/MessageBubble';
import TopicCards from '@/components/chat/TopicCards';

const translations = {
    pt: {
        back: "Voltar",
        title: "Consulta com Marcos Troyjo",
        subtitle: "Digital Twin",
        placeholder: "Faça sua pergunta sobre economia global, comércio internacional ou competitividade...",
        send: "Enviar",
        greeting: "Prezado interlocutor,",
        greetingText: "É com prazer que o recebo neste espaço. Sou Marcos Prado Troyjo – ou, mais precisamente, meu Digital Twin construído com máxima fidelidade até dezembro de 2025.",
        promptQuestion: "Em que tema de economia global, comércio internacional, competitividade ou futuro do Brasil posso ajudá-lo hoje?",
        suggestedTopics: "Temas Sugeridos",
        newChat: "Nova Conversa",
        deleteChat: "Limpar"
    },
    en: {
        back: "Back",
        title: "Consultation with Marcos Troyjo",
        subtitle: "Digital Twin",
        placeholder: "Ask your question about global economics, international trade, or competitiveness...",
        send: "Send",
        greeting: "Dear interlocutor,",
        greetingText: "It is my pleasure to receive you in this space. I am Marcos Prado Troyjo – or, more precisely, my Digital Twin built with maximum fidelity until December 2025.",
        promptQuestion: "On what topic of global economics, international trade, competitiveness, or Brazil's future can I help you today?",
        suggestedTopics: "Suggested Topics",
        newChat: "New Chat",
        deleteChat: "Clear"
    }
};

export default function Consultation() {
    const [lang, setLang] = useState(() => localStorage.getItem('troyjo_lang') || 'pt');
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const t = translations[lang];

    useEffect(() => {
        localStorage.setItem('troyjo_lang', lang);
    }, [lang]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const conversationId = urlParams.get('conversationId');
        
        if (conversationId) {
            loadExistingConversation(conversationId);
        } else {
            initConversation();
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!conversation?.id) return;
        
        const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
            setMessages(processMessages(data.messages || []));
        });

        return () => unsubscribe();
    }, [conversation?.id]);

    const loadExistingConversation = async (conversationId) => {
        setIsInitializing(true);
        try {
            const existingConv = await base44.agents.getConversation(conversationId);
            setConversation(existingConv);
            setMessages(processMessages(existingConv.messages || []));
        } catch (error) {
            console.error('Error loading conversation:', error);
            initConversation();
        } finally {
            setIsInitializing(false);
        }
    };

    const initConversation = async () => {
        setIsInitializing(true);
        try {
            const newConversation = await base44.agents.createConversation({
                agent_name: "troyjo_twin",
                metadata: {
                    name: `Consultation ${new Date().toLocaleDateString()}`,
                    language: lang
                }
            });
            setConversation(newConversation);
            setMessages([]);
        } catch (error) {
            console.error('Error creating conversation:', error);
        } finally {
            setIsInitializing(false);
        }
    };

    const processMessages = (msgs) => {
        return msgs.map(msg => {
            if (msg.role === 'assistant' && msg.content) {
                const suggestions = extractSuggestions(msg.content);
                return { ...msg, suggestions };
            }
            return msg;
        });
    };

    const extractSuggestions = (content) => {
        const patterns = [
            /\*\*Sugestões de aprofundamento:\*\*\s*\n((?:[-•]\s*.+\n?)+)/i,
            /\*\*Follow-up suggestions:\*\*\s*\n((?:[-•]\s*.+\n?)+)/i,
            /Gostaria de explorar:?\s*\n((?:[-•]\s*.+\n?)+)/i,
            /Would you like to explore:?\s*\n((?:[-•]\s*.+\n?)+)/i
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                const suggestions = match[1]
                    .split('\n')
                    .map(s => s.replace(/^[-•]\s*/, '').trim())
                    .filter(s => s.length > 0)
                    .slice(0, 3);
                return suggestions;
            }
        }

        const lastParagraph = content.split('\n').filter(p => p.trim()).slice(-1)[0];
        if (lastParagraph && (lastParagraph.includes('?') || lastParagraph.toLowerCase().includes('explorar'))) {
            return [];
        }

        return [];
    };

    const handleSend = async (customMessage) => {
        const messageText = customMessage || input.trim();
        if (!messageText || !conversation || isLoading) return;

        setInput('');
        setIsLoading(true);

        try {
            await base44.agents.addMessage(conversation, {
                role: 'user',
                content: messageText
            });
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = () => {
        window.history.pushState({}, '', createPageUrl('Consultation'));
        initConversation();
    };

    const handleSuggestionSelect = (suggestion) => {
        handleSend(suggestion);
    };

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white font-bold text-xl">MT</span>
                    </div>
                    <p className="text-[#333F48]/60">{lang === 'pt' ? 'Iniciando sessão...' : 'Starting session...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="sm" className="text-[#333F48] gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.back}</span>
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">MT</span>
                            </div>
                            <div>
                                <h1 className="font-semibold text-[#333F48] text-sm">{t.title}</h1>
                                <p className="text-xs text-[#333F48]/50">{t.subtitle}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#333F48] gap-2"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="hidden sm:inline">{lang === 'pt' ? 'Painel' : 'Dashboard'}</span>
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleNewChat}
                            className="text-[#333F48] gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.newChat}</span>
                        </Button>
                        <button
                            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
                            className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-medium text-[#333F48]"
                        >
                            <Globe className="w-3 h-3" />
                            {lang === 'pt' ? 'EN' : 'PT'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-8"
                        >
                            {/* Welcome Message */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-8 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#002D62] to-[#00654A] flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">MT</span>
                                    </div>
                                    <div>
                                        <p className="text-[#002D62] font-semibold mb-2">{t.greeting}</p>
                                        <p className="text-[#333F48] leading-relaxed mb-4">{t.greetingText}</p>
                                        <p className="text-[#333F48] leading-relaxed">{t.promptQuestion}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Topic Cards */}
                            <div>
                                <h3 className="text-sm font-medium text-[#333F48]/60 mb-4">{t.suggestedTopics}</h3>
                                <TopicCards lang={lang} onSelect={handleSend} />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-6 pb-4">
                            <AnimatePresence>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <MessageBubble 
                                            message={message} 
                                            onSuggestionSelect={handleSuggestionSelect}
                                            lang={lang}
                                            conversationId={conversation?.id}
                                            messageIndex={index}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </main>

            {/* Input Area */}
            <footer className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t.placeholder}
                                className="min-h-[52px] max-h-32 resize-none pr-4 rounded-xl border-gray-200 focus:border-[#002D62] focus:ring-[#002D62]/20 text-[15px]"
                                rows={1}
                            />
                        </div>
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className="h-[52px] w-[52px] rounded-xl bg-[#002D62] hover:bg-[#001d42] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="text-xs font-medium text-amber-900">
                                {lang === 'pt' ? 'Base de conhecimento: Dez 2025' : 'Knowledge cutoff: Dec 2025'}
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}