import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, User, Bot, Send, Loader2, Play, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

const translations = {
    pt: {
        title: 'Simulação de Entrevista',
        description: 'Pratique entrevistas com o Digital Twin',
        setup: 'Configurar Simulação',
        role: 'Seu papel',
        interviewer: 'Entrevistador',
        interviewee: 'Entrevistado',
        topic: 'Tópico da entrevista',
        context: 'Contexto adicional',
        duration: 'Duração (minutos)',
        start: 'Iniciar Simulação',
        stop: 'Encerrar',
        yourTurn: 'Sua vez',
        thinking: 'Pensando...',
        send: 'Enviar',
        placeholder: 'Digite sua resposta ou pergunta...',
        setupRequired: 'Configure a simulação primeiro'
    },
    en: {
        title: 'Interview Simulation',
        description: 'Practice interviews with the Digital Twin',
        setup: 'Setup Simulation',
        role: 'Your role',
        interviewer: 'Interviewer',
        interviewee: 'Interviewee',
        topic: 'Interview topic',
        context: 'Additional context',
        duration: 'Duration (minutes)',
        start: 'Start Simulation',
        stop: 'End',
        yourTurn: 'Your turn',
        thinking: 'Thinking...',
        send: 'Send',
        placeholder: 'Type your response or question...',
        setupRequired: 'Setup simulation first'
    }
};

export default function InterviewSimulation({ lang = 'pt' }) {
    const [setupOpen, setSetupOpen] = useState(false);
    const [simulationActive, setSimulationActive] = useState(false);
    const [config, setConfig] = useState({
        userRole: 'interviewee',
        topic: '',
        context: '',
        duration: '30'
    });
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const t = translations[lang];

    const handleStartSimulation = async () => {
        if (!config.topic) {
            toast.error(lang === 'pt' ? 'Defina o tópico primeiro' : 'Define topic first');
            return;
        }

        setLoading(true);
        try {
            const conv = await base44.agents.createConversation({
                agent_name: 'troyjo_twin',
                metadata: {
                    name: `Interview: ${config.topic}`,
                    simulation_mode: true,
                    user_role: config.userRole,
                    topic: config.topic
                }
            });

            setConversationId(conv.id);
            setSimulationActive(true);
            setSetupOpen(false);

            // If user is interviewee, persona starts with first question
            if (config.userRole === 'interviewee') {
                const systemPrompt = `Você está conduzindo uma entrevista sobre ${config.topic}. ${config.context ? 'Contexto: ' + config.context : ''} Faça a primeira pergunta como entrevistador.`;
                
                await base44.agents.addMessage(conv, {
                    role: 'user',
                    content: systemPrompt
                });
            } else {
                // User is interviewer, add opening message
                setMessages([{
                    role: 'assistant',
                    content: `Olá. Estou pronto para a entrevista sobre ${config.topic}. Pode começar suas perguntas.`
                }]);
            }
        } catch (error) {
            console.error('Error starting simulation:', error);
            toast.error(lang === 'pt' ? 'Erro ao iniciar simulação' : 'Error starting simulation');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || !conversationId) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            await base44.agents.addMessage(
                { id: conversationId },
                { role: 'user', content: userMessage }
            );
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleStopSimulation = async () => {
        setSimulationActive(false);
        setMessages([]);
        setConversationId(null);
        
        toast.success(lang === 'pt' ? 'Simulação encerrada' : 'Simulation ended');
    };

    React.useEffect(() => {
        if (!conversationId) return;

        const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
            setMessages(data.messages || []);
        });

        return () => unsubscribe();
    }, [conversationId]);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-[#002D62]">
                                <Mic className="w-5 h-5" />
                                {t.title}
                            </CardTitle>
                            <CardDescription>{t.description}</CardDescription>
                        </div>
                        {!simulationActive ? (
                            <Button onClick={() => setSetupOpen(true)} className="bg-[#002D62]">
                                <Play className="w-4 h-4 mr-2" />
                                {t.setup}
                            </Button>
                        ) : (
                            <Button onClick={handleStopSimulation} variant="destructive">
                                <StopCircle className="w-4 h-4 mr-2" />
                                {t.stop}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {!simulationActive ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            {t.setupRequired}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="border rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                msg.role === 'user' ? 'bg-[#002D62]' : 'bg-gray-200'
                                            }`}>
                                                {msg.role === 'user' ? (
                                                    <User className="w-4 h-4 text-white" />
                                                ) : (
                                                    <Bot className="w-4 h-4 text-gray-700" />
                                                )}
                                            </div>
                                            <div className={`rounded-lg p-3 ${
                                                msg.role === 'user' ? 'bg-[#002D62] text-white' : 'bg-gray-100 text-gray-900'
                                            }`}>
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-gray-700" />
                                        </div>
                                        <div className="rounded-lg p-3 bg-gray-100">
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                    placeholder={t.placeholder}
                                    disabled={loading}
                                />
                                <Button onClick={handleSendMessage} disabled={loading || !input.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.setup}</DialogTitle>
                        <DialogDescription>Configure os parâmetros da simulação</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>{t.role}</Label>
                            <Select value={config.userRole} onValueChange={(v) => setConfig({...config, userRole: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="interviewee">{t.interviewee}</SelectItem>
                                    <SelectItem value="interviewer">{t.interviewer}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>{t.topic}</Label>
                            <Input
                                value={config.topic}
                                onChange={(e) => setConfig({...config, topic: e.target.value})}
                                placeholder="BRICS, Competitividade, etc."
                            />
                        </div>
                        <div>
                            <Label>{t.context}</Label>
                            <Textarea
                                value={config.context}
                                onChange={(e) => setConfig({...config, context: e.target.value})}
                                placeholder="Detalhes adicionais sobre o contexto..."
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label>{t.duration}</Label>
                            <Input
                                type="number"
                                value={config.duration}
                                onChange={(e) => setConfig({...config, duration: e.target.value})}
                            />
                        </div>
                        <Button onClick={handleStartSimulation} className="w-full">
                            {t.start}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}