import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import fastifyPassport from '@fastify/passport';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '../db.js'

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
})

const queue = new Queue('checks', { connection })

const getJobStatus = async (id) => {
  const freshJob = await queue.getJob(id)
  const state = await freshJob.getState()
  let waitingIndex = null

  if (state === 'waiting') {
    const waitingJobs = await queue.getWaiting()
    waitingIndex = waitingJobs.findIndex(j => j.id === id)
  }

  return { waitingIndex, state }
}

const runJob = async (body) => {
  try {
    console.log('Enqueuing job with body:', body)

    const job = await queue.add('api-triggered-job', body)
    await new Promise(r => setTimeout(r, 100))
    const { waitingIndex } = await getJobStatus(job.id)

    return { message: 'Job enqueued', waitingIndex, jobId: job.id }
  } catch (err) {
    console.error('Error enqueuing job:', err)
    reply.code(500).send({ error: 'Failed to enqueue job' })
  }
}

export default async function checkRoutes(fastify, opts) {
  fastify.post('/check',
    { preValidation: fastifyPassport.authenticate('session', { failureRedirect: '/login' }) },
    async (request, reply) => {
      const userId = request.user?.id

      if (userId) {
        return runJob({ userId, type: 'full' })
      } else {
        // return 403 error
        reply.code(403).send({ error: 'Forbidden' })
      }
    })

  fastify.post('/quickcheck', { config: { auth: false } }, async (request, reply) => {
    const body = request.body || {}
    const userId = request.user?.id

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
          const { waitingIndex, jobId } = await runJob({ userId, type: 'free', quickcheckId, url: baseUrl })
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
        url: quickcheck.url
      }
    } catch (e) {
      console.error(e)
      reply.code(500).send({ error: 'Internal server error' });
    }
  })
}
