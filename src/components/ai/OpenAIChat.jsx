import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function OpenAIChat({ lang = 'pt' }) {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const t = {
        pt: {
            title: 'OpenAI Chat',
            placeholder: 'Digite sua pergunta...',
            send: 'Enviar',
            sending: 'Enviando...',
            response: 'Resposta',
            model: 'Modelo',
            tokens: 'Tokens'
        },
        en: {
            title: 'OpenAI Chat',
            placeholder: 'Type your question...',
            send: 'Send',
            sending: 'Sending...',
            response: 'Response',
            model: 'Model',
            tokens: 'Tokens'
        }
    };

    const text = t[lang];

    const handleSend = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        try {
            const result = await base44.functions.invoke('queryOpenAI', {
                prompt: prompt,
                model: 'gpt-4o-mini',
                max_tokens: 1000
            });

            if (result.data.success) {
                setResponse(result.data);
                toast.success('Resposta recebida!');
            } else {
                toast.error(result.data.error || 'Erro na resposta');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Erro ao consultar OpenAI');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Sparkles className="w-5 h-5" />
                    {text.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Textarea
                        placeholder={text.placeholder}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={loading || !prompt.trim()}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {text.sending}
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                {text.send}
                            </>
                        )}
                    </Button>
                </div>

                {response && (
                    <Card className="bg-gray-50">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{text.model}: {response.model}</Badge>
                                <Badge variant="outline">
                                    {text.tokens}: {response.usage?.total_tokens}
                                </Badge>
                            </div>
                            <div className="bg-white rounded-lg p-3 border">
                                <p className="text-sm whitespace-pre-wrap">{response.response}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}