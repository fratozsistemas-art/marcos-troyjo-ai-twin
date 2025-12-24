import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Share2, Link as LinkIcon, Users, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const ShareButton = ({ contentType, contentId, contentTitle, lang = 'pt' }) => {
    const [open, setOpen] = useState(false);
    const [shareType, setShareType] = useState('public_link');
    const [allowedEmails, setAllowedEmails] = useState('');
    const [permissions, setPermissions] = useState({
        can_view: true,
        can_comment: false,
        can_edit: false,
        can_reshare: false
    });
    const [expirationDays, setExpirationDays] = useState(7);
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const t = {
        pt: {
            share: 'Compartilhar',
            shareWith: 'Compartilhar com',
            publicLink: 'Link Público',
            specificUsers: 'Usuários Específicos',
            organization: 'Organização',
            emails: 'Emails (separados por vírgula)',
            permissions: 'Permissões',
            canView: 'Pode visualizar',
            canComment: 'Pode comentar',
            canEdit: 'Pode editar',
            canReshare: 'Pode recompartilhar',
            expiration: 'Expiração',
            days: 'dias',
            generateLink: 'Gerar Link',
            copyLink: 'Copiar Link',
            copied: 'Copiado!',
            shareSuccess: 'Conteúdo compartilhado com sucesso!',
            shareError: 'Erro ao compartilhar conteúdo'
        },
        en: {
            share: 'Share',
            shareWith: 'Share with',
            publicLink: 'Public Link',
            specificUsers: 'Specific Users',
            organization: 'Organization',
            emails: 'Emails (comma separated)',
            permissions: 'Permissions',
            canView: 'Can view',
            canComment: 'Can comment',
            canEdit: 'Can edit',
            canReshare: 'Can reshare',
            expiration: 'Expiration',
            days: 'days',
            generateLink: 'Generate Link',
            copyLink: 'Copy Link',
            copied: 'Copied!',
            shareSuccess: 'Content shared successfully!',
            shareError: 'Error sharing content'
        }
    };

    const text = t[lang];

    const handleShare = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('shareContent', {
                content_type: contentType,
                content_id: contentId,
                share_type: shareType,
                allowed_users: shareType === 'specific_users' ? allowedEmails.split(',').map(e => e.trim()) : [],
                permissions,
                expiration_days: expirationDays
            });

            setShareUrl(response.data.share_url);
            toast.success(text.shareSuccess);
        } catch (error) {
            console.error('Error sharing:', error);
            toast.error(text.shareError);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success(text.copied);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    {text.share}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        {text.share}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <div>
                        <Label className="mb-2 block">{text.shareWith}</Label>
                        <div className="flex gap-2">
                            <Button
                                variant={shareType === 'public_link' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setShareType('public_link')}
                                className="flex-1"
                            >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                {text.publicLink}
                            </Button>
                            <Button
                                variant={shareType === 'specific_users' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setShareType('specific_users')}
                                className="flex-1"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                {text.specificUsers}
                            </Button>
                        </div>
                    </div>

                    {shareType === 'specific_users' && (
                        <div>
                            <Label htmlFor="emails">{text.emails}</Label>
                            <Input
                                id="emails"
                                value={allowedEmails}
                                onChange={(e) => setAllowedEmails(e.target.value)}
                                placeholder="user1@example.com, user2@example.com"
                                className="mt-1"
                            />
                        </div>
                    )}

                    <div>
                        <Label className="mb-3 block">{text.permissions}</Label>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{text.canView}</span>
                                <Switch 
                                    checked={permissions.can_view}
                                    disabled
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{text.canComment}</span>
                                <Switch 
                                    checked={permissions.can_comment}
                                    onCheckedChange={(checked) => 
                                        setPermissions({...permissions, can_comment: checked})
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{text.canEdit}</span>
                                <Switch 
                                    checked={permissions.can_edit}
                                    onCheckedChange={(checked) => 
                                        setPermissions({...permissions, can_edit: checked})
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">{text.canReshare}</span>
                                <Switch 
                                    checked={permissions.can_reshare}
                                    onCheckedChange={(checked) => 
                                        setPermissions({...permissions, can_reshare: checked})
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="expiration">{text.expiration}</Label>
                        <div className="flex gap-2 items-center mt-1">
                            <Input
                                id="expiration"
                                type="number"
                                value={expirationDays}
                                onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                                className="w-24"
                            />
                            <span className="text-sm text-gray-600">{text.days}</span>
                        </div>
                    </div>

                    {shareUrl ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <Label className="mb-2 block text-xs text-gray-600">Link de compartilhamento:</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={shareUrl}
                                    readOnly
                                    className="flex-1 text-sm"
                                />
                                <Button
                                    size="sm"
                                    onClick={copyToClipboard}
                                    variant="outline"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button 
                            onClick={handleShare}
                            disabled={loading || (shareType === 'specific_users' && !allowedEmails)}
                            className="w-full"
                        >
                            {loading ? 'Gerando...' : text.generateLink}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShareButton;