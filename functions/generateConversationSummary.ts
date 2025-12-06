import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_id } = await req.json();

        if (!conversation_id) {
            return Response.json({ 
                error: 'Conversation ID is required' 
            }, { status: 400 });
        }

        // Get conversation
        const conversation = await base44.agents.getConversation(conversation_id);
        
        if (!conversation || !conversation.messages) {
            return Response.json({ 
                error: 'Conversation not found' 
            }, { status: 404 });
        }

        // Extract only user and assistant messages
        const messages = conversation.messages
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Troyjo'}: ${msg.content}`)
            .join('\n\n');

        const prompt = `Você é um assistente especializado em resumir conversas. Analise a conversa abaixo e gere um resumo conciso e informativo.

CONVERSA:
${messages}

INSTRUÇÕES:
1. Crie um resumo de 2-3 frases capturando os principais tópicos discutidos
2. Foque nos pontos-chave e conclusões importantes
3. Mantenha o tom profissional e objetivo
4. Use linguagem clara e direta

Gere apenas o resumo, sem introduções ou conclusões adicionais.`;

        const response = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false
        });

        return Response.json({ 
            summary: response
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});