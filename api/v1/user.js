import { ObjectId } from 'mongodb'
import { connectDB, disconnectDB } from '../db.js'

export default async function flowRoutes(fastify, opts) {
  fastify.get('/dbg', async (request, reply) => {
    try {
      const db = await connectDB()

      const checks = await db.collection('checks').find({ }).toArray()
      const users = await db.collection('users').find({ }).toArray()
      const flows = await db.collection('flows').find({ }).toArray()

      // respond with the inserted user’s _id
      reply.code(200).send({
        checks,
        users,
        flows
      });
    } catch (e) {
      console.error(e)
      reply.code(500).send({ error: 'Internal server error' });
    }
  })

  fastify.get('/user', async (request, reply) => {
    try {
      const db = await connectDB()

      const checks = await db.collection('checks').find({ }).toArray()

      return checks
    } catch (e) {
      console.error(e)
      reply.code(500).send({ error: 'Internal server error' });
    }
  })
}
