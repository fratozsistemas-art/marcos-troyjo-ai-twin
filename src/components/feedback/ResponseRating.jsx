import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResponseRating({ 
    conversationId, 
    messageIndex, 
    lang = 'pt',
    compact = false 
}) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [helpful, setHelpful] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const t = {
        pt: {
            rate: 'Avaliar resposta',
            helpful: 'Esta resposta foi útil?',
            yes: 'Sim',
            no: 'Não',
            addFeedback: 'Adicionar comentário',
            feedback: 'Seu feedback (opcional)',
            submit: 'Enviar',
            cancel: 'Cancelar',
            thanks: 'Obrigado pelo feedback!',
            error: 'Erro ao enviar feedback'
        },
        en: {
            rate: 'Rate response',
            helpful: 'Was this response helpful?',
            yes: 'Yes',
            no: 'No',
            addFeedback: 'Add comment',
            feedback: 'Your feedback (optional)',
            submit: 'Submit',
            cancel: 'Cancel',
            thanks: 'Thanks for your feedback!',
            error: 'Error submitting feedback'
        }
    };

    const text = t[lang];

    useEffect(() => {
        loadExistingFeedback();
    }, [conversationId, messageIndex]);

    const loadExistingFeedback = async () => {
        try {
            const user = await base44.auth.me();
            const feedbacks = await base44.entities.AIResponseFeedback.filter({
                conversation_id: conversationId,
                message_index: messageIndex,
                user_email: user.email
            });
            if (feedbacks.length > 0) {
                const feedback = feedbacks[0];
                setExistingFeedback(feedback);
                setRating(feedback.rating);
                setHelpful(feedback.helpful);
                setFeedbackText(feedback.feedback_text || '');
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Error loading feedback:', error);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) return;
        
        setIsSubmitting(true);
        try {
            const user = await base44.auth.me();
            
            if (existingFeedback) {
                await base44.entities.AIResponseFeedback.update(existingFeedback.id, {
                    rating,
                    helpful,
                    feedback_text: feedbackText
                });
            } else {
                await base44.entities.AIResponseFeedback.create({
                    conversation_id: conversationId,
                    message_index: messageIndex,
                    user_email: user.email,
                    rating,
                    helpful,
                    feedback_text: feedbackText
                });
            }
            
            setSubmitted(true);
            setShowFeedback(false);
            toast.success(text.thanks);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error(text.error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted && compact) {
        return (
            <div className="flex items-center gap-1 text-xs text-green-600">
                <Check className="w-3 h-3" />
                <span>{text.thanks}</span>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-all hover:scale-110"
                        >
                            <Star
                                className={`w-4 h-4 ${
                                    star <= (hoveredRating || rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && !submitted && (
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-6 px-2 text-xs"
                    >
                        {text.submit}
                    </Button>
                )}
            </div>
        );
    }

    return (
        <Card className="border-gray-100">
            <CardContent className="p-4 space-y-4">
                {/* Star Rating */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">{text.rate}</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="transition-all"
                            >
                                <Star
                                    className={`w-6 h-6 ${
                                        star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Helpful/Not Helpful */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">{text.helpful}</p>
                    <div className="flex gap-2">
                        <Button
                            variant={helpful === true ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHelpful(true)}
                            className="gap-2"
                        >
                            <ThumbsUp className="w-4 h-4" />
                            {text.yes}
                        </Button>
                        <Button
                            variant={helpful === false ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setHelpful(false)}
                            className="gap-2"
                        >
                            <ThumbsDown className="w-4 h-4" />
                            {text.no}
                        </Button>
                    </div>
                </div>

                {/* Feedback Text */}
                <AnimatePresence>
                    {(showFeedback || feedbackText) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2"
                        >
                            <Textarea
                                placeholder={text.feedback}
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                className="min-h-[80px]"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {!showFeedback && !feedbackText && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFeedback(true)}
                        className="gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        {text.addFeedback}
                    </Button>
                )}

                {/* Submit Button */}
                {rating > 0 && !submitted && (
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {text.submit}
                        </Button>
                        {showFeedback && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowFeedback(false);
                                    setFeedbackText('');
                                }}
                            >
                                {text.cancel}
                            </Button>
                        )}
                    </div>
                )}

                {submitted && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 text-green-600 justify-center py-2"
                    >
                        <Check className="w-5 h-5" />
                        <span className="font-medium">{text.thanks}</span>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}