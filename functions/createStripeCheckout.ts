import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Real Stripe Price IDs from your catalog
const PRICE_IDS = {
    student_monthly: 'price_1SgmeqRo0dVPpa4WwvshBsl0',  // R$ 97/mês (entry_month)
    student_yearly: 'price_1SgmffRo0dVPpa4WzECFaiEL',   // R$ 970/ano (entry_annual)
    pro_monthly: 'price_1SgmgTRo0dVPpa4WvKYlYGeZ',      // R$ 397/mês (basic_month)
    pro_yearly: 'price_1SgmgnRo0dVPpa4WDwZwIari',       // R$ 3970/ano (basic_annual)
    teams_monthly: 'price_1SgmhJRo0dVPpa4W3H4jN37E',    // R$ 1497/mês (teams_monthly)
    teams_quarterly: 'price_1SgmhvRo0dVPpa4WWMA34UFU'   // R$ 14970/trimestre (teams_annual)
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan, interval = 'monthly' } = await req.json();

        // Build price ID key
        const priceKey = `${plan}_${interval}`;
        const priceId = PRICE_IDS[priceKey];

        if (!priceId) {
            return Response.json({ 
                error: 'Invalid plan or interval',
                available: Object.keys(PRICE_IDS)
            }, { status: 400 });
        }

        const origin = req.headers.get('origin') || 'https://troyjo.base44.app';

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer_email: user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pricing?payment=cancelled`,
            metadata: {
                user_email: user.email,
                plan: plan,
                interval: interval
            },
            subscription_data: {
                metadata: {
                    user_email: user.email,
                    plan: plan
                }
            }
        });

        return Response.json({
            checkout_url: session.url,
            session_id: session.id
        });

    } catch (error) {
        console.error('Error creating checkout:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});