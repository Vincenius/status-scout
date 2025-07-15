import { ObjectId } from 'mongodb'
import { connectDB, disconnectDB } from '../db.js'

export default async function flowRoutes(fastify, opts) {
  fastify.post('/user', async (request, reply) => {
    try {
      const db = await connectDB()

      const usersCollection = db.collection('users');

      // create new user
      const newUser = { domain: "https://www.onlogist.com" };

      const result = await usersCollection.insertOne(newUser);

      // respond with the inserted user’s _id
      reply.code(201).send({
        message: 'User created',
        userId: result.insertedId
      });
    } catch (e) {
      console.error(e)
      reply.code(500).send({ error: 'Internal server error' });
    }
  })

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
