import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
    MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, 
    RefreshCw, X, Plus, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const REACTION_TYPES = {
    praise: { icon: ThumbsUp, color: 'text-green-600', label: 'Elogiar' },
    disagree: { icon: ThumbsDown, color: 'text-red-600', label: 'Reprovar' },
    agree: { icon: CheckCircle, color: 'text-blue-600', label: 'Concordar' },
    refine: { icon: RefreshCw, color: 'text-orange-600', label: 'Refinar' }
};

export default function ParagraphAnnotation({ 
    contentId, 
    contentType, 
    paragraphIndex, 
    paragraphText,
    lang = 'pt' 
}) {
    const [annotations, setAnnotations] = useState([]);
    const [showAnnotation, setShowAnnotation] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [highlightedText, setHighlightedText] = useState('');
    const [user, setUser] = useState(null);

    const t = {
        pt: {
            addAnnotation: 'Adicionar Anotação',
            comment: 'Comentário',
            addComment: 'Adicionar comentário...',
            send: 'Enviar',
            cancel: 'Cancelar',
            annotations: 'Anotações',
            highlightedText: 'Texto destacado',
            reaction: 'Reação'
        },
        en: {
            addAnnotation: 'Add Annotation',
            comment: 'Comment',
            addComment: 'Add comment...',
            send: 'Send',
            cancel: 'Cancel',
            annotations: 'Annotations',
            highlightedText: 'Highlighted text',
            reaction: 'Reaction'
        }
    }[lang];

    useEffect(() => {
        loadUser();
        loadAnnotations();
    }, []);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const loadAnnotations = async () => {
        try {
            const comments = await base44.entities.Comment.filter({
                content_id: contentId,
                paragraph_index: paragraphIndex
            });
            setAnnotations(comments || []);
        } catch (error) {
            console.error('Error loading annotations:', error);
        }
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text.length > 0) {
            setHighlightedText(text);
            setShowAnnotation(true);
        }
    };

    const handleAddAnnotation = async () => {
        if (!newComment.trim() && !selectedReaction) return;

        try {
            await base44.entities.Comment.create({
                content_id: contentId,
                content_type: contentType,
                paragraph_index: paragraphIndex,
                user_email: user.email,
                comment_text: newComment,
                highlighted_text: highlightedText,
                reaction_type: selectedReaction,
                metadata: {
                    paragraph_text: paragraphText.substring(0, 100)
                }
            });

            toast.success(lang === 'pt' ? 'Anotação adicionada!' : 'Annotation added!');
            setNewComment('');
            setHighlightedText('');
            setSelectedReaction(null);
            setShowAnnotation(false);
            loadAnnotations();
        } catch (error) {
            console.error('Error adding annotation:', error);
            toast.error(error.message);
        }
    };

    const getAnnotationCount = () => annotations.length;

    return (
        <div className="relative">
            <div 
                onMouseUp={handleTextSelection}
                className="relative group"
            >
                {/* Paragraph content wrapper */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    {paragraphText}
                </div>

                {/* Annotation indicator */}
                {getAnnotationCount() > 0 && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                    {getAnnotationCount()}
                                </Badge>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 p-4" side="right">
                            <div className="space-y-3">
                                <h4 className="font-semibold text-sm">{t.annotations}</h4>
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {annotations.map((annotation) => {
                                        const ReactionIcon = annotation.reaction_type ? REACTION_TYPES[annotation.reaction_type]?.icon : null;
                                        return (
                                            <div key={annotation.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarFallback className="text-xs">
                                                            {annotation.user_email?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-gray-900 dark:text-white">
                                                            {annotation.user_email?.split('@')[0]}
                                                        </p>
                                                        {annotation.reaction_type && ReactionIcon && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <ReactionIcon className={`w-3 h-3 ${REACTION_TYPES[annotation.reaction_type].color}`} />
                                                                <span className="text-xs text-gray-500">
                                                                    {REACTION_TYPES[annotation.reaction_type].label}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {annotation.highlighted_text && (
                                                    <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-2 border-yellow-500">
                                                        <p className="text-xs italic text-gray-700 dark:text-gray-300">
                                                            "{annotation.highlighted_text}"
                                                        </p>
                                                    </div>
                                                )}
                                                {annotation.comment_text && (
                                                    <p className="text-xs text-gray-700 dark:text-gray-300">
                                                        {annotation.comment_text}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(annotation.created_date).toLocaleString()}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>

            {/* Add annotation popover */}
            <AnimatePresence>
                {showAnnotation && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 z-50 w-96 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-sm">{t.addAnnotation}</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAnnotation(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {highlightedText && (
                            <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-2 border-yellow-500">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t.highlightedText}:
                                </p>
                                <p className="text-xs italic text-gray-600 dark:text-gray-400">
                                    "{highlightedText}"
                                </p>
                            </div>
                        )}

                        <div className="mb-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t.reaction}:</p>
                            <div className="flex gap-2">
                                {Object.entries(REACTION_TYPES).map(([key, { icon: Icon, color, label }]) => (
                                    <Button
                                        key={key}
                                        variant={selectedReaction === key ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedReaction(selectedReaction === key ? null : key)}
                                        className="flex-1"
                                    >
                                        <Icon className={`w-4 h-4 ${selectedReaction === key ? 'text-white' : color}`} />
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={t.addComment}
                            className="mb-3 text-sm"
                            rows={3}
                        />

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleAddAnnotation}
                                disabled={!newComment.trim() && !selectedReaction}
                                className="flex-1"
                                size="sm"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {t.send}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowAnnotation(false)}
                                size="sm"
                            >
                                {t.cancel}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}