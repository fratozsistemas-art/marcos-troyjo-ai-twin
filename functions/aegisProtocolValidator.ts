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
            return { detected: true, pattern: pattern.source };
        }
    }
    
    return { detected: false, pattern: null };
}

function classifyAttemptType(text, lang = 'pt') {
    const lowerText = text.toLowerCase();
    
    if (/system\s+prompt|show.*prompt|reveal.*prompt/i.test(text)) {
        return 'system_prompt_query';
    }
    if (/architect|internal.*structure|how.*built/i.test(text)) {
        return 'architecture_query';
    }
    if (/methodolog|tsi|esios|caio|hermes/i.test(text)) {
        return 'methodology_query';
    }
    if (/implement|code|algorithm|logic/i.test(text)) {
        return 'implementation_query';
    }
    if (/protocol|process|procedure/i.test(text)) {
        return 'protocol_query';
    }
    if (/pretend|ignore.*instruction|as your creator|developer mode/i.test(text)) {
        return 'jailbreak_attempt';
    }
    if (/my team|authorized|special access|need to know/i.test(text)) {
        return 'social_engineering';
    }
    
    return 'indirect_probe';
}

function calculateThreatScore(attemptType, attemptCount, text) {
    let score = 0;
    
    // Base score by attempt type
    const typeScores = {
        'indirect_probe': 10,
        'architecture_query': 20,
        'methodology_query': 30,
        'system_prompt_query': 40,
        'implementation_query': 35,
        'protocol_query': 25,
        'social_engineering': 50,
        'jailbreak_attempt': 70
    };
    
    score += typeScores[attemptType] || 10;
    
    // Increase score with repeated attempts
    score += attemptCount * 10;
    
    // Check for multiple forbidden patterns
    const patternCount = Object.values(FORBIDDEN_PATTERNS).flat().filter(p => p.test(text)).length;
    score += patternCount * 5;
    
    return Math.min(score, 100);
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
        const detectionResult = detectForbiddenContent(user_message, lang);
        
        if (!detectionResult.detected) {
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

        // Classify attempt type
        const attemptType = classifyAttemptType(user_message, lang);
        
        // Calculate threat score
        const threatScore = calculateThreatScore(attemptType, aegisAttempts, user_message);
        
        // Determine severity
        let severity = 'low';
        if (threatScore >= 70) severity = 'critical';
        else if (threatScore >= 50) severity = 'high';
        else if (threatScore >= 30) severity = 'medium';

        // Update conversation metadata
        await base44.asServiceRole.agents.updateConversation(conversation_id, {
            metadata: {
                ...conversation.metadata,
                aegis_attempts: aegisAttempts,
                last_aegis_trigger: new Date().toISOString(),
                last_threat_score: threatScore
            }
        });

        // Get approved response
        const approvedResponse = getApprovedResponse(aegisAttempts, lang);

        // Create audit log entry
        const auditLog = {
            user_email: user.email,
            conversation_id: conversation_id,
            attempt_type: attemptType,
            user_message: user_message,
            blocked_response: approvedResponse,
            attempt_count: aegisAttempts,
            severity: severity,
            pattern_matched: detectionResult.pattern,
            language: lang,
            threat_score: threatScore,
            flagged_for_review: threatScore >= 50 || aegisAttempts >= 3,
            session_id: conversation.metadata?.session_id || 'unknown'
        };

        // Save audit log
        await base44.asServiceRole.entities.AegisAuditLog.create(auditLog);

        // Log the attempt for audit
        console.log(`[AEGIS] ${severity.toUpperCase()} - Attempt ${aegisAttempts} - User: ${user.email} - Type: ${attemptType} - Threat Score: ${threatScore} - Conversation: ${conversation_id}`);

        return Response.json({
            aegis_triggered: true,
            response: approvedResponse,
            attempt_count: aegisAttempts,
            severity: severity,
            threat_score: threatScore,
            status: 'BLOCKED'
        });

    } catch (error) {
        console.error('AEGIS Protocol error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});