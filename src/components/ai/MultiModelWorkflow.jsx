import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const STEP_ICONS = {
    'Base44': '🏢',
    'Grok': '⚡',
    'ChatGPT': '🤖'
};

export default function MultiModelWorkflow({ lang = 'pt' }) {
    const [prompt, setPrompt] = useState('');
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [workflow, setWorkflow] = useState(null);

    const t = {
        pt: {
            title: 'Workflow Multi-Modelo',
            description: 'Base44 gera → Grok valida → ChatGPT refina',
            enterPrompt: 'Digite sua pergunta...',
            context: 'Contexto adicional (opcional)',
            send: 'Processar',
            processing: 'Processando...',
            finalAnswer: 'Resposta Final',
            step: 'Etapa',
            processing_step: 'Processando',
            completed: 'Concluído',
            error: 'Erro',
            skipped: 'Ignorado',
            showDetails: 'Ver detalhes',
            hideDetails: 'Ocultar'
        },
        en: {
            title: 'Multi-Model Workflow',
            description: 'Base44 generates → Grok validates → ChatGPT refines',
            enterPrompt: 'Enter your question...',
            context: 'Additional context (optional)',
            send: 'Process',
            processing: 'Processing...',
            finalAnswer: 'Final Answer',
            step: 'Step',
            processing_step: 'Processing',
            completed: 'Completed',
            error: 'Error',
            skipped: 'Skipped',
            showDetails: 'Show details',
            hideDetails: 'Hide'
        }
    };

    const text = t[lang];

    const handleSubmit = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setWorkflow(null);

        try {
            const response = await base44.functions.invoke('multiModelWorkflow', {
                prompt: prompt,
                context: context
            });

            setWorkflow(response.data.workflow);
            toast.success(lang === 'pt' ? 'Workflow concluído!' : 'Workflow completed!');
        } catch (error) {
            console.error('Error in workflow:', error);
            toast.error(error.response?.data?.error || 'Erro ao processar');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'skipped':
                return <AlertCircle className="w-4 h-4 text-amber-600" />;
            default:
                return <Clock className="w-4 h-4 text-blue-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'skipped':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    {text.title}
                </CardTitle>
                <CardDescription>{text.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={text.enterPrompt}
                        rows={3}
                        disabled={loading}
                    />
                </div>

                <div>
                    <Textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder={text.context}
                        rows={2}
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
                            {text.processing}
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            {text.send}
                        </>
                    )}
                </Button>

                {workflow && (
                    <div className="space-y-4 pt-4 border-t">
                        {/* Workflow Steps */}
                        <div className="space-y-2">
                            {workflow.steps.map((step) => (
                                <details key={step.step} className="group">
                                    <summary className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{STEP_ICONS[step.model]}</span>
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {text.step} {step.step}: {step.model}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getStatusIcon(step.status)}
                                                    <Badge className={getStatusColor(step.status)}>
                                                        {text[step.status] || step.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </summary>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                                        {step.response ? (
                                            <ReactMarkdown className="prose prose-sm max-w-none">
                                                {step.response}
                                            </ReactMarkdown>
                                        ) : step.error ? (
                                            <p className="text-sm text-red-600">{step.error}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500">No response</p>
                                        )}
                                        {step.usage && (
                                            <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                                                Tokens: {step.usage.total_tokens}
                                            </div>
                                        )}
                                    </div>
                                </details>
                            ))}
                        </div>

                        {/* Final Answer */}
                        {workflow.final_answer && (
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                    {text.finalAnswer}
                                </h4>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{workflow.final_answer}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}