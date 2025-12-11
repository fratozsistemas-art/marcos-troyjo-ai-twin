import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, Search, Play, Sparkles, CheckCircle, Loader2, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InterviewTranscriptManager({ lang = 'pt' }) {
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [selectedTranscript, setSelectedTranscript] = useState(null);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const t = {
        pt: {
            title: 'Transcrições de Entrevistas',
            desc: 'Base de conhecimento RAG com entrevistas do Troyjo',
            upload: 'Adicionar Transcrição',
            search: 'Buscar nas transcrições...',
            process: 'Processar & Indexar',
            processing: 'Processando...',
            view: 'Ver Detalhes',
            delete: 'Excluir',
            indexed: 'Indexado',
            notIndexed: 'Não Indexado',
            chunks: 'chunks',
            topics: 'Tópicos',
            neologisms: 'Neologismos',
            highlights: 'Highlights',
            date: 'Data',
            venue: 'Local/Meio',
            interviewer: 'Entrevistador'
        },
        en: {
            title: 'Interview Transcripts',
            desc: 'RAG knowledge base with Troyjo interviews',
            upload: 'Add Transcript',
            search: 'Search transcripts...',
            process: 'Process & Index',
            processing: 'Processing...',
            view: 'View Details',
            delete: 'Delete',
            indexed: 'Indexed',
            notIndexed: 'Not Indexed',
            chunks: 'chunks',
            topics: 'Topics',
            neologisms: 'Neologisms',
            highlights: 'Highlights',
            date: 'Date',
            venue: 'Venue/Medium',
            interviewer: 'Interviewer'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadTranscripts();
    }, []);

    const loadTranscripts = async () => {
        setLoading(true);
        try {
            const data = await base44.entities.InterviewTranscript.list('-interview_date');
            setTranscripts(data || []);
        } catch (error) {
            console.error('Error loading transcripts:', error);
            toast.error('Erro ao carregar transcrições');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessTranscript = async (transcriptId) => {
        setProcessing(transcriptId);
        try {
            const response = await base44.functions.invoke('processInterviewTranscript', {
                transcript_id: transcriptId,
                auto_extract: true
            });

            if (response.data.success) {
                toast.success('Transcrição processada e indexada com sucesso!');
                await loadTranscripts();
            }
        } catch (error) {
            console.error('Error processing transcript:', error);
            toast.error('Erro ao processar transcrição');
        } finally {
            setProcessing(null);
        }
    };

    const handleDeleteTranscript = async (transcriptId) => {
        if (!confirm('Tem certeza que deseja excluir esta transcrição?')) return;
        
        try {
            await base44.entities.InterviewTranscript.delete(transcriptId);
            toast.success('Transcrição excluída');
            await loadTranscripts();
        } catch (error) {
            console.error('Error deleting transcript:', error);
            toast.error('Erro ao excluir transcrição');
        }
    };

    const filteredTranscripts = transcripts.filter(t => 
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.main_topics?.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-[#002D62]">
                            <FileText className="w-5 h-5" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.desc}</CardDescription>
                    </div>
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#002D62] hover:bg-[#001d42]">
                                <Upload className="w-4 h-4 mr-2" />
                                {text.upload}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{text.upload}</DialogTitle>
                            </DialogHeader>
                            <UploadForm onSuccess={() => {
                                setShowUploadDialog(false);
                                loadTranscripts();
                            }} lang={lang} />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input
                        placeholder={text.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#002D62]" />
                    </div>
                ) : (
                    <ScrollArea className="h-[500px]">
                        <div className="space-y-3">
                            {filteredTranscripts.map(transcript => (
                                <Card key={transcript.id} className="hover:border-[#002D62]/30 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-semibold text-[#002D62] truncate">
                                                        {transcript.title}
                                                    </h4>
                                                    <Badge variant={transcript.rag_indexed ? "default" : "outline"}>
                                                        {transcript.rag_indexed ? (
                                                            <><CheckCircle className="w-3 h-3 mr-1" /> {text.indexed}</>
                                                        ) : text.notIndexed}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="text-xs text-gray-600 space-y-1">
                                                    <div>{text.date}: {new Date(transcript.interview_date).toLocaleDateString()}</div>
                                                    {transcript.interviewer && <div>{text.interviewer}: {transcript.interviewer}</div>}
                                                    {transcript.venue && <div>{text.venue}: {transcript.venue}</div>}
                                                </div>

                                                {transcript.rag_indexed && (
                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {transcript.chunks?.length > 0 && (
                                                            <Badge variant="secondary">
                                                                {transcript.chunks.length} {text.chunks}
                                                            </Badge>
                                                        )}
                                                        {transcript.neologisms_used?.slice(0, 3).map(neo => (
                                                            <Badge key={neo} className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]">
                                                                <Sparkles className="w-3 h-3 mr-1" />
                                                                {neo}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                {!transcript.rag_indexed && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleProcessTranscript(transcript.id)}
                                                        disabled={processing === transcript.id}
                                                    >
                                                        {processing === transcript.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Sparkles className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setSelectedTranscript(transcript)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteTranscript(transcript.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>

            {selectedTranscript && (
                <TranscriptViewer
                    transcript={selectedTranscript}
                    open={!!selectedTranscript}
                    onClose={() => setSelectedTranscript(null)}
                    lang={lang}
                />
            )}
        </Card>
    );
}

function UploadForm({ onSuccess, lang }) {
    const [formData, setFormData] = useState({
        title: '',
        interview_date: '',
        venue: '',
        interviewer: '',
        full_transcript: '',
        language: lang
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await base44.entities.InterviewTranscript.create(formData);
            toast.success('Transcrição adicionada com sucesso!');
            onSuccess();
        } catch (error) {
            console.error('Error creating transcript:', error);
            toast.error('Erro ao adicionar transcrição');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                placeholder="Título da entrevista"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
            />
            <Input
                type="date"
                value={formData.interview_date}
                onChange={(e) => setFormData({...formData, interview_date: e.target.value})}
                required
            />
            <Input
                placeholder="Local/Meio (podcast, conferência, TV)"
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
            />
            <Input
                placeholder="Entrevistador"
                value={formData.interviewer}
                onChange={(e) => setFormData({...formData, interviewer: e.target.value})}
            />
            <Textarea
                placeholder="Transcrição completa..."
                value={formData.full_transcript}
                onChange={(e) => setFormData({...formData, full_transcript: e.target.value})}
                className="min-h-[300px]"
                required
            />
            <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
            </Button>
        </form>
    );
}

function TranscriptViewer({ transcript, open, onClose, lang }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{transcript.title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-4 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Data:</span> {new Date(transcript.interview_date).toLocaleDateString()}
                            </div>
                            {transcript.venue && (
                                <div>
                                    <span className="font-semibold">Local:</span> {transcript.venue}
                                </div>
                            )}
                            {transcript.interviewer && (
                                <div>
                                    <span className="font-semibold">Entrevistador:</span> {transcript.interviewer}
                                </div>
                            )}
                            {transcript.duration_minutes && (
                                <div>
                                    <span className="font-semibold">Duração:</span> {transcript.duration_minutes} min
                                </div>
                            )}
                        </div>

                        <Separator />

                        {transcript.neologisms_used?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Neologismos:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {transcript.neologisms_used.map(neo => (
                                        <Badge key={neo} className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]">
                                            {neo}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {transcript.main_topics?.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2">Tópicos:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {transcript.main_topics.map(topic => (
                                        <Badge key={topic} variant="secondary">{topic}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Separator />

                        <div>
                            <h4 className="font-semibold mb-2">Transcrição:</h4>
                            <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap text-sm text-gray-700">{transcript.full_transcript}</p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}