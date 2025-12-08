import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Edit3, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/components/rbac/PermissionGate';
import QualityBadge from './QualityBadge';

export default function AdminReviewPanel({ article, onReviewComplete }) {
    const [verificationNotes, setVerificationNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const { can, roleType } = usePermissions();
    const lang = localStorage.getItem('troyjo_lang') || 'pt';

    const canVerify = can && (can('articles', 'revise') || roleType === 'admin' || roleType === 'executive');

    const t = {
        pt: {
            reviewPanel: 'Painel de Revisão Humana',
            currentTier: 'Nível Atual',
            author: 'Autor',
            verificationNotes: 'Notas de Verificação',
            approve: 'Aprovar como Human-Verified',
            reject: 'Rejeitar',
            submitForTroyjo: 'Enviar para Revisão Troyjo',
            warning: 'Este artigo foi gerado por IA e precisa de verificação humana antes de ser público.',
            approved: 'Artigo aprovado como Human-Verified',
            rejected: 'Artigo rejeitado'
        },
        en: {
            reviewPanel: 'Human Review Panel',
            currentTier: 'Current Tier',
            author: 'Author',
            verificationNotes: 'Verification Notes',
            approve: 'Approve as Human-Verified',
            reject: 'Reject',
            submitForTroyjo: 'Submit for Troyjo Review',
            warning: 'This article was AI-generated and needs human verification before going public.',
            approved: 'Article approved as Human-Verified',
            rejected: 'Article rejected'
        }
    };

    const text = t[lang];

    const handleApprove = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const newVersion = {
                version: (article.version_history?.length || 0) + 1,
                edited_by: user.email,
                edited_at: new Date().toISOString(),
                changes: verificationNotes || 'Human verification completed',
                tier_change: 'ai_generated → curator_approved'
            };

            await base44.entities.Article.update(article.id, {
                quality_tier: 'curator_approved',
                approval_status: 'human_verified',
                verified_by: user.email,
                verification_date: new Date().toISOString(),
                status: 'publicado',
                version_history: [...(article.version_history || []), newVersion]
            });
            toast.success(text.approved);
            if (onReviewComplete) onReviewComplete();
        } catch (error) {
            console.error('Error approving article:', error);
            toast.error('Error');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            await base44.entities.Article.update(article.id, {
                approval_status: 'rejeitado',
                verified_by: user.email,
                verification_date: new Date().toISOString(),
                revision_notes: verificationNotes,
                status: 'rascunho'
            });
            toast.success(text.rejected);
            if (onReviewComplete) onReviewComplete();
        } catch (error) {
            console.error('Error rejecting article:', error);
            toast.error('Error');
        } finally {
            setLoading(false);
        }
    };

    if (!canVerify || article.quality_tier !== 'ai_generated') {
        return null;
    }

    return (
        <Card className="border-blue-200 border-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Edit3 className="w-5 h-5" />
                    {text.reviewPanel}
                </CardTitle>
                <div className="flex items-center gap-3 pt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-700" />
                    <p className="text-sm text-amber-900">{text.warning}</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-600 mb-1">{text.currentTier}</p>
                        <QualityBadge tier={article.quality_tier} lang={lang} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-1">{text.author}</p>
                        <p className="text-sm font-medium">{article.author_email || article.authors?.[0]}</p>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {text.verificationNotes}
                    </label>
                    <Textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder={lang === 'pt' ? 'Adicione suas observações de verificação...' : 'Add your verification observations...'}
                        rows={4}
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {text.approve}
                    </Button>
                    <Button
                        onClick={handleReject}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                    >
                        <XCircle className="w-4 h-4 mr-2" />
                        {text.reject}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}