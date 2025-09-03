import fastifyPassport from '@fastify/passport';
import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../db.js'
import { getTemplate } from '../utils/brevo.js'
import { sendEmail } from '../utils/email.js';

export default async function authRoutes(fastify, opts) {
  fastify.post(
    '/login',
    {
      preValidation: fastifyPassport.authenticate('local', { failWithError: true }),
      config: { auth: false }
    },
    async (req, reply) => {
      return { message: 'Logged in' };
    }
  );

  fastify.post(
    '/register',
    { config: { auth: false } },
    async (req, reply) => {
      const db = await connectDB()

      const { email, password } = req.body

      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        reply.code(409);
        return { error: 'Email already registered' };
      }

      const passHash = CryptoJS.SHA256(password, process.env.PASSWORD_HASH_SECRET).toString(CryptoJS.enc.Hex)
      const token = uuidv4()
      const subscription = {
        plan: 'paid',
        status: 'trial', // active, inactive, cancelled
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      }
      await db.collection('users').insertOne({
        email,
        password: passHash,
        confirmationToken: token,
        createdAt: new Date(),
        confirmed: false,
        subscription,
      }, { returnDocument: 'after' })

      const confirm_url = `${process.env.API_URL}/v1/confirm?token=${token}`
      const { htmlContent, subject } = await getTemplate(8)
      const html = htmlContent.replace('{{confirm_link}}', confirm_url)

      await sendEmail({
        to: email,
        subject,
        html
      })

      return { success: true };
    }
  );

  fastify.get('/confirm', { config: { auth: false } }, async (req, reply) => {
    const db = await connectDB()

    const { token } = req.query

    if (token) {
      await db.collection('users').updateOne({ confirmationToken: token }, { $set: { confirmed: true } });
    }

    reply.redirect(`${process.env.APP_URL}/onboarding`);
  });

  fastify.get('/logout', { config: { auth: false } }, async (req, reply) => {
    await req.logout();
    return { message: 'Logged out' };
  });

  fastify.get('/authenticated',
    { preValidation: fastifyPassport.authenticate('session') },
    async (req, res) => {
      return { message: 'Authenticated' };
    }
  );
}
