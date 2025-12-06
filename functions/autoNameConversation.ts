import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const xai = new OpenAI({
    apiKey: Deno.env.get("XAI_API_KEY"),
    baseURL: "https://api.x.ai/v1",
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_id } = await req.json();

        if (!conversation_id) {
            return Response.json({ error: 'conversation_id required' }, { status: 400 });
        }

        const conversation = await base44.agents.getConversation(conversation_id);

        if (!conversation || !conversation.messages || conversation.messages.length === 0) {
            return Response.json({ error: 'No messages in conversation' }, { status: 400 });
        }

        const firstMessages = conversation.messages.slice(0, 6).map(m => 
            `${m.role}: ${m.content?.substring(0, 200) || ''}`
        ).join('\n');

        const response = await xai.chat.completions.create({
            model: 'grok-beta',
            messages: [{
                role: 'user',
                content: `Based on this conversation excerpt, generate a concise, descriptive title in the same language as the conversation. Maximum 5 words. Respond with ONLY the title, no quotes or formatting:\n\n${firstMessages}`
            }],
            max_tokens: 30,
            temperature: 0.5,
        });

        const name = response.choices[0].message.content
            .trim()
            .replace(/^["'`]|["'`]$/g, '')
            .replace(/^#+\s*/, '')
            .substring(0, 60);

        await base44.asServiceRole.agents.updateConversation(conversation_id, {
            metadata: {
                ...conversation.metadata,
                name,
            }
        });

        return Response.json({ name });

    } catch (error) {
        console.error('Error auto-naming conversation:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});