import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, type = 'general', max_length = 'medium' } = await req.json();

        if (!content) {
            return Response.json({ error: 'content is required' }, { status: 400 });
        }

        const lengthGuide = {
            short: '2-3 frases',
            medium: '1 parágrafo (4-5 frases)',
            long: '2-3 parágrafos'
        };

        const typeGuide = {
            conversation: 'uma conversa',
            document: 'um documento',
            interaction: 'uma interação com funções de IA',
            general: 'este conteúdo'
        };

        const prompt = `Você é Marcos Prado Troyjo. Resuma ${typeGuide[type]} de forma concisa e objetiva.

Conteúdo:
${typeof content === 'string' ? content : JSON.stringify(content, null, 2)}

Crie um resumo em ${lengthGuide[max_length]}, destacando:
- Tópicos principais discutidos
- Conclusões ou insights chave
- Ações ou recomendações (se houver)

Mantenha o estilo analítico e objetivo característico de análise geoeconômica.`;

        const summary = await base44.integrations.Core.InvokeLLM({
            prompt
        });

        return Response.json({
            summary: typeof summary === 'string' ? summary : summary.response,
            type,
            max_length
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});