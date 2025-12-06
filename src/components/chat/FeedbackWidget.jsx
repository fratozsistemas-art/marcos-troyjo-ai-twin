import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function FeedbackWidget({ message, conversationId, messageIndex, lang = 'pt' }) {
    const [rating, setRating] = useState(null);
    const [showComment, setShowComment] = useState(false);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const t = {
        pt: {
            helpful: 'Útil',
            notHelpful: 'Não útil',
            addComment: 'Adicionar comentário',
            commentPlaceholder: 'O que poderia ser melhorado?',
            submit: 'Enviar',
            thanks: 'Obrigado pelo feedback!'
        },
        en: {
            helpful: 'Helpful',
            notHelpful: 'Not helpful',
            addComment: 'Add comment',
            commentPlaceholder: 'What could be improved?',
            submit: 'Submit',
            thanks: 'Thanks for your feedback!'
        }
    }[lang];

    const handleRating = async (value) => {
        setRating(value);
        
        if (value === 'negative') {
            setShowComment(true);
        } else {
            await submitFeedback(value, '');
        }
    };

    const submitFeedback = async (ratingValue, commentValue) => {
        try {
            await base44.entities.Feedback.create({
                conversation_id: conversationId,
                message_index: messageIndex,
                rating: ratingValue,
                comment: commentValue,
                response_content: message.content?.substring(0, 500) || ''
            });
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    const handleSubmitComment = async () => {
        await submitFeedback(rating, comment);
        setShowComment(false);
        setComment('');
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 mt-2 text-xs text-green-600"
            >
                <Check className="w-3.5 h-3.5" />
                <span>{t.thanks}</span>
            </motion.div>
        );
    }

    return (
        <div className="mt-2">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRating('positive')}
                    className={`h-7 px-2 text-xs ${rating === 'positive' ? 'bg-green-50 text-green-600' : 'text-[#333F48]/60 hover:text-green-600'}`}
                >
                    <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                    {t.helpful}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRating('negative')}
                    className={`h-7 px-2 text-xs ${rating === 'negative' ? 'bg-red-50 text-red-600' : 'text-[#333F48]/60 hover:text-red-600'}`}
                >
                    <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                    {t.notHelpful}
                </Button>
            </div>

            <AnimatePresence>
                {showComment && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-2"
                    >
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t.commentPlaceholder}
                            className="text-xs h-20 resize-none"
                        />
                        <Button
                            onClick={handleSubmitComment}
                            size="sm"
                            className="h-7 text-xs bg-[#002D62] hover:bg-[#001d42]"
                        >
                            {t.submit}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}