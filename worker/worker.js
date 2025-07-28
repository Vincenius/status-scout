import 'dotenv/config'
import { Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import { run } from './index.js'

const CONCURRENT_RUNS = process.env.CONCURRENT_RUNS
  ? parseInt(process.env.CONCURRENT_RUNS) : 2
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const QUEUE_NAME = 'checks';

console.log('Initialize worker')

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);

    await run({
      type: job.data.type,
      userId: job.data.userId
    })

    return { status: 'done' }; // TODO
  },
  {
    connection,
    concurrency: CONCURRENT_RUNS,
  }
);

// Optional: listen to job events (failure, completion)
const events = new QueueEvents(QUEUE_NAME, { connection });

events.on('completed', ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed with:`, returnvalue);
});

events.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed:`, failedReason);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});