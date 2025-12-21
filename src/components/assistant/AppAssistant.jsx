import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
    MessageCircle, X, Send, Loader2, Sparkles, 
    ChevronDown, HelpCircle, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Assistente Virtual',
        subtitle: 'Como posso ajudar?',
        placeholder: 'Pergunte sobre o app, navegação, gráficos...',
        send: 'Enviar',
        quickActions: 'Ações Rápidas',
        suggestions: [
            'Como criar um gráfico customizado?',
            'Como exportar dados para o Google Drive?',
            'Quais são os atalhos de teclado?',
            'Como funciona a sincronização do World Bank?',
            'O que é o SSOT?'
        ]
    },
    en: {
        title: 'Virtual Assistant',
        subtitle: 'How can I help?',
        placeholder: 'Ask about the app, navigation, charts...',
        send: 'Send',
        quickActions: 'Quick Actions',
        suggestions: [
            'How to create a custom chart?',
            'How to export data to Google Drive?',
            'What are the keyboard shortcuts?',
            'How does World Bank sync work?',
            'What is SSOT?'
        ]
    }
};

export default function AppAssistant({ lang = 'pt' }) {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const scrollRef = useRef(null);
    const t = translations[lang];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const getCurrentPage = () => {
        const path = location.pathname.split('/').filter(Boolean);
        return path[path.length - 1] || 'Website';
    };

    const sendMessage = async (content) => {
        const userMessage = { role: 'user', content };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await base44.functions.invoke('appAssistantChat', {
                messages: [...messages, userMessage],
                current_page: getCurrentPage(),
                context: null
            });

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.message
                }]);
            } else {
                throw new Error(response.data.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(lang === 'pt' ? 'Erro ao enviar mensagem' : 'Error sending message');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: lang === 'pt' 
                    ? 'Desculpe, ocorreu um erro. Tente novamente.'
                    : 'Sorry, an error occurred. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        if (input.trim() && !loading) {
            sendMessage(input.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestion = (suggestion) => {
        sendMessage(suggestion);
    };

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-20 right-4 bg-gradient-to-r from-[#002D62] to-[#00654A] text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all z-50 group"
            >
                <Sparkles className="w-6 h-6" />
                <span className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {lang === 'pt' ? 'Precisa de ajuda?' : 'Need help?'}
                </span>
            </button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    height: minimized ? 'auto' : '600px'
                }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-4 right-4 w-96 z-50 shadow-2xl rounded-2xl overflow-hidden"
            >
                <Card className="h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#002D62] to-[#00654A] text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            <div>
                                <h3 className="font-semibold text-sm">{t.title}</h3>
                                <p className="text-xs opacity-90">{t.subtitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setMinimized(!minimized)}
                                className="text-white hover:bg-white/20"
                            >
                                <ChevronDown className={`w-4 h-4 transition-transform ${minimized ? 'rotate-180' : ''}`} />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {!minimized && (
                        <>
                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="space-y-4">
                                        <div className="text-center py-4">
                                            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600">
                                                {lang === 'pt' 
                                                    ? 'Olá! Estou aqui para ajudar você a usar o app.' 
                                                    : 'Hello! I\'m here to help you use the app.'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-2">{t.quickActions}</p>
                                            <div className="space-y-2">
                                                {t.suggestions.map((suggestion, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSuggestion(suggestion)}
                                                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
                                                    >
                                                        <Zap className="w-4 h-4 inline mr-2 text-[#002D62]" />
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-lg p-3 ${
                                                        msg.role === 'user'
                                                            ? 'bg-[#002D62] text-white'
                                                            : 'bg-gray-100 text-gray-900'
                                                    }`}
                                                >
                                                    {msg.role === 'assistant' ? (
                                                        <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    ) : (
                                                        <p className="text-sm">{msg.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {loading && (
                                            <div className="flex justify-start">
                                                <div className="bg-gray-100 rounded-lg p-3">
                                                    <Loader2 className="w-4 h-4 animate-spin text-[#002D62]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Input */}
                            <div className="p-4 border-t">
                                <div className="flex gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t.placeholder}
                                        disabled={loading}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        className="bg-[#002D62]"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}