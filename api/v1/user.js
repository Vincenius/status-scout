import { ObjectId } from 'mongodb'
import { connectDB, disconnectDB } from '../db.js'

export default async function flowRoutes(fastify, opts) {
  fastify.get('/user', async (request, reply) => {

    try {
      const db = await connectDB()
      
      const checks = await db.collection('checks').find({ userId: new ObjectId('6870ad94c49ffd667b661fca') }).toArray()
      
      return checks
    } catch (e) {
      console.error(e)
      reply.code(500).send({ error: 'Internal server error' });
    }
  })
}
