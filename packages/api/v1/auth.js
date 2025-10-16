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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
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


  fastify.post(
    '/forgot-password',
    { config: { auth: false } },
    async (req, reply) => {
      const db = await connectDB()

      const { email } = req.body

      const existingUser = await db.collection('users').findOne({ email });
      if (!existingUser) {
        return { success: true };
      }

      const token = uuidv4()
      await db.collection('users').updateOne({ email }, {
        $set: {
          resetPasswordToken: token,
          resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
        }
      }, { returnDocument: 'after' })

      const reset_url = `${process.env.APP_URL}/reset-password?token=${token}`
      const { htmlContent, subject } = await getTemplate(9)
      const html = htmlContent.replace('{{reset_link}}', reset_url)

      await sendEmail({
        to: email,
        subject,
        html
      })

      return { success: true };
    }
  );

  fastify.post(
    '/reset-password',
    { config: { auth: false } },
    async (req, reply) => {
      const db = await connectDB()

      const { token, password } = req.body

      const existingUser = await db.collection('users').findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });
      if (!existingUser) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // simulate delay to prevent brute force attacks
        reply.code(404);
        return { error: true };
      }

      const hashedPassword = CryptoJS.SHA256(password, process.env.PASSWORD_HASH_SECRET).toString(CryptoJS.enc.Hex)
      await db.collection('users').updateOne({ resetPasswordToken: token }, {
        $set: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null
        }
      }, { returnDocument: 'after' })

      return { success: true };
    }
  );

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
