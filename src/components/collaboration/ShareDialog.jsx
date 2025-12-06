import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Share2, Copy, Mail, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareDialog({ open, onOpenChange, itemType, itemId, itemTitle, itemData, lang = 'pt' }) {
    const [emails, setEmails] = useState('');
    const [permissions, setPermissions] = useState({
        can_view: true,
        can_edit: false,
        can_comment: true
    });
    const [sharedWith, setSharedWith] = useState([]);
    const [loading, setLoading] = useState(false);
    const [shareLink, setShareLink] = useState('');

    const t = {
        pt: {
            title: 'Compartilhar',
            description: 'Compartilhe com membros da equipe',
            emails: 'Emails (separados por vírgula)',
            emailsPlaceholder: 'usuario@exemplo.com, outro@exemplo.com',
            permissions: 'Permissões',
            canView: 'Pode visualizar',
            canEdit: 'Pode editar',
            canComment: 'Pode comentar',
            share: 'Compartilhar',
            sharing: 'Compartilhando...',
            sharedWith: 'Compartilhado com',
            copyLink: 'Copiar link',
            linkCopied: 'Link copiado!',
            shareSuccess: 'Compartilhado com sucesso!',
            cancel: 'Cancelar',
            remove: 'Remover'
        },
        en: {
            title: 'Share',
            description: 'Share with team members',
            emails: 'Emails (comma separated)',
            emailsPlaceholder: 'user@example.com, other@example.com',
            permissions: 'Permissions',
            canView: 'Can view',
            canEdit: 'Can edit',
            canComment: 'Can comment',
            share: 'Share',
            sharing: 'Sharing...',
            sharedWith: 'Shared with',
            copyLink: 'Copy link',
            linkCopied: 'Link copied!',
            shareSuccess: 'Shared successfully!',
            cancel: 'Cancel',
            remove: 'Remove'
        }
    }[lang];

    useEffect(() => {
        if (open && itemId) {
            loadSharedData();
        }
    }, [open, itemId]);

    const loadSharedData = async () => {
        try {
            const shared = await base44.entities.SharedItem.filter({ item_id: itemId });
            if (shared.length > 0) {
                setSharedWith(shared[0].shared_with || []);
                setShareLink(shared[0].share_link || '');
            }
        } catch (error) {
            console.error('Error loading shared data:', error);
        }
    };

    const handleShare = async () => {
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
        if (emailList.length === 0) return;

        setLoading(true);
        try {
            const permissionsObj = {
                can_view: emailList,
                can_edit: permissions.can_edit ? emailList : [],
                can_comment: permissions.can_comment ? emailList : []
            };

            const link = `${window.location.origin}/shared/${itemType}/${itemId}`;

            await base44.entities.SharedItem.create({
                item_type: itemType,
                item_id: itemId,
                item_title: itemTitle,
                item_data: itemData,
                shared_with: [...new Set([...sharedWith, ...emailList])],
                permissions: permissionsObj,
                share_link: link
            });

            setSharedWith([...new Set([...sharedWith, ...emailList])]);
            setShareLink(link);
            setEmails('');
            toast.success(t.shareSuccess);
        } catch (error) {
            console.error('Error sharing:', error);
            toast.error('Error sharing item');
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success(t.linkCopied);
    };

    const removeAccess = async (email) => {
        try {
            const updated = sharedWith.filter(e => e !== email);
            setSharedWith(updated);
            
            const shared = await base44.entities.SharedItem.filter({ item_id: itemId });
            if (shared.length > 0) {
                await base44.entities.SharedItem.update(shared[0].id, {
                    shared_with: updated
                });
            }
            toast.success(lang === 'pt' ? 'Acesso removido' : 'Access removed');
        } catch (error) {
            console.error('Error removing access:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        {t.title}
                    </DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>{t.emails}</Label>
                        <Input
                            value={emails}
                            onChange={(e) => setEmails(e.target.value)}
                            placeholder={t.emailsPlaceholder}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label className="mb-2 block">{t.permissions}</Label>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={permissions.can_view}
                                    disabled
                                />
                                <span className="text-sm">{t.canView}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={permissions.can_edit}
                                    onCheckedChange={(checked) => setPermissions({ ...permissions, can_edit: checked })}
                                />
                                <span className="text-sm">{t.canEdit}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={permissions.can_comment}
                                    onCheckedChange={(checked) => setPermissions({ ...permissions, can_comment: checked })}
                                />
                                <span className="text-sm">{t.canComment}</span>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleShare} disabled={loading || !emails} className="w-full bg-[#002D62]">
                        {loading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.sharing}</>
                        ) : (
                            <><Mail className="w-4 h-4 mr-2" /> {t.share}</>
                        )}
                    </Button>

                    {shareLink && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <Input value={shareLink} readOnly className="text-xs" />
                                <Button onClick={copyLink} variant="outline" size="sm">
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {sharedWith.length > 0 && (
                        <div className="pt-4 border-t">
                            <Label className="mb-2 block">{t.sharedWith}</Label>
                            <div className="space-y-2">
                                {sharedWith.map(email => (
                                    <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <span className="text-sm">{email}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAccess(email)}
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}