import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fact_id, fact_data } = await req.json();

        if (!fact_data) {
            return Response.json({ error: 'fact_data is required' }, { status: 400 });
        }

        // Get all existing facts for comparison
        const allFacts = await base44.asServiceRole.entities.StrategicFact.list();
        const relatedFacts = allFacts.filter(f => 
            f.fact_id !== fact_id && (
                f.topic_id === fact_data.topic_id ||
                (f.tags || []).some(tag => (fact_data.tags || []).includes(tag))
            )
        );

        // Build AI validation prompt
        const validationPrompt = `You are a strategic fact validator for a geopolitical knowledge base. Analyze the following fact for validity, contradictions, and potential biases.

NEW/UPDATED FACT:
ID: ${fact_data.fact_id}
Topic: ${fact_data.topic_label}
Type: ${fact_data.fact_type}
Summary: ${fact_data.summary}
Detail: ${fact_data.detail}
Source Type: ${fact_data.source_type}
Source Reference: ${fact_data.source_ref}
Confidence: ${fact_data.confidence}
Status: ${fact_data.fact_status}
Tags: ${(fact_data.tags || []).join(', ')}

RELATED EXISTING FACTS:
${relatedFacts.slice(0, 10).map((f, idx) => `
${idx + 1}. [${f.fact_id}]
   Summary: ${f.summary}
   Source: ${f.source_type}
   Confidence: ${f.confidence}
   Status: ${f.fact_status}
`).join('\n')}

Analyze the new fact and provide:
1. Contradiction Analysis: Identify any direct contradictions with existing facts
2. Bias Assessment: Evaluate potential biases based on source type and content
3. Confidence Recommendation: Suggest whether the confidence score should be adjusted
4. Validity Issues: Flag any logical inconsistencies or questionable claims
5. Source Credibility: Assess the reliability of the source type

Consider:
- Source hierarchy: primary_law_or_treaty > official_government_doc > official_international_org > reputable_media > aggregated_statistics > model_inference > user_assertion
- Temporal consistency: newer facts may supersede older ones
- Geographic/topic context
- Cross-referencing with multiple sources

Return a structured analysis with actionable recommendations.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: validationPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    is_valid: {
                        type: "boolean",
                        description: "Overall validity assessment"
                    },
                    contradictions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                conflicting_fact_id: { type: "string" },
                                description: { type: "string" },
                                severity: { type: "string", enum: ["low", "medium", "high", "critical"] }
                            }
                        }
                    },
                    bias_analysis: {
                        type: "object",
                        properties: {
                            detected_biases: { type: "array", items: { type: "string" } },
                            bias_score: { type: "number" },
                            explanation: { type: "string" }
                        }
                    },
                    confidence_recommendation: {
                        type: "object",
                        properties: {
                            suggested_confidence: { type: "number" },
                            adjustment_reason: { type: "string" }
                        }
                    },
                    validity_issues: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                issue: { type: "string" },
                                severity: { type: "string", enum: ["low", "medium", "high"] }
                            }
                        }
                    },
                    source_credibility: {
                        type: "object",
                        properties: {
                            score: { type: "number" },
                            assessment: { type: "string" }
                        }
                    },
                    recommendations: {
                        type: "array",
                        items: { type: "string" }
                    },
                    overall_assessment: {
                        type: "string"
                    }
                }
            }
        });

        // Calculate risk score
        const riskScore = calculateRiskScore(aiResponse);

        return Response.json({
            fact_id: fact_id,
            validation: aiResponse,
            risk_score: riskScore,
            timestamp: new Date().toISOString(),
            validator: user.email
        });

    } catch (error) {
        console.error('Error validating fact:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function calculateRiskScore(validation) {
    let score = 0;

    // Contradictions weight
    if (validation.contradictions?.length > 0) {
        const criticalCount = validation.contradictions.filter(c => c.severity === 'critical').length;
        const highCount = validation.contradictions.filter(c => c.severity === 'high').length;
        score += criticalCount * 40 + highCount * 25;
    }

    // Bias weight
    if (validation.bias_analysis?.bias_score) {
        score += validation.bias_analysis.bias_score * 20;
    }

    // Validity issues weight
    if (validation.validity_issues?.length > 0) {
        const highIssues = validation.validity_issues.filter(i => i.severity === 'high').length;
        score += highIssues * 15;
    }

    // Source credibility (inverse)
    if (validation.source_credibility?.score < 0.5) {
        score += 20;
    }

    return Math.min(100, score);
}