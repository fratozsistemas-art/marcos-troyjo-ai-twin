import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email } = await req.json();
        
        if (!email) {
            return Response.json({ error: 'Email required' }, { status: 400 });
        }

        const userEmail = email;
        const code = generateCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Check existing verification
        const existing = await base44.asServiceRole.entities.EmailVerification.filter({
            user_email: userEmail
        });

        if (existing.length > 0) {
            await base44.asServiceRole.entities.EmailVerification.update(existing[0].id, {
                verification_code: code,
                expires_at: expiresAt.toISOString(),
                verified: false,
                attempts: 0
            });
        } else {
            await base44.asServiceRole.entities.EmailVerification.create({
                user_email: userEmail,
                verification_code: code,
                expires_at: expiresAt.toISOString(),
                verification_method: 'email_code'
            });
        }

        // Send email
        await base44.integrations.Core.SendEmail({
            to: userEmail,
            subject: 'Troyjo Digital Twin - Código de Verificação',
            body: `
                <h2>Verificação de Email</h2>
                <p>Seu código de verificação é:</p>
                <h1 style="font-size: 32px; color: #002D62; letter-spacing: 8px;">${code}</h1>
                <p>Este código expira em 15 minutos.</p>
                <p>Se você não solicitou este código, ignore este email.</p>
            `
        });

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error sending verification code:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});