import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, MessageSquare, Star, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const translations = {
    pt: {
        helpful: 'Útil',
        notHelpful: 'Não útil',
        rate: 'Avaliar resposta',
        usefulness: 'Utilidade',
        accuracy: 'Precisão',
        tone: 'Tom/Estilo',
        ragQuality: 'Qualidade das citações',
        comments: 'Comentários (opcional)',
        commentsPlaceholder: 'O que você gostou ou o que poderia melhorar?',
        submit: 'Enviar',
        submitted: 'Enviado!',
        thanks: 'Obrigado pelo feedback!'
    },
    en: {
        helpful: 'Helpful',
        notHelpful: 'Not helpful',
        rate: 'Rate response',
        usefulness: 'Usefulness',
        accuracy: 'Accuracy',
        tone: 'Tone/Style',
        ragQuality: 'Citation quality',
        comments: 'Comments (optional)',
        commentsPlaceholder: 'What did you like or what could be improved?',
        submit: 'Submit',
        submitted: 'Submitted!',
        thanks: 'Thanks for your feedback!'
    }
};

export default function InlineFeedback({ 
    conversationId, 
    messageIndex, 
    messageContent,
    personaMode,
    usedRag = false,
    documentIds = [],
    lang = 'pt' 
}) {
    const [expanded, setExpanded] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [ratings, setRatings] = useState({
        usefulness: 0,
        accuracy: 0,
        tone: 0,
        rag_quality: 0
    });
    const [textFeedback, setTextFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const t = translations[lang];

    useEffect(() => {
        checkExistingFeedback();
    }, [conversationId, messageIndex]);

    const checkExistingFeedback = async () => {
        try {
            const user = await base44.auth.me();
            const existing = await base44.entities.Feedback.filter({
                conversation_id: conversationId,
                message_index: messageIndex,
                user_email: user.email
            });
            if (existing.length > 0) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Error checking feedback:', error);
        }
    };

    const handleQuickFeedback = async (isPositive) => {
        try {
            const user = await base44.auth.me();
            await base44.entities.Feedback.create({
                conversation_id: conversationId,
                message_index: messageIndex,
                feedback_type: 'message',
                ratings: {
                    usefulness: isPositive ? 5 : 1
                },
                sentiment: isPositive ? 'positive' : 'negative',
                user_email: user.email,
                context: {
                    query: messageContent?.substring(0, 200),
                    persona_mode: personaMode,
                    used_rag: usedRag,
                    document_ids: documentIds
                }
            });
            setSubmitted(true);
            toast.success(t.thanks);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Error submitting feedback');
        }
    };

    const handleDetailedSubmit = async () => {
        if (Object.values(ratings).every(r => r === 0)) {
            toast.error(lang === 'pt' ? 'Avalie ao menos um aspecto' : 'Rate at least one aspect');
            return;
        }

        setSubmitting(true);
        try {
            const user = await base44.auth.me();
            const avgRating = Object.values(ratings).filter(r => r > 0).reduce((a, b) => a + b, 0) / 
                             Object.values(ratings).filter(r => r > 0).length;
            
            await base44.entities.Feedback.create({
                conversation_id: conversationId,
                message_index: messageIndex,
                feedback_type: 'message',
                ratings,
                text_feedback: textFeedback,
                sentiment: avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative',
                user_email: user.email,
                context: {
                    query: messageContent?.substring(0, 200),
                    persona_mode: personaMode,
                    used_rag: usedRag,
                    document_ids: documentIds
                }
            });

            setSubmitted(true);
            setExpanded(false);
            toast.success(t.thanks);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Error submitting feedback');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="w-3 h-3" />
                <span>{t.submitted}</span>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {!expanded ? (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFeedback(true)}
                        className="h-7 px-2 text-xs hover:bg-green-50 hover:text-green-700"
                    >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {t.helpful}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickFeedback(false)}
                        className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-700"
                    >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        {t.notHelpful}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(true)}
                        className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700"
                    >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {t.rate}
                    </Button>
                </div>
            ) : (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-3"
                    >
                        {/* Rating Stars */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'usefulness', label: t.usefulness },
                                { key: 'accuracy', label: t.accuracy },
                                { key: 'tone', label: t.tone },
                                ...(usedRag ? [{ key: 'rag_quality', label: t.ragQuality }] : [])
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        {label}
                                    </label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRatings({ ...ratings, [key]: star })}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-4 h-4 ${
                                                        star <= ratings[key]
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Text Feedback */}
                        <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                                {t.comments}
                            </label>
                            <Textarea
                                placeholder={t.commentsPlaceholder}
                                value={textFeedback}
                                onChange={(e) => setTextFeedback(e.target.value)}
                                rows={2}
                                className="text-xs resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpanded(false)}
                                className="h-7 text-xs"
                            >
                                {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDetailedSubmit}
                                disabled={submitting}
                                className="h-7 text-xs bg-[#002D62] hover:bg-[#001d42]"
                            >
                                {submitting ? (
                                    <span>{lang === 'pt' ? 'Enviando...' : 'Sending...'}</span>
                                ) : (
                                    <>
                                        <Send className="w-3 h-3 mr-1" />
                                        {t.submit}
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}