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

        const { context, learning_history_limit = 50 } = await req.json();

        // Fetch learning history
        const learningData = await base44.asServiceRole.entities.AgentLearning.list('-created_date', learning_history_limit);
        
        // Analyze patterns
        const successfulPatterns = learningData.filter(l => l.success);
        const failedPatterns = learningData.filter(l => !l.success);
        
        // Calculate success rates by action type
        const actionStats = {};
        learningData.forEach(l => {
            if (!actionStats[l.interaction_type]) {
                actionStats[l.interaction_type] = { total: 0, success: 0, avg_time: 0 };
            }
            actionStats[l.interaction_type].total++;
            if (l.success) actionStats[l.interaction_type].success++;
            actionStats[l.interaction_type].avg_time += (l.execution_time_ms || 0);
        });

        Object.keys(actionStats).forEach(key => {
            const stats = actionStats[key];
            stats.success_rate = (stats.success / stats.total) * 100;
            stats.avg_time = stats.avg_time / stats.total;
        });

        // Use AI to generate insights and predictions
        const systemPrompt = `You are an AI learning system analyzing UI interaction patterns.

Your role:
1. Identify common successful patterns
2. Identify failure patterns and root causes
3. Predict likely next actions based on context
4. Suggest proactive optimizations
5. Detect potential bottlenecks

Provide actionable insights in JSON format.`;

        const response = await xai.chat.completions.create({
            model: 'grok-beta',
            messages: [
                { role: 'system', content: systemPrompt },
                { 
                    role: 'user', 
                    content: `Analyze these patterns and provide insights:

Action Statistics:
${JSON.stringify(actionStats, null, 2)}

Recent Successful Patterns:
${JSON.stringify(successfulPatterns.slice(0, 10), null, 2)}

Recent Failed Patterns:
${JSON.stringify(failedPatterns.slice(0, 10), null, 2)}

Current Context: ${context || 'None'}

Provide:
1. Top 3 most efficient action sequences
2. Top 3 common failure causes
3. Predicted next actions (likelihood scores)
4. Proactive suggestions for optimization
5. Potential bottlenecks to monitor`
                }
            ],
            response_format: { type: 'json_object' },
        });

        const insights = JSON.parse(response.choices[0].message.content);

        return Response.json({
            success: true,
            action_statistics: actionStats,
            insights,
            data_points: learningData.length,
            success_rate_overall: ((successfulPatterns.length / learningData.length) * 100).toFixed(2)
        });

    } catch (error) {
        console.error('Error in analyzePatterns:', error);
        return Response.json({ 
            error: error.message || 'Failed to analyze patterns',
            success: false
        }, { status: 500 });
    }
});