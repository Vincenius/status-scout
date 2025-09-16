import fastifyPassport from '@fastify/passport';
import { ObjectId } from 'mongodb'
import { connectDB } from '../db.js'

export default async function userRoutes(fastify, opts) {
  fastify.post('/',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const user = request.user
      const body = request.body || {}
      const url = new URL(body.url);
      const baseUrl = url.origin;

      const db = await connectDB()
      const count = await db.collection('websites').countDocuments({ userId: user._id })
      const newElemIndex = (count + 1).toString()
      const result = await db.collection('websites').insertOne({
        userId: user._id,
        domain: baseUrl,
        createdAt: new Date(),
        index: newElemIndex,
      })

      return { id: result.insertedId, index: newElemIndex }
    })

  fastify.get('/',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      try {
        const user = request.user

        const db = await connectDB()
        const websites = await db.collection('websites').find({ userId: user._id }).toArray()

        return websites.map(w => ({
          id: w._id.toString(),
          domain: w.domain,
          createdAt: w.createdAt,
          index: w.index,
        }))
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })

  fastify.get('/uptime',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

        const db = await connectDB()

        const [count, failedCount, [oldestCheck]] = await Promise.all([
          db.collection('checks').countDocuments({
            check: 'uptime',
            createdAt: { $gte: thirtyDaysAgoIso }
          }),
          db.collection('checks').countDocuments({
            check: 'uptime',
            'result.status': 'fail',
            createdAt: { $gte: thirtyDaysAgoIso }
          }),
          db.collection('checks')
            .find({
              check: 'uptime',
              createdAt: { $gte: thirtyDaysAgoIso }
            })
            .sort({ createdAt: 1 })
            .limit(1)
            .toArray()
        ])

        const dateDiff = oldestCheck?.createdAt
          ? Math.ceil((new Date() - new Date(oldestCheck.createdAt)) / (1000 * 60 * 60 * 24))
          : null;

        return { count, failedCount, dateDiff }
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    })

  fastify.post('/ignore',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const body = request.body
      // request.user // todo use logged in user

      const db = await connectDB()

      try {
        if (body.action === 'add') {
          await db.collection('users').updateOne(
            { _id: new ObjectId(process.env.TMP_USER_ID) },
            { $addToSet: { ignore: { item: body.item, type: body.type } } }
          )
        } else if (body.action === 'remove') {
          await db.collection('users').updateOne(
            { _id: new ObjectId(process.env.TMP_USER_ID) },
            { $pull: { ignore: { item: body.item, type: body.type } } }
          )
        }

        return {}
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }

      return {}
    })
}
