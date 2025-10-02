import fastifyPassport from '@fastify/passport';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../db.js'
import { ObjectId } from 'mongodb';
import { getJobStatus, runJob } from '../utils/worker.js'

export default async function checkRoutes(fastify, opts) {
  fastify.post('/statuscheck',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const body = request.body || {}
      const url = new URL(body.url);
      const baseUrl = url.origin;
      const statusCode = await fetch(baseUrl, { method: 'GET' })
        .then(response => response.status)
        .catch(() => 500);

      return { statusCode }
    })

  fastify.post('/check',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const body = request.body || {}
      const websiteId = body.id
      const userId = request.user?._id

      const db = await connectDB()
      const website = await db.collection('websites').findOne({ _id: new ObjectId(websiteId), userId })

      if (website) {
        const { message, waitingIndex, jobId } = await runJob({ websiteId, type: 'full' })
        await db.collection('websites').updateOne({ _id: website._id }, { $set: { lastCheckId: jobId } })

        return { message, waitingIndex, jobId }
      } else {
        // return 404 error
        reply.code(404).send({ error: 'Not Found' })
      }
    })

  fastify.get('/check',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const query = request.query || {}
      const websiteId = query.id
      const jobId = query.jobId
      const userId = request.user?._id

      const db = await connectDB()
      const website = await db.collection('websites').findOne({ index: websiteId, userId })

      if (website) {
        const status = await getJobStatus(website.lastCheckId)
        const checks = await db.collection('checks').find({ websiteId: website._id, jobId: jobId || website.lastCheckId }).toArray()

        return { checks, status };
      } else {
        // return 404 error
        reply.code(404).send({ error: 'Not Found' })
      }
    })

  fastify.post('/quickcheck', { config: { auth: false } }, async (request, reply) => {
    const body = request.body || {}
    const userId = request.user?._id

    console.log('run quick check', { userId, ...body })

    const url = new URL(body.url);
    const baseUrl = url.origin;
    const statusCode = await fetch(baseUrl, { method: 'GET' })
      .then(response => response.status)
      .catch(() => 500);

    if (statusCode === 200) {
      const db = await connectDB()

      try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0)

        // todo improve handling of logged in user quickchecks
        const prevChecks = process.env.LIMIT_ENABLED !== 'true' || userId
          ? null // ignore prev checks if user is logged in or if env is set
          : await db.collection('quickchecks')
            .find({ url: baseUrl, createdAt: { $gte: startOfToday } })
            .sort({ createdAt: -1 })
            .limit(3).toArray();

        if (prevChecks && prevChecks.length >= 3) {
          // return prev check if it was already checked three times today
          return { statusCode, quickcheckId: prevChecks[0].quickcheckId, isPrevCheck: true }
        } else {
          console.log('START CHECK')

          const quickcheckId = uuidv4();
          const { waitingIndex, jobId } = await runJob({ type: 'free', quickcheckId, url: baseUrl })
          await db.collection('quickchecks').insertOne({ url: baseUrl, createdAt: new Date(), quickcheckId, jobId })

          return { statusCode, quickcheckId, waitingIndex }
        }
      } catch (e) {
        console.error(e)
        reply.code(500).send({ error: 'Internal server error' });
      }
    } else {
      return { statusCode }
    }
  })

  fastify.get('/quickcheck', { config: { auth: false } }, async (request, reply) => {
    const { id } = request.query;

    if (!id) {
      return { error: true, message: 'Missing Id' }
    }

    try {
      const db = await connectDB()

      const [[quickcheck], checks] = await Promise.all([
        await db.collection('quickchecks').find({ quickcheckId: id }).toArray(),
        await db.collection('checks').find({ quickcheckId: id }).toArray()
      ])

      if (!quickcheck) {
        return { error: true, message: 'Quickcheck not found' }
      }

      const { waitingIndex, state } = await getJobStatus(quickcheck.jobId)

      return {
        statusCode: 200,
        quickcheckId: id,
        checks,
        waitingIndex,
        state,
        url: quickcheck.url,
        createdAt: quickcheck.createdAt.toISOString(),
      }
    } catch (e) {
      console.error(e)
      reply.code(500).send({ error: 'Internal server error' });
    }
  })

  fastify.get('/history', { config: { auth: false } }, async (request, reply) => {
    const { id } = request.query;

    if (!id) {
      return {}
    }

    const db = await connectDB()

    const [uptime, checks, firstCheck] = await Promise.all([
      db.collection('checks').find({ websiteId: new ObjectId(id), check: 'uptime' })
        .sort({ createdAt: 1 })
        .limit(40)
        .toArray(),
      db.collection('checks').aggregate([
        { $match: { websiteId: new ObjectId(id), check: { $ne: 'uptime' } } },
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
      ]).toArray(),
      db.collection('checks').find({ websiteId: new ObjectId(id) })
        .sort({ createdAt: 1 })
        .limit(1)
        .toArray(),
    ])

    return { uptime, checks, initialCheckDate: firstCheck[0]?.createdAt }
  })
}
