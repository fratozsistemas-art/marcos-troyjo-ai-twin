import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DocumentSelector from '@/components/documents/DocumentSelector';

export default function DocumentChat({ lang = 'pt' }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const messagesEndRef = useRef(null);

    const translations = {
        pt: {
            title: 'Chat com Documentos',
            placeholder: 'Faça perguntas sobre seus documentos...',
            send: 'Enviar',
            selectDocs: 'Selecione documentos para começar'
        },
        en: {
            title: 'Document Chat',
            placeholder: 'Ask questions about your documents...',
            send: 'Send',
            selectDocs: 'Select documents to start'
        }
    };

    const t = translations[lang];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || selectedDocuments.length === 0 || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const fileUrls = selectedDocuments.map(d => d.file_url);
            
            const prompt = `Você é Marcos Prado Troyjo. Responda à seguinte pergunta baseando-se nos documentos fornecidos e no seu conhecimento sobre economia global, comércio internacional e competitividade.

Pergunta: ${input}

Mantenha seu estilo analítico, use dados concretos quando disponíveis nos documentos, e forneça insights geoeconômicos relevantes.`;

            const response = await base44.integrations.Core.InvokeLLM({
                prompt,
                file_urls: fileUrls,
                add_context_from_internet: false
            });

            const assistantMessage = { 
                role: 'assistant', 
                content: typeof response === 'string' ? response : response.response || 'Sem resposta'
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error in chat:', error);
            const errorMessage = { 
                role: 'assistant', 
                content: `Erro: ${error.message}` 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <DocumentSelector
                selectedDocuments={selectedDocuments}
                onSelectionChange={setSelectedDocuments}
                lang={lang}
            />

            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle className="text-[#06101F] flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {t.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {selectedDocuments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {t.selectDocs}
                        </div>
                    ) : (
                        <>
                            <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-4 ${
                                                msg.role === 'user'
                                                    ? 'bg-[#06101F] text-white'
                                                    : 'bg-white border border-gray-200'
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
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <Loader2 className="w-5 h-5 animate-spin text-[#06101F]" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="flex gap-2">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder={t.placeholder}
                                    className="flex-1"
                                    rows={2}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading || selectedDocuments.length === 0}
                                    className="bg-[#06101F] hover:bg-[#050D19]"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}