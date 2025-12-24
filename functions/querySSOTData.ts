import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { query_type, filters = {}, include_related = true } = await req.json();

        if (!query_type) {
            return Response.json({ error: 'query_type is required' }, { status: 400 });
        }

        let results = {};

        switch (query_type) {
            case 'forums':
                results.forums = await base44.asServiceRole.entities.Forum.filter(
                    { active: true, ...filters },
                    '-created_date'
                );
                break;

            case 'events':
                results.events = await base44.asServiceRole.entities.Event.filter(
                    filters,
                    '-start_date'
                );
                
                // Incluir dados dos fóruns relacionados se solicitado
                if (include_related && results.events.length > 0) {
                    const forumIds = [...new Set(results.events.map(e => e.forum_id).filter(Boolean))];
                    if (forumIds.length > 0) {
                        results.related_forums = await base44.asServiceRole.entities.Forum.filter({
                            id: { $in: forumIds }
                        });
                    }
                }
                break;

            case 'actors':
                results.actors = await base44.asServiceRole.entities.KeyActor.filter(
                    { active: true, ...filters },
                    '-created_date'
                );
                break;

            case 'upcoming_events':
                // Eventos futuros
                const today = new Date().toISOString().split('T')[0];
                results.events = await base44.asServiceRole.entities.Event.filter({
                    start_date: { $gte: today },
                    status: { $in: ['scheduled', 'ongoing'] }
                }, 'start_date', 20);
                break;

            case 'recent_events':
                // Eventos recentes (últimos 6 meses)
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                results.events = await base44.asServiceRole.entities.Event.filter({
                    start_date: { $gte: sixMonthsAgo.toISOString().split('T')[0] }
                }, '-start_date', 20);
                break;

            case 'critical_actors':
                // Atores estratégicos críticos
                results.actors = await base44.asServiceRole.entities.KeyActor.filter({
                    active: true,
                    strategic_importance: { $in: ['critical', 'high'] }
                }, '-created_date');
                break;

            case 'all':
                // Retornar todos os dados (para uso em geração de conteúdo)
                const [forums, events, actors] = await Promise.all([
                    base44.asServiceRole.entities.Forum.filter({ active: true }, '-created_date', 50),
                    base44.asServiceRole.entities.Event.list('-start_date', 50),
                    base44.asServiceRole.entities.KeyActor.filter({ active: true }, '-created_date', 100)
                ]);
                
                results = { forums, events, actors };
                break;

            case 'search':
                // Busca por termo em todos os tipos
                const searchTerm = filters.search_term?.toLowerCase();
                if (!searchTerm) {
                    return Response.json({ error: 'search_term is required for search query' }, { status: 400 });
                }

                const [allForums, allEvents, allActors] = await Promise.all([
                    base44.asServiceRole.entities.Forum.filter({ active: true }),
                    base44.asServiceRole.entities.Event.list(),
                    base44.asServiceRole.entities.KeyActor.filter({ active: true })
                ]);

                results.forums = allForums.filter(f => 
                    f.name?.toLowerCase().includes(searchTerm) ||
                    f.acronym?.toLowerCase().includes(searchTerm) ||
                    f.description?.toLowerCase().includes(searchTerm)
                );

                results.events = allEvents.filter(e =>
                    e.name?.toLowerCase().includes(searchTerm) ||
                    e.description?.toLowerCase().includes(searchTerm)
                );

                results.actors = allActors.filter(a =>
                    a.name?.toLowerCase().includes(searchTerm) ||
                    a.acronym?.toLowerCase().includes(searchTerm) ||
                    a.full_name?.toLowerCase().includes(searchTerm) ||
                    a.role?.toLowerCase().includes(searchTerm)
                );
                break;

            default:
                return Response.json({ error: 'Invalid query_type' }, { status: 400 });
        }

        // Formatar para contexto de LLM
        const formatted_context = formatForLLM(results, query_type);

        return Response.json({
            query_type,
            results,
            formatted_context,
            count: {
                forums: results.forums?.length || 0,
                events: results.events?.length || 0,
                actors: results.actors?.length || 0
            }
        });

    } catch (error) {
        console.error('SSOT Query error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function formatForLLM(results, queryType) {
    let context = `# SSOT Data Context (${queryType})\n\n`;

    if (results.forums && results.forums.length > 0) {
        context += `## Fóruns (${results.forums.length})\n`;
        results.forums.forEach(forum => {
            context += `- **${forum.acronym || forum.name}** (${forum.type})\n`;
            if (forum.full_name) context += `  - Nome completo: ${forum.full_name}\n`;
            if (forum.established_year) context += `  - Criado em: ${forum.established_year}\n`;
            if (forum.headquarters) context += `  - Sede: ${forum.headquarters}\n`;
            if (forum.significance) context += `  - Importância: ${forum.significance}\n`;
        });
        context += '\n';
    }

    if (results.events && results.events.length > 0) {
        context += `## Eventos (${results.events.length})\n`;
        results.events.forEach(event => {
            context += `- **${event.name}** (${event.event_type})\n`;
            if (event.start_date) context += `  - Data: ${event.start_date}`;
            if (event.end_date) context += ` a ${event.end_date}`;
            context += '\n';
            if (event.location?.city) context += `  - Local: ${event.location.city}, ${event.location.country}\n`;
            if (event.status) context += `  - Status: ${event.status}\n`;
            if (event.significance) context += `  - Importância: ${event.significance}\n`;
        });
        context += '\n';
    }

    if (results.actors && results.actors.length > 0) {
        context += `## Atores Chave (${results.actors.length})\n`;
        results.actors.forEach(actor => {
            context += `- **${actor.acronym || actor.name}** (${actor.type})\n`;
            if (actor.full_name) context += `  - Nome completo: ${actor.full_name}\n`;
            if (actor.country) context += `  - País: ${actor.country}\n`;
            if (actor.role) context += `  - Papel: ${actor.role}\n`;
            if (actor.strategic_importance) context += `  - Importância: ${actor.strategic_importance}\n`;
        });
        context += '\n';
    }

    return context;
}