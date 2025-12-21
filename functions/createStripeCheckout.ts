import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Product IDs mapping - configure these in Stripe Dashboard
const PRICE_IDS = {
    pt: {
        student: 'price_student_monthly_pt',
        pro: 'price_pro_monthly_pt',
        teams: 'price_teams_monthly_pt'
    },
    en: {
        student: 'price_student_monthly_en',
        pro: 'price_pro_monthly_en',
        teams: 'price_teams_monthly_en'
    }
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan, lang = 'pt' } = await req.json();

        // Get price ID
        const priceId = PRICE_IDS[lang]?.[plan];
        if (!priceId) {
            return Response.json({ error: 'Invalid plan' }, { status: 400 });
        }

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
            success_url: `${req.headers.get('origin')}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/pricing`,
            metadata: {
                user_email: user.email,
                plan: plan,
                lang: lang
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