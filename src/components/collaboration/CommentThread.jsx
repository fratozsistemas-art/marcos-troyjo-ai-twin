import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CommentThread({ itemType, itemId, lang = 'pt' }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    const t = {
        pt: {
            title: 'Comentários',
            placeholder: 'Adicione um comentário...',
            send: 'Enviar',
            resolve: 'Resolver',
            reopen: 'Reabrir',
            noComments: 'Nenhum comentário ainda',
            resolved: 'Resolvido',
            reply: 'Responder'
        },
        en: {
            title: 'Comments',
            placeholder: 'Add a comment...',
            send: 'Send',
            resolve: 'Resolve',
            reopen: 'Reopen',
            noComments: 'No comments yet',
            resolved: 'Resolved',
            reply: 'Reply'
        }
    }[lang];

    useEffect(() => {
        loadUser();
        loadComments();
    }, [itemId]);

    const loadUser = async () => {
        try {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    };

    const loadComments = async () => {
        try {
            const commentList = await base44.entities.Comment.filter(
                { item_type: itemType, item_id: itemId, parent_comment_id: null },
                '-created_date'
            );
            setComments(commentList || []);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await base44.entities.Comment.create({
                item_type: itemType,
                item_id: itemId,
                content: newComment,
                is_resolved: false
            });

            setNewComment('');
            await loadComments();
            toast.success(lang === 'pt' ? 'Comentário adicionado!' : 'Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error(lang === 'pt' ? 'Erro ao adicionar comentário' : 'Error adding comment');
        } finally {
            setLoading(false);
        }
    };

    const toggleResolve = async (comment) => {
        try {
            await base44.entities.Comment.update(comment.id, {
                is_resolved: !comment.is_resolved,
                resolved_by: !comment.is_resolved ? user?.email : null
            });
            await loadComments();
        } catch (error) {
            console.error('Error toggling resolve:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <MessageSquare className="w-5 h-5" />
                    {t.title}
                    {comments.length > 0 && (
                        <Badge variant="secondary">{comments.length}</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t.placeholder}
                        className="flex-1"
                        rows={2}
                    />
                    <Button
                        onClick={handleAddComment}
                        disabled={loading || !newComment.trim()}
                        className="bg-[#002D62]"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                <ScrollArea className="h-96">
                    {comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>{t.noComments}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {comments.map(comment => (
                                <div
                                    key={comment.id}
                                    className={`border rounded-lg p-3 ${comment.is_resolved ? 'bg-gray-50' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="font-medium text-sm text-[#333F48]">
                                                {comment.created_by}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(comment.created_date).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {comment.is_resolved && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {t.resolved}
                                                </Badge>
                                            )}
                                            <Button
                                                onClick={() => toggleResolve(comment)}
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2"
                                            >
                                                {comment.is_resolved ? (
                                                    <><X className="w-3 h-3 mr-1" /> {t.reopen}</>
                                                ) : (
                                                    <><Check className="w-3 h-3 mr-1" /> {t.resolve}</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}