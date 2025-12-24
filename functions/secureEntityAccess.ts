import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Entidades que devem ser filtradas por usuário
const PRIVATE_ENTITIES = [
    'AgentInteractionLog',
    'Feedback',
    'AIHistory',
    'CustomAgentPersona',
    'UserProfile',
    'PersonaPreferences',
    'ScheduledReport',
    'Insight',
    'Project',
    'AgentTask',
    'AgentLearning',
    'UIAnomaly',
    'SavedDashboard',
    'DashboardLayout',
    'UserNotification',
    'Subscription',
    'PersonaInteractionHistory',
    'AlertConfiguration',
    'AccessLog',
    'MLAuditLog',
    'MLPermission'
];

// Entidades públicas (acessíveis a todos usuários autenticados)
const PUBLIC_ENTITIES = [
    'Publication',
    'Book',
    'Award',
    'Forum',
    'Event',
    'KeyActor',
    'Vocabulary',
    'ConceptEvolution',
    'Document',
    'Article',
    'TimelineEvent',
    'GeopoliticalRisk',
    'CorporateFact',
    'ExternalDataSource',
    'KnowledgeEntry',
    'AlertFeed'
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { entity_name, operation, query = {}, data = {}, id } = await req.json();

        if (!entity_name || !operation) {
            return Response.json({ error: 'Missing entity_name or operation' }, { status: 400 });
        }

        // Verificar se entidade é privada e forçar filtro por usuário
        if (PRIVATE_ENTITIES.includes(entity_name)) {
            // Sempre adicionar filtro de user_email ou created_by
            if (operation === 'list' || operation === 'filter') {
                // Para listagens, forçar filtro por email do usuário
                if (!query.user_email && !query.created_by) {
                    query.user_email = user.email;
                } else {
                    // Se já tem filtro, validar que é do próprio usuário
                    if (query.user_email && query.user_email !== user.email) {
                        return Response.json({ error: 'Forbidden: Cannot access other users data' }, { status: 403 });
                    }
                    if (query.created_by && query.created_by !== user.email) {
                        return Response.json({ error: 'Forbidden: Cannot access other users data' }, { status: 403 });
                    }
                }
            }

            if (operation === 'get' && id) {
                // Para get, verificar se o registro pertence ao usuário
                const record = await base44.asServiceRole.entities[entity_name].get(id);
                if (!record) {
                    return Response.json({ error: 'Not found' }, { status: 404 });
                }
                if (record.user_email !== user.email && record.created_by !== user.email) {
                    return Response.json({ error: 'Forbidden: Cannot access other users data' }, { status: 403 });
                }
            }

            if (operation === 'create') {
                // Adicionar user_email automaticamente em criações
                data.user_email = user.email;
            }

            if ((operation === 'update' || operation === 'delete') && id) {
                // Para update/delete, verificar ownership
                const record = await base44.asServiceRole.entities[entity_name].get(id);
                if (!record) {
                    return Response.json({ error: 'Not found' }, { status: 404 });
                }
                if (record.user_email !== user.email && record.created_by !== user.email) {
                    return Response.json({ error: 'Forbidden: Cannot modify other users data' }, { status: 403 });
                }
            }
        }

        // Executar operação
        let result;
        switch (operation) {
            case 'list':
                result = await base44.entities[entity_name].list();
                break;
            case 'filter':
                result = await base44.entities[entity_name].filter(query);
                break;
            case 'get':
                result = await base44.entities[entity_name].get(id);
                break;
            case 'create':
                result = await base44.entities[entity_name].create(data);
                break;
            case 'update':
                result = await base44.entities[entity_name].update(id, data);
                break;
            case 'delete':
                result = await base44.entities[entity_name].delete(id);
                break;
            default:
                return Response.json({ error: 'Invalid operation' }, { status: 400 });
        }

        return Response.json({ success: true, data: result });

    } catch (error) {
        console.error('Security middleware error:', error);
        return Response.json({ 
            error: error.message || 'Internal server error',
            details: error.toString()
        }, { status: 500 });
    }
});