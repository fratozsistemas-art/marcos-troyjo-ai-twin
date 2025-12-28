import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, DialogContent, DialogDescription, 
    DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Share2, Copy, Check, Mail, Users, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ShareContentDialog({ 
    contentId, 
    contentType, 
    contentTitle,
    contentSnapshot = {},
    lang = 'pt' 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [shareType, setShareType] = useState('public_link');
    const [allowedUsers, setAllowedUsers] = useState([]);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [permissions, setPermissions] = useState({
        can_view: true,
        can_comment: true,
        can_edit: false,
        can_reshare: false
    });
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);

    const t = {
        pt: {
            share: 'Compartilhar',
            shareContent: 'Compartilhar Conteúdo',
            description: 'Compartilhe este conteúdo com sua equipe',
            publicLink: 'Link Público',
            specificUsers: 'Usuários Específicos',
            organization: 'Organização',
            addUser: 'Adicionar usuário',
            emailPlaceholder: 'Email do usuário',
            permissions: 'Permissões',
            canView: 'Pode visualizar',
            canComment: 'Pode comentar',
            canEdit: 'Pode editar',
            canReshare: 'Pode recompartilhar',
            generateLink: 'Gerar Link',
            copyLink: 'Copiar Link',
            linkCopied: 'Link copiado!',
            shareSuccess: 'Conteúdo compartilhado!',
            add: 'Adicionar'
        },
        en: {
            share: 'Share',
            shareContent: 'Share Content',
            description: 'Share this content with your team',
            publicLink: 'Public Link',
            specificUsers: 'Specific Users',
            organization: 'Organization',
            addUser: 'Add user',
            emailPlaceholder: 'User email',
            permissions: 'Permissions',
            canView: 'Can view',
            canComment: 'Can comment',
            canEdit: 'Can edit',
            canReshare: 'Can reshare',
            generateLink: 'Generate Link',
            copyLink: 'Copy Link',
            linkCopied: 'Link copied!',
            shareSuccess: 'Content shared!',
            add: 'Add'
        }
    }[lang];

    const handleShare = async () => {
        try {
            const user = await base44.auth.me();
            
            const shareData = {
                owner_email: user.email,
                content_type: contentType,
                content_id: contentId,
                content_title: contentTitle,
                content_snapshot: contentSnapshot,
                share_type: shareType,
                allowed_users: shareType === 'specific_users' ? allowedUsers : [],
                permissions: permissions,
                active: true
            };

            const created = await base44.entities.SharedContent.create(shareData);

            if (shareType === 'public_link') {
                const link = `${window.location.origin}/shared/${created.share_token || created.id}`;
                setShareLink(link);
            }

            toast.success(t.shareSuccess);
        } catch (error) {
            console.error('Error sharing content:', error);
            toast.error(error.message);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        toast.success(t.linkCopied);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAddUser = () => {
        if (newUserEmail && !allowedUsers.includes(newUserEmail)) {
            setAllowedUsers([...allowedUsers, newUserEmail]);
            setNewUserEmail('');
        }
    };

    const handleRemoveUser = (email) => {
        setAllowedUsers(allowedUsers.filter(e => e !== email));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    {t.share}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        {t.shareContent}
                    </DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>

                <Tabs value={shareType} onValueChange={setShareType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="public_link" className="gap-2">
                            <LinkIcon className="w-4 h-4" />
                            {t.publicLink}
                        </TabsTrigger>
                        <TabsTrigger value="specific_users" className="gap-2">
                            <Mail className="w-4 h-4" />
                            {t.specificUsers}
                        </TabsTrigger>
                        <TabsTrigger value="organization" className="gap-2">
                            <Users className="w-4 h-4" />
                            {t.organization}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="public_link" className="space-y-4">
                        {shareLink ? (
                            <div className="flex items-center gap-2">
                                <Input value={shareLink} readOnly className="flex-1" />
                                <Button onClick={handleCopyLink} variant="outline">
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={handleShare} className="w-full">
                                {t.generateLink}
                            </Button>
                        )}
                    </TabsContent>

                    <TabsContent value="specific_users" className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder={t.emailPlaceholder}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                            />
                            <Button onClick={handleAddUser} size="sm">
                                {t.add}
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {allowedUsers.map(email => (
                                <Badge key={email} variant="secondary" className="pr-1">
                                    {email}
                                    <button
                                        onClick={() => handleRemoveUser(email)}
                                        className="ml-2 hover:bg-gray-200 rounded-full p-0.5"
                                    >
                                        <Check className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>

                        <Button onClick={handleShare} className="w-full" disabled={allowedUsers.length === 0}>
                            {t.share}
                        </Button>
                    </TabsContent>

                    <TabsContent value="organization" className="space-y-4">
                        <p className="text-sm text-gray-600">
                            {lang === 'pt' 
                                ? 'Este conteúdo será compartilhado com todos os membros da organização.'
                                : 'This content will be shared with all organization members.'}
                        </p>
                        <Button onClick={handleShare} className="w-full">
                            {t.share}
                        </Button>
                    </TabsContent>
                </Tabs>

                {/* Permissions */}
                <div className="space-y-3 border-t pt-4">
                    <Label className="font-semibold">{t.permissions}</Label>
                    
                    <div className="flex items-center justify-between">
                        <Label className="text-sm">{t.canView}</Label>
                        <Switch
                            checked={permissions.can_view}
                            onCheckedChange={(checked) => setPermissions({...permissions, can_view: checked})}
                            disabled
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="text-sm">{t.canComment}</Label>
                        <Switch
                            checked={permissions.can_comment}
                            onCheckedChange={(checked) => setPermissions({...permissions, can_comment: checked})}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="text-sm">{t.canEdit}</Label>
                        <Switch
                            checked={permissions.can_edit}
                            onCheckedChange={(checked) => setPermissions({...permissions, can_edit: checked})}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="text-sm">{t.canReshare}</Label>
                        <Switch
                            checked={permissions.can_reshare}
                            onCheckedChange={(checked) => setPermissions({...permissions, can_reshare: checked})}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}