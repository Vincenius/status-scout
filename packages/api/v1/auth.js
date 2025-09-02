import fastifyPassport from '@fastify/passport';
import CryptoJS from 'crypto-js'
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../db.js'

export default async function authRoutes(fastify, opts) {
  fastify.post(
    '/login',
    {
      preValidation: fastifyPassport.authenticate('local', { failWithError: true }),
      config: { auth: false }
    },
    async (req, reply) => {
      // already logged in with secureSession
      return { message: 'Logged in', user: req.user };
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
        status: 'trial', // active, cancelled
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      }
      const user = await db.collection('users').insertOne({
        email,
        password: passHash,
        confirmationToken: token,
        createdAt: new Date(),
        subscription
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
