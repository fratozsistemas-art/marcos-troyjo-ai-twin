import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { checkRateLimit } from './utils/rateLimiter.js';
import { logAccess } from './utils/accessControl.js';
import { watermarkContent } from './utils/watermark.js';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const rateCheck = checkRateLimit(user.email, 'generateSummary');
        if (!rateCheck.allowed) {
            return Response.json({ 
                error: 'Rate limit exceeded',
                retryAfter: rateCheck.retryAfter 
            }, { status: 429 });
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

        // Log access
        await logAccess(req, 'export', 'conversation', conversation_id, {
            action: 'generate_summary'
        });

        // Watermark the summary
        const watermarked = await watermarkContent(req, response, 'conversation_summary');

        return Response.json({ 
            summary: watermarked.content
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});