import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import flowsRoutes from './v1/flows.js'
import userRoutes from './v1/user.js'
import { disconnectDB } from './db.js'

const fastify = Fastify({
  logger: true,
})

await fastify.register(cors, {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
})

fastify.register(flowsRoutes, { prefix: '/v1' })
fastify.register(userRoutes, { prefix: '/v1' })

fastify.addHook('onClose', async (instance, done) => {
  console.log('Close db connection');
  await disconnectDB();
  done();
});


try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}