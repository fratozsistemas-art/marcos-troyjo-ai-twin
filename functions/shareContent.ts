import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            content_type, 
            content_id, 
            share_type, 
            allowed_users, 
            permissions,
            expiration_days 
        } = await req.json();

        // Validar entrada
        if (!content_type || !content_id || !share_type) {
            return Response.json({ 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        // Buscar o conteúdo original
        let contentSnapshot = {};
        let contentTitle = '';

        if (content_type === 'conversation') {
            const conversation = await base44.agents.getConversation(content_id);
            contentTitle = conversation.metadata?.name || 'Conversa';
            contentSnapshot = {
                messages: conversation.messages,
                metadata: conversation.metadata
            };
        }

        // Gerar token único para compartilhamento
        const shareToken = crypto.randomUUID();

        // Calcular data de expiração
        const expirationDate = expiration_days 
            ? new Date(Date.now() + expiration_days * 24 * 60 * 60 * 1000).toISOString()
            : null;

        // Criar registro de compartilhamento
        const sharedContent = await base44.asServiceRole.entities.SharedContent.create({
            owner_email: user.email,
            content_type,
            content_id,
            content_title: contentTitle,
            content_snapshot: contentSnapshot,
            share_type,
            share_token: shareToken,
            allowed_users: allowed_users || [],
            permissions: permissions || { can_view: true, can_comment: false },
            expiration_date: expirationDate,
            active: true
        });

        // Gerar URL de compartilhamento
        const shareUrl = `${req.headers.get('origin')}/shared/${shareToken}`;

        return Response.json({
            success: true,
            share_id: sharedContent.id,
            share_url: shareUrl,
            share_token: shareToken,
            expires_at: expirationDate
        });

    } catch (error) {
        console.error('Error sharing content:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});