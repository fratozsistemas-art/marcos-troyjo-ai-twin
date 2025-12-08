import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Edit3, Stamp } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/components/rbac/PermissionGate';
import QualityBadge from './QualityBadge';

export default function ArticleRevisionPanel({ article, onRevisionComplete }) {
    const [revisionNotes, setRevisionNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const { hasPrivilege, roleType } = usePermissions();
    const lang = localStorage.getItem('troyjo_lang') || 'pt';

    const isTroyjo = hasPrivilege && hasPrivilege('troyjo_revision');

    const t = {
        pt: {
            revisionPanel: 'Painel de Revisão',
            status: 'Status',
            author: 'Autor',
            revisedBy: 'Revisado por',
            revisionNotes: 'Notas de Revisão',
            approve: 'Aprovar Artigo',
            reject: 'Rejeitar',
            submitRevision: 'Submeter Revisão',
            troyjoStamp: '© Marcos Troyjo',
            approved: 'Aprovado',
            pending: 'Pendente',
            inReview: 'Em Revisão',
            rejected: 'Rejeitado'
        },
        en: {
            revisionPanel: 'Revision Panel',
            status: 'Status',
            author: 'Author',
            revisedBy: 'Revised by',
            revisionNotes: 'Revision Notes',
            approve: 'Approve Article',
            reject: 'Reject',
            submitRevision: 'Submit Revision',
            troyjoStamp: '© Marcos Troyjo',
            approved: 'Approved',
            pending: 'Pending',
            inReview: 'In Review',
            rejected: 'Rejected'
        }
    };

    const text = t[lang];

    const statusColors = {
        pendente: 'bg-yellow-100 text-yellow-800',
        em_revisao: 'bg-blue-100 text-blue-800',
        aprovado: 'bg-green-100 text-green-800',
        rejeitado: 'bg-red-100 text-red-800'
    };

    const handleApprove = async () => {
        setLoading(true);
        try {
            const user = await base44.auth.me();
            const newVersion = {
                version: (article.version_history?.length || 0) + 1,
                edited_by: user.email,
                edited_at: new Date().toISOString(),
                changes: revisionNotes || 'Troyjo certification',
                tier_change: 'curator_approved → troyjo_certified'
            };

            await base44.entities.Article.update(article.id, {
                quality_tier: 'troyjo_certified',
                approval_status: 'aprovado',
                revised_by: user.email,
                revision_notes: revisionNotes,
                revision_date: new Date().toISOString(),
                status: 'publicado',
                version_history: [...(article.version_history || []), newVersion]
            });
            toast.success(text.approved);
            if (onRevisionComplete) onRevisionComplete();
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
                revised_by: user.email,
                revision_notes: revisionNotes,
                revision_date: new Date().toISOString()
            });
            toast.success(text.rejected);
            if (onRevisionComplete) onRevisionComplete();
        } catch (error) {
            console.error('Error rejecting article:', error);
            toast.error('Error');
        } finally {
            setLoading(false);
        }
    };

    if (!isTroyjo && roleType !== 'admin') {
        return null;
    }

    if (article.quality_tier !== 'curator_approved' && article.approval_status !== 'human_verified') {
        return null;
    }

    return (
        <Card className="border-[#B8860B] border-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#002D62]">
                    <Edit3 className="w-5 h-5" />
                    {text.revisionPanel}
                    {isTroyjo && (
                        <Badge className="ml-auto bg-[#B8860B] text-white">
                            <Stamp className="w-3 h-3 mr-1" />
                            {text.troyjoStamp}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-600 mb-1">{lang === 'pt' ? 'Nível Atual' : 'Current Tier'}</p>
                        <QualityBadge tier={article.quality_tier} lang={lang} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 mb-1">{text.author}</p>
                        <p className="text-sm font-medium">{article.author_email || article.authors?.[0]}</p>
                    </div>
                </div>

                {article.verified_by && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-xs text-green-700 mb-1">{lang === 'pt' ? 'Verificado por' : 'Verified by'}</p>
                        <p className="text-sm font-semibold text-green-900">{article.verified_by}</p>
                        {article.verification_date && (
                            <p className="text-xs text-green-600 mt-1">
                                {new Date(article.verification_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                )}

                {article.revised_by && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-xs text-green-700 mb-1">{text.revisedBy}</p>
                        <p className="text-sm font-semibold text-green-900">{article.revised_by}</p>
                        {article.revision_date && (
                            <p className="text-xs text-green-600 mt-1">
                                {new Date(article.revision_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {text.revisionNotes}
                    </label>
                    <Textarea
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        placeholder={lang === 'pt' ? 'Adicione suas observações...' : 'Add your observations...'}
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