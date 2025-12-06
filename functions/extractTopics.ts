import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai@4.72.0';

const client = new OpenAI({
    apiKey: Deno.env.get('XAI_API_KEY'),
    baseURL: 'https://api.x.ai/v1'
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_messages } = await req.json();

        if (!conversation_messages || !Array.isArray(conversation_messages)) {
            return Response.json({ error: 'Conversation messages required' }, { status: 400 });
        }

        const conversationText = conversation_messages
            .map(m => `${m.role}: ${m.content}`)
            .join('\n\n');

        const response = await client.chat.completions.create({
            model: 'grok-2-1212',
            messages: [{
                role: 'system',
                content: `Você é um analisador de tópicos especializado em economia internacional, comércio e diplomacia econômica.

Analise a conversa fornecida e extraia:
1. Os 3-5 principais tópicos discutidos
2. Subtópicos relevantes
3. Áreas de interesse do usuário (indústrias, regiões, teorias)

Retorne um JSON estruturado.`
            }, {
                role: 'user',
                content: `Analise esta conversa e extraia os tópicos principais:\n\n${conversationText}`
            }],
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'topic_extraction',
                    strict: true,
                    schema: {
                        type: 'object',
                        properties: {
                            main_topics: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            industries_mentioned: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            regions_mentioned: {
                                type: 'array',
                                items: { type: 'string' }
                            },
                            economic_concepts: {
                                type: 'array',
                                items: { type: 'string' }
                            }
                        },
                        required: ['main_topics', 'industries_mentioned', 'regions_mentioned', 'economic_concepts'],
                        additionalProperties: false
                    }
                }
            }
        });

        const extracted = JSON.parse(response.choices[0].message.content);

        return Response.json(extracted);

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});