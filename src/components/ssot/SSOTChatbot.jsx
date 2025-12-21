import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Loader2, ExternalLink } from 'lucide-react';

export default function SSOTChatbot({ lang = 'pt' }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const t = {
        pt: {
            title: 'Assistente de Dados SSOT',
            placeholder: 'Pergunte sobre os dados...',
            send: 'Enviar',
            citations: 'Fontes citadas'
        },
        en: {
            title: 'SSOT Data Assistant',
            placeholder: 'Ask about the data...',
            send: 'Send',
            citations: 'Cited sources'
        }
    }[lang];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await base44.functions.invoke('querySSOTChatbot', {
                question: userMessage
            });

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.answer,
                    citations: response.data.citations,
                    facts_used: response.data.facts_used
                }]);
            }
        } catch (error) {
            console.error('Error querying chatbot:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: lang === 'pt' ? 'Erro ao processar a pergunta.' : 'Error processing question.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <MessageSquare className="w-5 h-5" />
                    {t.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 text-sm py-8">
                                {lang === 'pt' 
                                    ? 'Faça uma pergunta sobre os dados do SSOT...'
                                    : 'Ask a question about SSOT data...'}
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${
                                    msg.role === 'user' 
                                        ? 'bg-[#002D62] text-white' 
                                        : 'bg-white border border-gray-200'
                                }`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    
                                    {msg.citations && msg.citations.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">
                                                {t.citations} ({msg.citations.length}):
                                            </p>
                                            <div className="space-y-2">
                                                {msg.citations.map((citation) => (
                                                    <div key={citation.id} className="text-xs bg-gray-50 rounded p-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <span className="font-semibold text-gray-800">
                                                                    [{citation.id}] {citation.indicator}
                                                                </span>
                                                                <p className="text-gray-600 mt-1">
                                                                    {citation.value} {citation.unit} • {citation.country} ({citation.year})
                                                                </p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {citation.source}
                                                                    </Badge>
                                                                    {citation.verified && (
                                                                        <Badge className="bg-green-600 text-xs">Verificado</Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {citation.source_url && (
                                                                <a
                                                                    href={citation.source_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-700"
                                                                >
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#002D62]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={t.placeholder}
                            disabled={loading}
                        />
                        <Button onClick={handleSend} disabled={loading || !input.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}