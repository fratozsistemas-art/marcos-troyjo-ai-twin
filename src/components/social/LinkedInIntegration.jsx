import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Share2, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function LinkedInIntegration({ article, lang = 'pt' }) {
    const [posting, setPosting] = useState(false);
    const [posted, setPosted] = useState(false);
    const [customText, setCustomText] = useState('');

    const t = {
        pt: {
            title: 'Compartilhar no LinkedIn',
            description: 'Publique este artigo no seu perfil profissional',
            connected: 'LinkedIn Conectado',
            notConnected: 'LinkedIn não conectado',
            connect: 'Conectar LinkedIn',
            customMessage: 'Mensagem personalizada (opcional)',
            post: 'Publicar',
            posting: 'Publicando...',
            posted: 'Publicado com sucesso!',
            viewPost: 'Ver no LinkedIn',
            defaultMessage: (title) => `🌍 Novo artigo publicado: ${title}\n\nConfira no Troyjo Digital Twin!`
        },
        en: {
            title: 'Share on LinkedIn',
            description: 'Publish this article to your professional profile',
            connected: 'LinkedIn Connected',
            notConnected: 'LinkedIn not connected',
            connect: 'Connect LinkedIn',
            customMessage: 'Custom message (optional)',
            post: 'Publish',
            posting: 'Publishing...',
            posted: 'Posted successfully!',
            viewPost: 'View on LinkedIn',
            defaultMessage: (title) => `🌍 New article published: ${title}\n\nCheck it out on Troyjo Digital Twin!`
        }
    };

    const text = t[lang];

    const handleConnect = () => {
        const linkedInUrl = base44.agents.getWhatsAppConnectURL('linkedin');
        window.open(linkedInUrl, '_blank');
    };

    const handlePost = async () => {
        setPosting(true);
        try {
            const articleUrl = `${window.location.origin}${window.location.pathname}`;
            const message = customText || text.defaultMessage(article.title);

            const response = await base44.functions.invoke('postToLinkedIn', {
                text: message,
                article_url: articleUrl,
                article_title: article.title
            });

            if (response.data.success) {
                setPosted(true);
                toast.success(text.posted);
            }
        } catch (error) {
            console.error('Error posting to LinkedIn:', error);
            toast.error(lang === 'pt' ? 'Erro ao publicar' : 'Error posting');
        } finally {
            setPosting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            {text.title}
                        </CardTitle>
                        <CardDescription>{text.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {text.connected}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!posted ? (
                    <>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                {text.customMessage}
                            </label>
                            <Textarea
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder={text.defaultMessage(article.title)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                        <Button 
                            onClick={handlePost}
                            disabled={posting}
                            className="w-full bg-[#0077B5] hover:bg-[#006399]"
                        >
                            {posting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {text.posting}
                                </>
                            ) : (
                                <>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    {text.post}
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="font-semibold text-green-900 mb-2">{text.posted}</p>
                        <Button
                            variant="outline"
                            onClick={() => window.open('https://www.linkedin.com/feed/', '_blank')}
                            className="gap-2"
                        >
                            {text.viewPost}
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}