import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { query, context } = await req.json();

        if (!query) {
            return Response.json({ error: 'Query required' }, { status: 400 });
        }

        // Get high and critical severity risks
        const risks = await base44.asServiceRole.entities.GeopoliticalRisk.filter({
            active: true
        });

        const highPriorityRisks = risks.filter(r => 
            r.severity === 'high' || r.severity === 'critical'
        );

        // Use LLM to match relevant risks to query
        const prompt = `Query do usuário: "${query}"
${context ? `Contexto adicional: ${context}` : ''}

Riscos geopolíticos ativos (alta/crítica severidade):
${JSON.stringify(highPriorityRisks.map(r => ({
    title: r.title,
    region: r.region,
    risk_type: r.risk_type,
    severity: r.severity,
    summary: r.summary
})), null, 2)}

Identifique quais riscos são DIRETAMENTE relevantes para esta query.
Retorne apenas riscos que devem ser mencionados na resposta.`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    relevant_risks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                risk_id: { type: "string" },
                                relevance: { type: "string" },
                                suggested_integration: { type: "string" }
                            }
                        }
                    },
                    context_adjustment: {
                        type: "string"
                    }
                }
            }
        });

        // Get full risk details
        const relevantRiskDetails = result.relevant_risks.map(rr => {
            const risk = highPriorityRisks.find(r => r.id === rr.risk_id);
            return risk ? { ...risk, ...rr } : null;
        }).filter(Boolean);

        return Response.json({
            relevant_risks: relevantRiskDetails,
            context_adjustment: result.context_adjustment,
            total_active_risks: highPriorityRisks.length
        });

    } catch (error) {
        console.error('Error getting risk alerts:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});