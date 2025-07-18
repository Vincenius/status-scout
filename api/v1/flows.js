import { ObjectId } from 'mongodb'
import fastifyPassport from '@fastify/passport';
import { connectDB } from '../db.js'

export default async function flowRoutes(fastify, opts) {
  fastify.get('/flows', async (request, reply) => {
    const db = await connectDB();

    try {
      const flows = await db
        .collection('flows')
        .find({})
        .toArray();

      return flows;
    } catch (e) {
      console.error(e);
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post('/flows',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const body = request.body

      // todo validate body

      const db = await connectDB()

      try {
        await db.collection('flows').insertOne({
          userId: new ObjectId('6870ad94c49ffd667b661fca'),
          createdAt: new Date(),
          name: body[0].name,
          steps: body[0].steps,
        });

        return { message: 'Flow created', data: body }
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })
}
