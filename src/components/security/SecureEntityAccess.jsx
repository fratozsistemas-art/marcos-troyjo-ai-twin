import { base44 } from '@/api/base44Client';

// Entidades que devem usar acesso seguro
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

/**
 * Wrapper seguro para acesso a entidades privadas
 * Usa função backend que valida ownership
 */
export const secureEntity = {
    /**
     * Lista todos os registros do usuário
     */
    list: async (entityName) => {
        if (!PRIVATE_ENTITIES.includes(entityName)) {
            return base44.entities[entityName].list();
        }
        
        const response = await base44.functions.invoke('secureEntityAccess', {
            entity_name: entityName,
            operation: 'list'
        });
        return response.data?.data || [];
    },

    /**
     * Filtra registros do usuário
     */
    filter: async (entityName, query = {}) => {
        if (!PRIVATE_ENTITIES.includes(entityName)) {
            return base44.entities[entityName].filter(query);
        }
        
        const response = await base44.functions.invoke('secureEntityAccess', {
            entity_name: entityName,
            operation: 'filter',
            query
        });
        return response.data?.data || [];
    },

    /**
     * Busca um registro específico (valida ownership)
     */
    get: async (entityName, id) => {
        if (!PRIVATE_ENTITIES.includes(entityName)) {
            return base44.entities[entityName].get(id);
        }
        
        const response = await base44.functions.invoke('secureEntityAccess', {
            entity_name: entityName,
            operation: 'get',
            id
        });
        return response.data?.data || null;
    },

    /**
     * Cria novo registro (adiciona user_email automaticamente)
     */
    create: async (entityName, data) => {
        if (!PRIVATE_ENTITIES.includes(entityName)) {
            return base44.entities[entityName].create(data);
        }
        
        const response = await base44.functions.invoke('secureEntityAccess', {
            entity_name: entityName,
            operation: 'create',
            data
        });
        return response.data?.data || null;
    },

    /**
     * Atualiza registro (valida ownership)
     */
    update: async (entityName, id, data) => {
        if (!PRIVATE_ENTITIES.includes(entityName)) {
            return base44.entities[entityName].update(id, data);
        }
        
        const response = await base44.functions.invoke('secureEntityAccess', {
            entity_name: entityName,
            operation: 'update',
            id,
            data
        });
        return response.data?.data || null;
    },

    /**
     * Deleta registro (valida ownership)
     */
    delete: async (entityName, id) => {
        if (!PRIVATE_ENTITIES.includes(entityName)) {
            return base44.entities[entityName].delete(id);
        }
        
        const response = await base44.functions.invoke('secureEntityAccess', {
            entity_name: entityName,
            operation: 'delete',
            id
        });
        return response.data?.data || null;
    }
};

/**
 * Hook para uso em componentes React
 */
export const useSecureEntity = (entityName) => {
    return {
        list: () => secureEntity.list(entityName),
        filter: (query) => secureEntity.filter(entityName, query),
        get: (id) => secureEntity.get(entityName, id),
        create: (data) => secureEntity.create(entityName, data),
        update: (id, data) => secureEntity.update(entityName, id, data),
        delete: (id) => secureEntity.delete(entityName, id)
    };
};