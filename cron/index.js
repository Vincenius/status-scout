import 'dotenv/config'
import { connectDB, disconnectDB } from './db.js'
import cron from 'node-cron'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
})

const queue = new Queue('checks', { connection })

async function tryRun(type) {
  try {
    const db = await connectDB()
    const users = await db.collection('users').find({}).toArray()

    for (const user of users) {
      const job = await queue.add('cron-triggered-job', { userId: user._id.toString(), type })
      console.log(`Enqueued ${type} for domain ${user.domain}, job: ${job.id}`)
    }
  } catch (e) {
    console.error(e)
  } finally {
    await disconnectDB()
  }
}

// once a day at 04:00:00 — full
cron.schedule('0 0 4 * * *', () => tryRun('full'))

// every 2 hours at :00:10 — extended
cron.schedule('10 0 */2 * * *', () => tryRun('extended'))

// every 10 minutes at :00:20 — quick
cron.schedule('20 */10 * * * *', () => tryRun('quick'))

tryRun('quick') // run once immediately

// todo cron job to clear up the tmp user database
