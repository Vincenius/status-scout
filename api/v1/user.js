import fastifyPassport from '@fastify/passport';
import { connectDB, disconnectDB } from '../db.js'

export default async function userRoutes(fastify, opts) {
  // fastify.get('/dbg',
  //   { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
  //   async (request, reply) => {
  //     try {
  //       const db = await connectDB()

  //       const checks = await db.collection('checks').find({}).toArray()
  //       const users = await db.collection('users').find({}).toArray()
  //       const flows = await db.collection('flows').find({}).toArray()

  //       // respond with the inserted user’s _id
  //       reply.code(200).send({
  //         checks,
  //         users,
  //         flows
  //       });
  //     } catch (e) {
  //       console.error(e)
  //       reply.code(500).send({ error: 'Internal server error' });
  //     }
  //   })

  fastify.get('/user',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      try {
        const db = await connectDB()

        const [user] = await db.collection('users').find({}).toArray()
        const checks = await db.collection('checks').aggregate([
          { $match: { userId: user._id } },
          { $sort: { check: 1, createdAt: -1 } },
          {
            $group: {
              _id: "$check",
              entries: { $push: "$$ROOT" }
            }
          },
          {
            $project: {
              _id: 0,
              check: "$_id",
              entries: { $slice: ["$entries", 40] }
            }
          },
          { $unwind: "$entries" },
          { $replaceRoot: { newRoot: "$entries" } }
        ]).toArray(); // todo improve query to limit checks to 30 of each type

        return {
          user,
          checks
        }
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
}
