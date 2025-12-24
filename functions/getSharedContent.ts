import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { share_token } = await req.json();

        if (!share_token) {
            return Response.json({ error: 'Share token required' }, { status: 400 });
        }

        // Buscar conteúdo compartilhado
        const sharedContents = await base44.asServiceRole.entities.SharedContent.filter({
            share_token,
            active: true
        });

        if (sharedContents.length === 0) {
            return Response.json({ error: 'Shared content not found' }, { status: 404 });
        }

        const sharedContent = sharedContents[0];

        // Verificar expiração
        if (sharedContent.expiration_date) {
            const expirationDate = new Date(sharedContent.expiration_date);
            if (expirationDate < new Date()) {
                return Response.json({ error: 'Share link expired' }, { status: 410 });
            }
        }

        // Verificar permissões se necessário
        const currentUser = await base44.auth.me().catch(() => null);
        
        if (sharedContent.share_type === 'specific_users') {
            if (!currentUser || !sharedContent.allowed_users.includes(currentUser.email)) {
                return Response.json({ error: 'Access denied' }, { status: 403 });
            }
        }

        // Incrementar contador de acesso
        await base44.asServiceRole.entities.SharedContent.update(sharedContent.id, {
            access_count: (sharedContent.access_count || 0) + 1,
            last_accessed: new Date().toISOString()
        });

        return Response.json({
            success: true,
            content: sharedContent.content_snapshot,
            metadata: {
                title: sharedContent.content_title,
                type: sharedContent.content_type,
                owner: sharedContent.owner_email,
                shared_date: sharedContent.created_date,
                permissions: sharedContent.permissions
            }
        });

    } catch (error) {
        console.error('Error getting shared content:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});