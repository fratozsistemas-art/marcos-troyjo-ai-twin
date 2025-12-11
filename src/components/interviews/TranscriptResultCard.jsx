import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function TranscriptResultCard({ result, query, onFeedbackSubmit }) {
    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const highlightMatchingPhrases = (text, phrases) => {
        if (!phrases || phrases.length === 0) return text;
        
        let highlightedText = text;
        phrases.forEach(phrase => {
            const regex = new RegExp(`(${phrase})`, 'gi');
            highlightedText = highlightedText.replace(
                regex,
                '<mark class="bg-yellow-200 font-semibold">$1</mark>'
            );
        });
        
        return highlightedText;
    };

    const handleSubmitFeedback = async (wasHelpful) => {
        setSubmitting(true);
        try {
            await base44.entities.TranscriptFeedback.create({
                transcript_id: result.transcript_id,
                chunk_id: result.chunk_id,
                user_query: query,
                relevance_score: rating,
                feedback_text: feedbackText,
                was_helpful: wasHelpful,
                needs_reindexing: rating <= 2
            });

            toast.success('Feedback enviado!');
            setShowFeedback(false);
            if (onFeedbackSubmit) onFeedbackSubmit();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Erro ao enviar feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="hover:border-[#002D62]/30 transition-colors">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <h4 className="font-semibold text-[#002D62] text-sm mb-1">
                                {result.transcript_title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span>{new Date(result.interview_date).toLocaleDateString()}</span>
                                {result.venue && <span>• {result.venue}</span>}
                            </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {Math.round(result.relevance_score * 100)}%
                        </Badge>
                    </div>

                    <div 
                        className="text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{
                            __html: highlightMatchingPhrases(
                                result.text.substring(0, 400) + '...',
                                result.matching_phrases
                            )
                        }}
                    />

                    {result.metadata?.neologisms_in_chunk?.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                            {result.metadata.neologisms_in_chunk.map(neo => (
                                <Badge key={neo} variant="outline" className="text-xs">
                                    {neo}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {!showFeedback ? (
                        <div className="flex items-center gap-2 pt-2 border-t">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSubmitFeedback(true)}
                                className="gap-1"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                Útil
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSubmitFeedback(false)}
                                className="gap-1"
                            >
                                <ThumbsDown className="w-4 h-4" />
                                Não útil
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowFeedback(true)}
                                className="gap-1 ml-auto"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Feedback detalhado
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2 pt-2 border-t">
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">Relevância:</span>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="hover:scale-110 transition-transform"
                                    >
                                        <Star
                                            className={`w-4 h-4 ${
                                                star <= rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <Textarea
                                placeholder="Feedback opcional..."
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                className="text-sm"
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleSubmitFeedback(rating >= 3)}
                                    disabled={rating === 0 || submitting}
                                >
                                    Enviar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowFeedback(false)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}