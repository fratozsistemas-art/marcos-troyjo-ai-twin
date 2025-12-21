import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, context = '' } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const workflow = {
            steps: [],
            final_answer: null
        };

        // Step 1: Base44 generates initial answer
        workflow.steps.push({ step: 1, model: 'Base44', status: 'processing' });
        
        const base44Response = await base44.integrations.Core.InvokeLLM({
            prompt: `${context ? `Context: ${context}\n\n` : ''}Question: ${prompt}\n\nProvide a comprehensive answer based on your knowledge.`
        });
        
        workflow.steps[0].status = 'completed';
        workflow.steps[0].response = typeof base44Response === 'string' ? base44Response : base44Response.response || JSON.stringify(base44Response);

        // Step 2: Grok validates data and assumptions
        workflow.steps.push({ step: 2, model: 'Grok', status: 'processing' });
        
        const grokApiKey = Deno.env.get('XAI_API_KEY');
        if (!grokApiKey) {
            workflow.steps[1].status = 'skipped';
            workflow.steps[1].error = 'XAI API key not configured';
        } else {
            const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${grokApiKey}`
                },
                body: JSON.stringify({
                    model: 'grok-beta',
                    messages: [
                        {
                            role: 'user',
                            content: `Original question: ${prompt}

Initial answer provided:
${workflow.steps[0].response}

Task: Validate the data, facts, and assumptions in this answer. Point out any errors, inconsistencies, or areas that need clarification. Provide corrections where needed.`
                        }
                    ],
                    max_tokens: 1500
                })
            });

            if (grokResponse.ok) {
                const grokData = await grokResponse.json();
                workflow.steps[1].status = 'completed';
                workflow.steps[1].response = grokData.choices[0].message.content;
                workflow.steps[1].usage = grokData.usage;
            } else {
                workflow.steps[1].status = 'error';
                workflow.steps[1].error = await grokResponse.text();
            }
        }

        // Step 3: ChatGPT reasons, reconciles, and polishes
        workflow.steps.push({ step: 3, model: 'ChatGPT', status: 'processing' });
        
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            workflow.steps[2].status = 'skipped';
            workflow.steps[2].error = 'OpenAI API key not configured';
        } else {
            const grokValidation = workflow.steps[1].status === 'completed' 
                ? workflow.steps[1].response 
                : 'No validation available';

            const chatgptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'user',
                            content: `Original question: ${prompt}

Initial answer:
${workflow.steps[0].response}

Validation feedback:
${grokValidation}

Task: Based on the initial answer and validation feedback, provide a final, polished, and well-reasoned response. Reconcile any contradictions, incorporate corrections, and ensure clarity and accuracy. This is the final answer that will be presented to the user.`
                        }
                    ],
                    max_tokens: 2000
                })
            });

            if (chatgptResponse.ok) {
                const chatgptData = await chatgptResponse.json();
                workflow.steps[2].status = 'completed';
                workflow.steps[2].response = chatgptData.choices[0].message.content;
                workflow.steps[2].usage = chatgptData.usage;
                workflow.final_answer = chatgptData.choices[0].message.content;
            } else {
                workflow.steps[2].status = 'error';
                workflow.steps[2].error = await chatgptResponse.text();
            }
        }

        // If ChatGPT failed, use Base44 answer as fallback
        if (!workflow.final_answer) {
            workflow.final_answer = workflow.steps[0].response;
        }

        return Response.json({
            success: true,
            workflow: workflow,
            total_steps: workflow.steps.length,
            completed_steps: workflow.steps.filter(s => s.status === 'completed').length
        });

    } catch (error) {
        console.error('Error in multi-model workflow:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});