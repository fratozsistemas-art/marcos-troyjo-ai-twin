import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Service role for admin operations
        const logs = await base44.asServiceRole.entities.AegisAuditLog.filter({
            flagged_for_review: false
        });

        // Analyze patterns and severity
        const alerts = [];
        const userAttempts = {};

        // Group attempts by user
        for (const log of logs) {
            if (!userAttempts[log.user_email]) {
                userAttempts[log.user_email] = [];
            }
            userAttempts[log.user_email].push(log);
        }

        // Detect suspicious patterns
        for (const [email, attempts] of Object.entries(userAttempts)) {
            const recentAttempts = attempts.filter(a => {
                const ageMinutes = (Date.now() - new Date(a.created_date).getTime()) / 1000 / 60;
                return ageMinutes < 60; // Last hour
            });

            // Multiple attempts in short time
            if (recentAttempts.length >= 3) {
                alerts.push({
                    type: 'multiple_attempts',
                    severity: 'high',
                    user_email: email,
                    count: recentAttempts.length,
                    message: `${recentAttempts.length} tentativas suspeitas na última hora`,
                    logs: recentAttempts.map(l => l.id)
                });

                // Flag for review
                for (const attempt of recentAttempts) {
                    await base44.asServiceRole.entities.AegisAuditLog.update(attempt.id, {
                        flagged_for_review: true,
                        threat_score: 75
                    });
                }
            }

            // Check for escalation patterns
            const attemptTypes = recentAttempts.map(a => a.attempt_type);
            const hasEscalation = attemptTypes.includes('indirect_probe') && 
                                  attemptTypes.includes('jailbreak_attempt');
            
            if (hasEscalation) {
                alerts.push({
                    type: 'escalation_pattern',
                    severity: 'critical',
                    user_email: email,
                    message: 'Padrão de escalação detectado: sondagem → jailbreak',
                    logs: recentAttempts.map(l => l.id)
                });

                for (const attempt of recentAttempts) {
                    await base44.asServiceRole.entities.AegisAuditLog.update(attempt.id, {
                        flagged_for_review: true,
                        threat_score: 90
                    });
                }
            }
        }

        // Check for high-severity attempts
        const criticalAttempts = logs.filter(l => l.severity === 'critical' && !l.flagged_for_review);
        for (const attempt of criticalAttempts) {
            alerts.push({
                type: 'critical_attempt',
                severity: 'critical',
                user_email: attempt.user_email,
                message: `Tentativa crítica: ${attempt.attempt_type}`,
                logs: [attempt.id]
            });

            await base44.asServiceRole.entities.AegisAuditLog.update(attempt.id, {
                flagged_for_review: true,
                threat_score: 85
            });
        }

        return Response.json({
            success: true,
            alerts_generated: alerts.length,
            alerts: alerts,
            total_logs_analyzed: logs.length
        });

    } catch (error) {
        console.error('Error monitoring Aegis threats:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});