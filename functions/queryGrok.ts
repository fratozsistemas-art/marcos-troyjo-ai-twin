import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, model = 'grok-beta', response_format, max_tokens = 1000 } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const apiKey = Deno.env.get('XAI_API_KEY');
        
        if (!apiKey) {
            return Response.json({ 
                error: 'xAI API key not configured' 
            }, { status: 500 });
        }

        const requestBody = {
            model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens
        };

        // Add response_format if provided (for JSON mode)
        if (response_format) {
            requestBody.response_format = response_format;
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            return Response.json({ 
                error: `xAI API error: ${error.error?.message || 'Unknown error'}` 
            }, { status: response.status });
        }

        const data = await response.json();
        
        return Response.json({
            success: true,
            response: data.choices[0].message.content,
            usage: data.usage,
            model: data.model
        });

    } catch (error) {
        console.error('Error querying Grok:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});