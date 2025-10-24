import Stripe from 'stripe';
import { connectDB } from '../db.js';
import { ObjectId } from 'mongodb';
import fastifyPassport from '@fastify/passport';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
const monthlyPrice = process.env.STRIPE_MONTHLY_PRICE_ID
const yearlyPrice = process.env.STRIPE_YEARLY_PRICE_ID

export default async function checkoutRoutes(fastify, opts) {
  fastify.post('/session', { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) }, async (request, reply) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      reply.status(500).send({ error: 'Stripe secret key not configured' })
      return
    }

    const { _id, email } = request.user || {}
    const { type } = request.body
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      client_reference_id: _id.toString(),
      customer_email: email,
      line_items: [
        {
          price: type === 'yearly' ? yearlyPrice : monthlyPrice,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      return_url: `${process.env.APP_URL}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return { clientSecret: session.client_secret, id: session.id }
  })

  fastify.post('/return', { config: { auth: false } }, async (request, reply) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      reply.status(500).send({ error: 'Stripe secret key not configured' })
      return
    }

    const { session_id } = request.body
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.status === 'complete') {
      const db = await connectDB()
      await db.collection('users').updateOne(
        { _id: new ObjectId(session.client_reference_id) },
        {
          $set: {
            subscription: {
              plan: 'pro',
              expiresAt: null,
              id: session.subscription
            }
          }
        }
      )

      return { success: true }
    } else {
      reply.status(400).send({ error: 'Payment not completed' })
      return
    }
  })

  fastify.post('/cancel', { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) }, async (request, reply) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      reply.status(500).send({ error: 'Stripe secret key not configured' })
      return
    }
    const { user } = request
    const { type } = request.body

    if (type === 'cancel') {
      const result = await stripe.subscriptions.update(
        user?.subscription?.id,
        { cancel_at_period_end: true }
      );

      const db = await connectDB()
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            subscription: {
              ...user.subscription,
              expiresAt: new Date(result.cancel_at * 1000),
            }
          }
        }
      )
    } else if (type === 'revert-cancel') {
      await stripe.subscriptions.update(
        user?.subscription?.id,
        { cancel_at_period_end: false }
      );

      const db = await connectDB()
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            subscription: {
              ...user.subscription,
              expiresAt: null,
            }
          }
        }
      )
    }

    return { success: true }
  })
}