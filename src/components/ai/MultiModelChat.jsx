import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const MODEL_OPTIONS = [
    { id: 'base44', name: 'Base44 AI', icon: '🏢', color: 'bg-blue-100 text-blue-800' },
    { id: 'openai', name: 'ChatGPT (OpenAI)', icon: '🤖', color: 'bg-green-100 text-green-800' },
    { id: 'grok', name: 'Grok (xAI)', icon: '⚡', color: 'bg-purple-100 text-purple-800' }
];

export default function MultiModelChat({ lang = 'pt' }) {
    const [selectedModel, setSelectedModel] = useState('base44');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [usage, setUsage] = useState(null);

    const t = {
        pt: {
            title: 'Chat Multi-Modelo',
            description: 'Compare respostas de diferentes modelos de IA',
            selectModel: 'Selecione o modelo',
            enterPrompt: 'Digite sua pergunta...',
            send: 'Enviar',
            sending: 'Processando...',
            response: 'Resposta',
            usage: 'Uso',
            tokens: 'tokens'
        },
        en: {
            title: 'Multi-Model Chat',
            description: 'Compare responses from different AI models',
            selectModel: 'Select model',
            enterPrompt: 'Enter your question...',
            send: 'Send',
            sending: 'Processing...',
            response: 'Response',
            usage: 'Usage',
            tokens: 'tokens'
        }
    };

    const text = t[lang];

    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setResponse(null);
        setUsage(null);

        try {
            let result;

            if (selectedModel === 'base44') {
                result = await base44.integrations.Core.InvokeLLM({
                    prompt: prompt
                });
                setResponse(result);
            } else if (selectedModel === 'openai') {
                const res = await base44.functions.invoke('queryOpenAI', {
                    prompt: prompt,
                    model: 'gpt-4o-mini'
                });
                setResponse(res.data.response);
                setUsage(res.data.usage);
            } else if (selectedModel === 'grok') {
                const res = await base44.functions.invoke('queryGrok', {
                    prompt: prompt,
                    model: 'grok-beta'
                });
                setResponse(res.data.response);
                setUsage(res.data.usage);
            }

            toast.success(lang === 'pt' ? 'Resposta recebida!' : 'Response received!');
        } catch (error) {
            console.error('Error querying model:', error);
            toast.error(error.response?.data?.error || 'Erro ao processar');
        } finally {
            setLoading(false);
        }
    };

    const currentModel = MODEL_OPTIONS.find(m => m.id === selectedModel);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {text.title}
                </CardTitle>
                <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">{text.selectModel}</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MODEL_OPTIONS.map(model => (
                                <SelectItem key={model.id} value={model.id}>
                                    <div className="flex items-center gap-2">
                                        <span>{model.icon}</span>
                                        <span>{model.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={text.enterPrompt}
                        rows={4}
                        disabled={loading}
                    />
                </div>

                <Button
                    onClick={handleSubmit}
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

                {response && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">{text.response}</h4>
                            <Badge className={currentModel.color}>
                                {currentModel.icon} {currentModel.name}
                            </Badge>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <ReactMarkdown className="prose prose-sm max-w-none">
                                {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                            </ReactMarkdown>
                        </div>
                        {usage && (
                            <div className="text-xs text-gray-600">
                                {text.usage}: {usage.total_tokens} {text.tokens} 
                                (prompt: {usage.prompt_tokens}, completion: {usage.completion_tokens})
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}