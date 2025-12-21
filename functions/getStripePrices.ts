import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // List all active prices
        const prices = await stripe.prices.list({
            active: true,
            expand: ['data.product']
        });

        // Format prices for frontend
        const formattedPrices = prices.data.map(price => ({
            id: price.id,
            product_id: price.product.id,
            product_name: price.product.name,
            unit_amount: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval,
            metadata: price.product.metadata
        }));

        return Response.json({
            prices: formattedPrices
        });

    } catch (error) {
        console.error('Error fetching prices:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});