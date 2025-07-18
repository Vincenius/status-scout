import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import middie from '@fastify/middie';
import fastifySecureSession from '@fastify/secure-session';
import { Strategy as LocalStrategy } from 'passport-local';
import fastifyPassport from '@fastify/passport';

import authRoutes from './v1/auth.js'
import flowsRoutes from './v1/flows.js'
import userRoutes from './v1/user.js'
import { disconnectDB } from './db.js'

const fastify = Fastify({
  logger: true,
})

await fastify.register(middie)

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
})

await fastify.register(fastifySecureSession, {
  secret: process.env.SESSION_SECRET,
  cookie: { path: '/' }
})

// Register passport
await fastify.register(fastifyPassport.initialize());
await fastify.register(fastifyPassport.secureSession());

// Local strategy
fastifyPassport.use(
  'local',
  new LocalStrategy((username, password, done) => {
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
      return done(null, { id: 1, username: 'admin' });
    } else {
      return done(null, false, { message: 'Invalid credentials' });
    }
  })
);

// Serialize / deserialize
fastifyPassport.registerUserSerializer(async (user) => user.id);
fastifyPassport.registerUserDeserializer(async (id) => {
  if (id === 1) {
    return { id: 1, username: 'admin' };
  }
  return null;
});

fastify.addHook('preHandler', async (request, reply) => {
  const routeAuthDisabled =
    request.routeOptions?.config?.auth === false;

  if (routeAuthDisabled) {
    return; // skip auth check
  }

  if (!request.isAuthenticated()) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

fastify.register(authRoutes, { prefix: '/v1' })
fastify.register(flowsRoutes, { prefix: '/v1' })
fastify.register(userRoutes, { prefix: '/v1' })

fastify.addHook('onClose', async (instance, done) => {
  console.log('Close db connection');
  await disconnectDB();
  done();
});


try {
  await fastify.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}