import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import OpenAI from 'npm:openai';

const xai = new OpenAI({
    apiKey: Deno.env.get("XAI_API_KEY"),
    baseURL: "https://api.x.ai/v1",
});

const ACTION_WHITELIST = {
    'Dashboard': ['click_element', 'navigate_to', 'set_value', 'get_element_content', 'read_ui_state'],
    'Consultation': ['click_element', 'navigate_to', 'set_value', 'get_element_content', 'read_ui_state'],
    'Home': ['click_element', 'navigate_to', 'get_element_content', 'read_ui_state'],
};

const CRITICAL_ACTIONS = [
    'btn_delete_conversation',
    'btn_send_message',
];

const tools = [
    {
        type: 'function',
        function: {
            name: 'get_element_content',
            description: 'Read and analyze the content of a UI element (text, value, state). Essential for understanding current UI state before taking actions.',
            parameters: {
                type: 'object',
                properties: {
                    element_id: { type: 'string', description: 'The data-ai-id of the element to read' },
                    reason: { type: 'string', description: 'Explain what information you need from this element' },
                },
                required: ['element_id', 'reason'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'read_ui_state',
            description: 'Get a comprehensive analysis of all visible UI elements and their current states. Use this to understand the full context.',
            parameters: {
                type: 'object',
                properties: {
                    focus_area: { 
                        type: 'string', 
                        description: 'Optional: specific area to focus on (e.g., "conversation list", "input field", "buttons")',
                        enum: ['all', 'interactive', 'content', 'navigation']
                    },
                    reason: { type: 'string', description: 'Explain what you are trying to understand' },
                },
                required: ['reason'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'click_element',
            description: 'Click on a UI element. Returns the new state after click. Use get_element_content first if you need to verify element state.',
            parameters: {
                type: 'object',
                properties: {
                    element_id: { type: 'string', description: 'The data-ai-id of the element to click' },
                    reason: { type: 'string', description: 'Explain why you are clicking this element' },
                    expect_state_change: { 
                        type: 'boolean', 
                        description: 'Whether you expect the UI state to change after this action',
                        default: true
                    },
                },
                required: ['element_id', 'reason'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'set_value',
            description: 'Set the value of an input field. Returns the new value and validation state. Use get_element_content first to check current value.',
            parameters: {
                type: 'object',
                properties: {
                    element_id: { type: 'string', description: 'The data-ai-id of the input element' },
                    value: { type: 'string', description: 'The value to set' },
                    reason: { type: 'string', description: 'Explain what you are trying to accomplish' },
                    verify_after: {
                        type: 'boolean',
                        description: 'Whether to verify the value was set correctly',
                        default: true
                    },
                },
                required: ['element_id', 'value', 'reason'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'navigate_to',
            description: 'Navigate to a different screen in the application. Returns the new screen state.',
            parameters: {
                type: 'object',
                properties: {
                    screen: { type: 'string', description: 'The screen name to navigate to (e.g., Dashboard, Consultation, Home)' },
                    reason: { type: 'string', description: 'Explain why navigating to this screen' },
                },
                required: ['screen', 'reason'],
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

        const { goal, ui_state, conversation_history, step_count = 0 } = await req.json();

        if (!goal || !ui_state) {
            return Response.json({ 
                error: 'Missing required fields: goal and ui_state' 
            }, { status: 400 });
        }

        const MAX_STEPS = 15;
        if (step_count >= MAX_STEPS) {
            return Response.json({
                type: 'max_steps_reached',
                explanation: `Maximum steps (${MAX_STEPS}) reached. Goal may require manual intervention.`,
                completed: true,
            });
        }

        const currentScreen = ui_state.screen || 'unknown';
        const allowedActions = ACTION_WHITELIST[currentScreen] || [];
        
        if (allowedActions.length === 0) {
            return Response.json({
                type: 'no_action',
                explanation: `No actions allowed on screen: ${currentScreen}`,
                completed: true,
            });
        }

        const systemPrompt = `You are an AI agent following the AG-UI (Agent-User Interaction) protocol to operate the Marcos Troyjo Digital Twin application UI.

OBJECTIVE: ${goal}

CURRENT UI STATE:
- Screen: ${ui_state.screen || 'unknown'}
- Available elements: ${ui_state.elements?.length || 0}
- Previous context: ${conversation_history?.length || 0} steps taken

AG-UI PROTOCOL RULES:
1. OBSERVE before acting: Use get_element_content or read_ui_state to understand current state
2. REASON about the UI: Analyze element states, content, and context before deciding actions
3. ACT with intention: Each action should have a clear purpose toward the goal
4. VERIFY results: Expect state changes and analyze outcomes
5. ITERATE intelligently: Use previous step results to inform next actions

AVAILABLE TOOLS (in order of recommendation):
- get_element_content: Read specific element's content/state (use FIRST for analysis)
- read_ui_state: Get comprehensive UI overview (use when you need context)
- click_element: Interact with buttons/links (use after verification)
- set_value: Input text into fields (verify current value first)
- navigate_to: Change screens (use when goal requires different view)

BEST PRACTICES:
- Start with observation tools (get_element_content/read_ui_state)
- Execute 1-3 actions per step (mix of read and write actions)
- Always provide clear reasoning for each action
- If blocked or uncertain, use read tools to gather more info
- Focus on goal completion efficiency

UI ELEMENTS AVAILABLE:
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

        const response = await xai.chat.completions.create({
            model: 'grok-beta',
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
            
            const requiresConfirmation = CRITICAL_ACTIONS.some(criticalId => 
                args.element_id?.includes(criticalId)
            );
            
            const isAllowed = allowedActions.includes(name);
            
            return { 
                name, 
                args,
                tool_call_id: toolCall.id,
                requires_confirmation: requiresConfirmation,
                is_allowed: isAllowed,
            };
        });

        const blockedActions = actions.filter(a => !a.is_allowed);
        if (blockedActions.length > 0) {
            return Response.json({
                type: 'blocked',
                explanation: `Actions blocked on ${currentScreen}: ${blockedActions.map(a => a.name).join(', ')}`,
                blocked_actions: blockedActions,
                completed: false,
            });
        }

        return Response.json({
            type: 'actions',
            actions,
            reasoning: message.content,
            completed: false,
            step_count: step_count + 1,
        });

    } catch (error) {
        console.error('Error in agentStep:', error);
        return Response.json({ 
            error: error.message || 'Failed to process agent step',
            type: 'error'
        }, { status: 500 });
    }
});