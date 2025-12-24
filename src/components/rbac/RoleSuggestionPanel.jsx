import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Check, X, Loader2, TrendingUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { toast } from 'sonner';

export default function RoleSuggestionPanel({ lang = 'pt' }) {
    const [suggestions, setSuggestions] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(null);
    const [reviewDialog, setReviewDialog] = useState(null);
    const [searchEmail, setSearchEmail] = useState('');

    const t = {
        pt: {
            title: 'Sugestões de Função (IA)',
            description: 'Revise e aprove sugestões baseadas em comportamento',
            pending: 'Pendentes',
            analyze: 'Analisar Usuário',
            analyzing: 'Analisando...',
            approve: 'Aprovar',
            reject: 'Rejeitar',
            confidence: 'Confiança',
            reasoning: 'Raciocínio',
            activities: 'Atividades Chave',
            reviewNotes: 'Notas de Revisão',
            submit: 'Enviar',
            approved: 'Sugestão aprovada e função atribuída',
            rejected: 'Sugestão rejeitada',
            noSuggestions: 'Nenhuma sugestão pendente',
            searchPlaceholder: 'Buscar email de usuário...'
        },
        en: {
            title: 'Role Suggestions (AI)',
            description: 'Review and approve behavior-based suggestions',
            pending: 'Pending',
            analyze: 'Analyze User',
            analyzing: 'Analyzing...',
            approve: 'Approve',
            reject: 'Reject',
            confidence: 'Confidence',
            reasoning: 'Reasoning',
            activities: 'Key Activities',
            reviewNotes: 'Review Notes',
            submit: 'Submit',
            approved: 'Suggestion approved and role assigned',
            rejected: 'Suggestion rejected',
            noSuggestions: 'No pending suggestions',
            searchPlaceholder: 'Search user email...'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [suggestionData, userData] = await Promise.all([
                base44.entities.RoleSuggestion.filter({ status: 'pending' }),
                base44.entities.User.list()
            ]);
            setSuggestions(suggestionData.sort((a, b) => 
                new Date(b.created_date) - new Date(a.created_date)
            ));
            setUsers(userData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error(lang === 'pt' ? 'Erro ao carregar' : 'Error loading');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!searchEmail) {
            toast.error(lang === 'pt' ? 'Digite um email' : 'Enter an email');
            return;
        }

        setAnalyzing(searchEmail);
        try {
            const response = await base44.functions.invoke('analyzeUserForRoleSuggestion', {
                user_email: searchEmail
            });

            if (response.data.suggestion_created) {
                toast.success(lang === 'pt' ? 'Sugestão criada' : 'Suggestion created');
                loadData();
            } else {
                toast.info(response.data.reason);
            }
            setSearchEmail('');
        } catch (error) {
            console.error('Error analyzing user:', error);
            toast.error(lang === 'pt' ? 'Erro na análise' : 'Analysis error');
        } finally {
            setAnalyzing(null);
        }
    };

    const handleReview = async (action, notes) => {
        try {
            await base44.functions.invoke('approveRoleSuggestion', {
                suggestion_id: reviewDialog.id,
                action,
                review_notes: notes
            });
            toast.success(action === 'approve' ? text.approved : text.rejected);
            setReviewDialog(null);
            loadData();
        } catch (error) {
            console.error('Error reviewing suggestion:', error);
            toast.error(lang === 'pt' ? 'Erro na revisão' : 'Review error');
        }
    };

    const ReviewDialog = ({ suggestion, onClose }) => {
        const [notes, setNotes] = useState('');

        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{lang === 'pt' ? 'Revisar Sugestão' : 'Review Suggestion'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{suggestion.user_email}</Badge>
                                <Badge className="bg-[#002D62] text-white">
                                    {suggestion.suggested_role_name}
                                </Badge>
                            </div>
                            <div className="mb-2">
                                <span className="text-sm font-semibold">{text.confidence}: </span>
                                <span className="text-sm">{(suggestion.confidence_score * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={suggestion.confidence_score * 100} className="h-2 mb-3" />
                            <p className="text-sm text-gray-700 mb-3">{suggestion.reasoning}</p>
                            {suggestion.activity_summary?.key_activities && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 mb-1">{text.activities}:</p>
                                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                                        {suggestion.activity_summary.key_activities.map((activity, idx) => (
                                            <li key={idx}>{activity}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label>{text.reviewNotes}</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder={lang === 'pt' ? 'Adicione notas sobre sua decisão...' : 'Add notes about your decision...'}
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleReview('reject', notes)}
                            >
                                <X className="w-4 h-4 mr-2" />
                                {text.reject}
                            </Button>
                            <Button onClick={() => handleReview('approve', notes)}>
                                <Check className="w-4 h-4 mr-2" />
                                {text.approve}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#002D62]" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#002D62]" />
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                        {text.pending}: {suggestions.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder={text.searchPlaceholder}
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                    <Button
                        onClick={handleAnalyze}
                        disabled={analyzing || !searchEmail}
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {text.analyzing}
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4 mr-2" />
                                {text.analyze}
                            </>
                        )}
                    </Button>
                </div>

                {suggestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>{text.noSuggestions}</p>
                    </div>
                ) : (
                    <ScrollArea className="h-96">
                        <div className="space-y-3">
                            <AnimatePresence>
                                {suggestions.map(suggestion => (
                                    <motion.div
                                        key={suggestion.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 border rounded-lg hover:border-[#002D62] transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline">{suggestion.user_email}</Badge>
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                    <Badge className="bg-[#002D62] text-white">
                                                        {suggestion.suggested_role_name}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {moment(suggestion.created_date).fromNow()}
                                                    </Badge>
                                                </div>
                                                <div className="mb-2">
                                                    <span className="text-sm font-semibold">{text.confidence}: </span>
                                                    <span className="text-sm text-green-600">
                                                        {(suggestion.confidence_score * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    {suggestion.reasoning}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setReviewDialog(suggestion)}
                                                >
                                                    {lang === 'pt' ? 'Revisar' : 'Review'}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                )}
            </CardContent>

            {reviewDialog && (
                <ReviewDialog
                    suggestion={reviewDialog}
                    onClose={() => setReviewDialog(null)}
                />
            )}
        </Card>
    );
}