import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
})

const queue = new Queue('checks', { connection })

export default async function checkRoutes(fastify, opts) {
  fastify.post('/', { config: { auth: false } }, async (request, reply) => {
    const body = request.body

    console.log('Enqueuing job with body:', body)

    try {
      const job = await queue.add('api-triggered-job', body)
      await new Promise(r => setTimeout(r, 100))
      const freshJob = await queue.getJob(job.id)
      const state = await freshJob.getState()
      let waitingIndex = null

      if (state === 'waiting') {
        const waitingJobs = await queue.getWaiting()
        waitingIndex = waitingJobs.findIndex(j => j.id === job.id)
      }

      // todo id
      return { message: 'Job enqueued', state, waitingIndex }
    } catch (err) {
      console.error('Error enqueuing job:', err)
      reply.code(500).send({ error: 'Failed to enqueue job' })
    }
  })
}
