import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();

        // Verify webhook signature
        let event;
        try {
            event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Plan limits configuration
        const planLimits = {
            student: {
                consultations_per_month: 20,
                articles_per_month: 10,
                documents_per_month: 50
            },
            pro: {
                consultations_per_month: 50,
                articles_per_month: 20,
                documents_per_month: -1
            },
            teams: {
                consultations_per_month: 150,
                articles_per_month: 60,
                documents_per_month: -1
            }
        };

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userEmail = session.metadata.user_email;
                const plan = session.metadata.plan;

                // Update or create subscription
                const existing = await base44.asServiceRole.entities.Subscription.filter({
                    user_email: userEmail
                });

                if (existing.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
                        plan: plan,
                        status: 'active',
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                        limits: planLimits[plan] || planLimits.pro,
                        trial_start_date: null,
                        trial_end_date: null,
                        features_used: {
                            consultations: 0,
                            articles_generated: 0,
                            documents_analyzed: 0
                        }
                    });
                } else {
                    await base44.asServiceRole.entities.Subscription.create({
                        user_email: userEmail,
                        plan: plan,
                        status: 'active',
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                        limits: planLimits[plan] || planLimits.pro,
                        features_used: {
                            consultations: 0,
                            articles_generated: 0,
                            documents_analyzed: 0
                        }
                    });
                }

                // Send welcome email
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: userEmail,
                    subject: 'Bem-vindo ao Troyjo Twin!',
                    body: `
                        <h2>Obrigado por assinar o plano ${plan.toUpperCase()}!</h2>
                        <p>Sua assinatura está ativa e você pode começar a usar todos os recursos.</p>
                        <p>Se tiver alguma dúvida, nossa equipe está à disposição.</p>
                        <br>
                        <p>Equipe CAIO.Vision</p>
                    `
                });
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                const userSubs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (userSubs.length > 0) {
                    const newStatus = subscription.status === 'active' ? 'active' : 
                                    subscription.status === 'trialing' ? 'trial' : 'cancelled';
                    
                    await base44.asServiceRole.entities.Subscription.update(userSubs[0].id, {
                        status: newStatus
                    });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const userSubs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (userSubs.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(userSubs[0].id, {
                        status: 'cancelled',
                        plan: 'free',
                        limits: {
                            consultations_per_month: 5,
                            articles_per_month: 2,
                            documents_per_month: 5
                        },
                        stripe_subscription_id: null
                    });

                    // Send cancellation email
                    const userEmail = userSubs[0].user_email;
                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: userEmail,
                        subject: 'Assinatura Cancelada - Troyjo Twin',
                        body: `
                            <h2>Sua assinatura foi cancelada</h2>
                            <p>Você foi movido para o plano gratuito.</p>
                            <p>Você ainda tem acesso limitado à plataforma.</p>
                            <p>Se quiser reativar, visite nossa página de preços.</p>
                        `
                    });
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
                const userSubs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (userSubs.length > 0) {
                    const userEmail = userSubs[0].user_email;
                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: userEmail,
                        subject: 'Falha no Pagamento - Troyjo Twin',
                        body: `
                            <h2>Não conseguimos processar seu pagamento</h2>
                            <p>Houve um problema com o pagamento da sua assinatura.</p>
                            <p>Por favor, atualize suas informações de pagamento para continuar usando o serviço.</p>
                        `
                    });
                }
                break;
            }
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});