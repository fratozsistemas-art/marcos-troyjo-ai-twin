import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function ArticleRating({ articleId, onRated }) {
    const [rating, setRating] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRating();
    }, [articleId]);

    const loadRating = async () => {
        try {
            const article = await base44.entities.Article.filter({ id: articleId });
            if (article[0]) {
                setRating(article[0].user_rating || 0);
            }
        } catch (error) {
            console.error('Error loading rating:', error);
        }
    };

    const handleRate = async (score) => {
        setLoading(true);
        try {
            const article = await base44.entities.Article.filter({ id: articleId });
            if (!article[0]) return;

            const currentRating = article[0].user_rating || 0;
            const newRating = currentRating > 0 ? (currentRating + score) / 2 : score;

            await base44.entities.Article.update(articleId, {
                user_rating: newRating
            });

            setRating(newRating);
            setUserRating(score);
            toast.success('Avaliação registrada!');
            onRated?.();
        } catch (error) {
            console.error('Error rating:', error);
            toast.error('Erro ao avaliar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {rating ? rating.toFixed(1) : '—'}
            </div>
            
            <div className="flex gap-1">
                <Button
                    size="sm"
                    variant={userRating === 5 ? 'default' : 'outline'}
                    onClick={() => handleRate(5)}
                    disabled={loading}
                    className="h-7 px-2"
                >
                    <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                    size="sm"
                    variant={userRating === 1 ? 'default' : 'outline'}
                    onClick={() => handleRate(1)}
                    disabled={loading}
                    className="h-7 px-2"
                >
                    <ThumbsDown className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}