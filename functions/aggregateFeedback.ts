import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
        }

        // Get all unaggregated feedback
        const feedbacks = await base44.asServiceRole.entities.Feedback.filter({
            aggregated: false
        });

        if (feedbacks.length === 0) {
            return Response.json({
                message: 'No new feedback to aggregate',
                insights: []
            });
        }

        // Aggregate by persona mode
        const byPersonaMode = {};
        const byRagUsage = { with_rag: [], without_rag: [] };
        const lowRatedMessages = [];
        const commonSuggestions = {};

        for (const fb of feedbacks) {
            // By persona mode
            const mode = fb.context?.persona_mode || 'unknown';
            if (!byPersonaMode[mode]) {
                byPersonaMode[mode] = { count: 0, avgRatings: {}, feedbacks: [] };
            }
            byPersonaMode[mode].count++;
            byPersonaMode[mode].feedbacks.push(fb);

            // Average ratings
            Object.entries(fb.ratings || {}).forEach(([key, value]) => {
                if (!byPersonaMode[mode].avgRatings[key]) {
                    byPersonaMode[mode].avgRatings[key] = [];
                }
                byPersonaMode[mode].avgRatings[key].push(value);
            });

            // By RAG usage
            if (fb.context?.used_rag) {
                byRagUsage.with_rag.push(fb);
            } else {
                byRagUsage.without_rag.push(fb);
            }

            // Low rated
            const avgRating = Object.values(fb.ratings || {}).reduce((a, b) => a + b, 0) / 
                             Object.values(fb.ratings || {}).length;
            if (avgRating < 3) {
                lowRatedMessages.push({
                    id: fb.id,
                    conversation_id: fb.conversation_id,
                    avgRating,
                    feedback: fb.text_feedback,
                    context: fb.context
                });
            }

            // Common suggestions
            if (fb.text_feedback) {
                const words = fb.text_feedback.toLowerCase().split(' ');
                words.forEach(word => {
                    if (word.length > 4) {
                        commonSuggestions[word] = (commonSuggestions[word] || 0) + 1;
                    }
                });
            }
        }

        // Calculate averages
        for (const mode in byPersonaMode) {
            for (const ratingKey in byPersonaMode[mode].avgRatings) {
                const values = byPersonaMode[mode].avgRatings[ratingKey];
                byPersonaMode[mode].avgRatings[ratingKey] = 
                    values.reduce((a, b) => a + b, 0) / values.length;
            }
        }

        // RAG comparison
        const ragComparison = {
            with_rag: {
                count: byRagUsage.with_rag.length,
                avgRatings: calculateAvgRatings(byRagUsage.with_rag)
            },
            without_rag: {
                count: byRagUsage.without_rag.length,
                avgRatings: calculateAvgRatings(byRagUsage.without_rag)
            }
        };

        // Top suggestions
        const topSuggestions = Object.entries(commonSuggestions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));

        // Create Insight entry
        const insight = await base44.asServiceRole.entities.Insight.create({
            type: 'feedback_aggregation',
            title: 'Agregação de Feedback do Modelo Mental v2.4',
            description: `Análise de ${feedbacks.length} feedbacks coletados`,
            data: {
                total_feedbacks: feedbacks.length,
                by_persona_mode: byPersonaMode,
                rag_comparison: ragComparison,
                low_rated_messages: lowRatedMessages.slice(0, 10),
                top_suggestions: topSuggestions,
                timestamp: new Date().toISOString()
            },
            severity: lowRatedMessages.length > feedbacks.length * 0.2 ? 'high' : 'medium',
            actionable: lowRatedMessages.length > 0
        });

        // Mark feedbacks as aggregated
        for (const fb of feedbacks) {
            await base44.asServiceRole.entities.Feedback.update(fb.id, {
                aggregated: true
            });
        }

        // Generate recommendations
        const recommendations = [];
        
        // Persona mode recommendations
        for (const [mode, data] of Object.entries(byPersonaMode)) {
            if (data.avgRatings.usefulness && data.avgRatings.usefulness < 3.5) {
                recommendations.push({
                    type: 'persona_adjustment',
                    mode,
                    issue: 'Baixa utilidade percebida',
                    suggestion: `Revisar persona ${mode}: usuários reportam baixa utilidade (${data.avgRatings.usefulness.toFixed(1)}/5)`
                });
            }
            if (data.avgRatings.tone && data.avgRatings.tone < 3.5) {
                recommendations.push({
                    type: 'tone_adjustment',
                    mode,
                    issue: 'Tom inadequado',
                    suggestion: `Ajustar tom da persona ${mode}: usuários reportam insatisfação (${data.avgRatings.tone.toFixed(1)}/5)`
                });
            }
        }

        // RAG recommendations
        if (ragComparison.with_rag.count > 0 && 
            ragComparison.with_rag.avgRatings.rag_quality < 3.5) {
            recommendations.push({
                type: 'rag_quality',
                issue: 'Qualidade das citações RAG baixa',
                suggestion: 'Revisar estratégia de chunking e relevância de citações'
            });
        }

        return Response.json({
            success: true,
            processed: feedbacks.length,
            insight_id: insight.id,
            summary: {
                total: feedbacks.length,
                by_persona: Object.keys(byPersonaMode).map(mode => ({
                    mode,
                    count: byPersonaMode[mode].count,
                    avg_usefulness: byPersonaMode[mode].avgRatings.usefulness?.toFixed(2)
                })),
                rag_comparison: {
                    with_rag_avg: ragComparison.with_rag.avgRatings.usefulness?.toFixed(2),
                    without_rag_avg: ragComparison.without_rag.avgRatings.usefulness?.toFixed(2)
                },
                low_rated_count: lowRatedMessages.length
            },
            recommendations
        });

    } catch (error) {
        console.error('Error aggregating feedback:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

function calculateAvgRatings(feedbacks) {
    if (feedbacks.length === 0) return {};
    
    const allRatings = {};
    feedbacks.forEach(fb => {
        Object.entries(fb.ratings || {}).forEach(([key, value]) => {
            if (!allRatings[key]) allRatings[key] = [];
            allRatings[key].push(value);
        });
    });

    const avgRatings = {};
    for (const [key, values] of Object.entries(allRatings)) {
        avgRatings[key] = values.reduce((a, b) => a + b, 0) / values.length;
    }
    return avgRatings;
}