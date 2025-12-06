import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

const tools = [
    {
        type: 'function',
        function: {
            name: 'click_element',
            description: 'Click on a UI element identified by element_id',
            parameters: {
                type: 'object',
                properties: {
                    element_id: { type: 'string', description: 'The data-ai-id of the element to click' },
                },
                required: ['element_id'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'set_value',
            description: 'Set the value of a text input or textarea field',
            parameters: {
                type: 'object',
                properties: {
                    element_id: { type: 'string', description: 'The data-ai-id of the input element' },
                    value: { type: 'string', description: 'The value to set' },
                },
                required: ['element_id', 'value'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'navigate_to',
            description: 'Navigate to a different screen in the application',
            parameters: {
                type: 'object',
                properties: {
                    screen: { type: 'string', description: 'The screen name to navigate to (e.g., Dashboard, Consultation, Home)' },
                },
                required: ['screen'],
            },
        },
    },
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { goal, ui_state, conversation_history } = await req.json();

        if (!goal || !ui_state) {
            return Response.json({ 
                error: 'Missing required fields: goal and ui_state' 
            }, { status: 400 });
        }

        const systemPrompt = `You are an AI agent that operates the Marcos Troyjo Digital Twin application UI.

Your objective: ${goal}

Current UI state:
- Screen: ${ui_state.screen || 'unknown'}
- Available elements: ${ui_state.elements?.length || 0}

Rules:
1. You can ONLY interact with elements that have a data-ai-id in the UI state
2. Use the tools available: click_element, set_value, navigate_to
3. Be deterministic: execute 1-3 actions per step
4. If you cannot complete the goal with available elements, explain why
5. Focus on efficiency - don't take unnecessary actions

UI Elements:
${JSON.stringify(ui_state.elements, null, 2)}`;

        const messages = [
            { role: 'system', content: systemPrompt },
        ];

        if (conversation_history && Array.isArray(conversation_history)) {
            messages.push(...conversation_history);
        }

        messages.push({
            role: 'user',
            content: `Execute actions to achieve the goal: "${goal}"\n\nCurrent UI state:\n${JSON.stringify(ui_state, null, 2)}`
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            tools,
            tool_choice: 'auto',
        });

        const message = response.choices[0].message;

        if (!message.tool_calls || message.tool_calls.length === 0) {
            return Response.json({
                type: 'no_action',
                explanation: message.content,
                completed: true,
            });
        }

        const actions = message.tool_calls.map((toolCall) => {
            const { name, arguments: argsStr } = toolCall.function;
            const args = JSON.parse(argsStr || '{}');
            return { 
                name, 
                args,
                tool_call_id: toolCall.id 
            };
        });

        return Response.json({
            type: 'actions',
            actions,
            reasoning: message.content,
            completed: false,
        });

    } catch (error) {
        console.error('Error in agentStep:', error);
        return Response.json({ 
            error: error.message || 'Failed to process agent step',
            type: 'error'
        }, { status: 500 });
    }
});