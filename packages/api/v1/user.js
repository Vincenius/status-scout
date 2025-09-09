import fastifyPassport from '@fastify/passport';
import { mapUser } from '../utils/user.js';

export default async function userRoutes(fastify, opts) {
  fastify.get('/',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      try {
        const user = request.user

        return mapUser(user)
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })
}
