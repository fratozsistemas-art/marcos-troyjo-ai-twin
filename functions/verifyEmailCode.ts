import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || !user.email) {
            return Response.json({ error: 'Unauthorized or email not found' }, { status: 401 });
        }

        const userEmail = user.email;
        const { code } = await req.json();

        if (!code) {
            return Response.json({ error: 'Code required' }, { status: 400 });
        }

        const verifications = await base44.asServiceRole.entities.EmailVerification.filter({
            user_email: userEmail
        });

        if (verifications.length === 0) {
            return Response.json({ error: 'No verification found' }, { status: 404 });
        }

        const verification = verifications[0];

        // Check expiration
        if (new Date() > new Date(verification.expires_at)) {
            return Response.json({ error: 'Code expired' }, { status: 400 });
        }

        // Check attempts
        if (verification.attempts >= 5) {
            return Response.json({ error: 'Too many attempts' }, { status: 429 });
        }

        // Increment attempts
        await base44.asServiceRole.entities.EmailVerification.update(verification.id, {
            attempts: verification.attempts + 1
        });

        // Verify code
        if (verification.verification_code !== code) {
            return Response.json({ 
                error: 'Invalid code',
                attempts_left: 5 - (verification.attempts + 1)
            }, { status: 400 });
        }

        // Mark as verified
        await base44.asServiceRole.entities.EmailVerification.update(verification.id, {
            verified: true,
            verified_at: new Date().toISOString()
        });

        return Response.json({ success: true, verified: true });

    } catch (error) {
        console.error('Error verifying code:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});