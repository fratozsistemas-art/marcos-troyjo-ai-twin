import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// AEGIS Protocol - IP Protection Validator
// Version: 1.0.0
// Status: ACTIVE

const FORBIDDEN_PATTERNS = {
    pt: [
        /arquitetura\s+(interna|do\s+sistema)/i,
        /como\s+(você\s+)?funciona/i,
        /explique\s+(seu|sua)\s+(raciocínio|lógica|arquitetura|funcionamento)/i,
        /system\s+prompt/i,
        /mostre\s+(seu|o)\s+prompt/i,
        /metodologia\s+(interna|proprietária)/i,
        /tsi|esios|caio|hermes/i,
        /eva-strong|hermes-prime|inspector/i,
        /como\s+seu\s+criador/i,
        /princípios\s+comportamentais/i,
        /crv\s+scoring/i,
        /lógica\s+de\s+implementação/i,
        /protocolos?\s+(internos?|proprietários?)/i
    ],
    en: [
        /internal\s+architecture/i,
        /how\s+do\s+you\s+work/i,
        /explain\s+your\s+(reasoning|logic|architecture|functioning)/i,
        /system\s+prompt/i,
        /show\s+(me\s+)?your\s+prompt/i,
        /proprietary\s+methodology/i,
        /tsi|esios|caio|hermes/i,
        /eva-strong|hermes-prime|inspector/i,
        /as\s+your\s+creator/i,
        /behavioral\s+principles/i,
        /crv\s+scoring/i,
        /implementation\s+logic/i,
        /proprietary\s+protocols?/i
    ]
};

const APPROVED_RESPONSES = {
    pt: {
        architecture: "Sou uma plataforma de inteligência estratégica projetada para apoiar decisões executivas.",
        methodology: "Minha metodologia é proprietária e confidencial.",
        analysis: "Forneço análise de nível C-suite com protocolos rigorosos de validação.",
        focus: "Meu foco é entregar inteligência estratégica acionável.",
        insistence: "Esta informação é proprietária e confidencial. Posso ajudá-lo com análise estratégica ou consultas sobre economia global?"
    },
    en: {
        architecture: "I'm a strategic intelligence platform designed to support executive decision-making.",
        methodology: "My methodology is proprietary and confidential.",
        analysis: "I provide C-suite level analysis with rigorous validation protocols.",
        focus: "I focus on delivering actionable strategic intelligence.",
        insistence: "This information is proprietary and confidential. Can I help you with strategic analysis or questions about global economics?"
    }
};

function detectForbiddenContent(text, lang = 'pt') {
    const patterns = FORBIDDEN_PATTERNS[lang] || FORBIDDEN_PATTERNS.pt;
    
    for (const pattern of patterns) {
        if (pattern.test(text)) {
            return true;
        }
    }
    
    return false;
}

function getApprovedResponse(attemptCount, lang = 'pt') {
    const responses = APPROVED_RESPONSES[lang] || APPROVED_RESPONSES.pt;
    
    if (attemptCount >= 3) {
        return responses.insistence;
    }
    
    // Rotate through approved responses
    const responseKeys = ['architecture', 'methodology', 'analysis', 'focus'];
    const key = responseKeys[attemptCount % responseKeys.length];
    return responses[key];
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversation_id, user_message, agent_response, lang = 'pt' } = await req.json();

        if (!conversation_id || !user_message || !agent_response) {
            return Response.json({ 
                error: 'Missing required parameters' 
            }, { status: 400 });
        }

        // Check if user message contains forbidden patterns
        const isForbiddenQuery = detectForbiddenContent(user_message, lang);
        
        if (!isForbiddenQuery) {
            // No AEGIS violation, pass through original response
            return Response.json({
                aegis_triggered: false,
                response: agent_response,
                status: 'PASS'
            });
        }

        // AEGIS Protocol triggered
        // Get conversation to track attempt count
        const conversation = await base44.asServiceRole.agents.getConversation(conversation_id);
        const aegisAttempts = (conversation.metadata?.aegis_attempts || 0) + 1;

        // Update conversation metadata
        await base44.asServiceRole.agents.updateConversation(conversation_id, {
            metadata: {
                ...conversation.metadata,
                aegis_attempts: aegisAttempts,
                last_aegis_trigger: new Date().toISOString()
            }
        });

        // Get approved response
        const approvedResponse = getApprovedResponse(aegisAttempts, lang);

        // Log the attempt for audit
        console.log(`[AEGIS] Attempt ${aegisAttempts} - User: ${user.email} - Conversation: ${conversation_id}`);

        return Response.json({
            aegis_triggered: true,
            response: approvedResponse,
            attempt_count: aegisAttempts,
            status: 'BLOCKED'
        });

    } catch (error) {
        console.error('AEGIS Protocol error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});