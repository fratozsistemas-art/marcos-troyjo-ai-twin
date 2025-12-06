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

        const { goal, context } = await req.json();

        if (!goal) {
            return Response.json({ 
                error: 'Missing required field: goal' 
            }, { status: 400 });
        }

        const systemPrompt = `You are an expert task analyzer for a UI automation agent.

Your role is to:
1. Break down complex goals into clear, executable subtasks
2. Estimate the number of UI interaction steps needed
3. Estimate completion time based on typical UI interaction speeds
4. Identify potential challenges or blockers
5. Suggest optimal execution order

Context about the application:
- Digital Twin consultation platform
- Main screens: Home, Dashboard, Consultation
- Available actions: click elements, set input values, navigate, read UI state
- Each step takes ~2-3 seconds to execute

Provide analysis in structured JSON format.`;

        const response = await xai.chat.completions.create({
            model: 'grok-beta',
            messages: [
                { role: 'system', content: systemPrompt },
                { 
                    role: 'user', 
                    content: `Analyze this task and provide a breakdown:\n\nGoal: ${goal}\n\nContext: ${context || 'None provided'}` 
                }
            ],
            response_format: { type: 'json_object' },
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        return Response.json({
            success: true,
            analysis: {
                subtasks: analysis.subtasks || [],
                estimated_steps: analysis.estimated_steps || 5,
                estimated_duration_minutes: analysis.estimated_duration_minutes || 2,
                complexity: analysis.complexity || 'medium',
                challenges: analysis.challenges || [],
                recommendations: analysis.recommendations || []
            }
        });

    } catch (error) {
        console.error('Error in analyzeTask:', error);
        return Response.json({ 
            error: error.message || 'Failed to analyze task',
            success: false
        }, { status: 500 });
    }
});