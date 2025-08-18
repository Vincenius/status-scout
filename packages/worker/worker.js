import 'dotenv/config'
import { fork } from 'child_process';
import path from 'path';
import { Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { disconnectDB } from './db.js';

const CONCURRENT_RUNS = process.env.CONCURRENT_RUNS
  ? parseInt(process.env.CONCURRENT_RUNS) : 2
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const QUEUE_NAME = 'checks';

console.log('Initialize worker with', CONCURRENT_RUNS, 'concurrent runs')

const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    return new Promise((resolve, reject) => {
      const child = fork(path.resolve('./job-runner.js'), [], {
        env: {
          ...process.env,
          JOB_DATA: JSON.stringify(job.data),
        }
      });

      const timeout = setTimeout(() => {
        child.kill();  // Forcefully kill the child process
        reject(new Error('Job timed out'));
      }, 1000 * 120); // 60 seconds timeout

      child.on('message', (message) => {
        clearTimeout(timeout);
        if (message.status === 'done') {
          resolve({ status: 'done' });
        } else {
          reject(new Error(message.error || 'Unknown error in child process'));
        }
      });

      child.on('exit', (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  },
  {
    connection,
    concurrency: CONCURRENT_RUNS,
    settings: {
      lockDuration: 1200000  // in ms; match your timeout
    }
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

const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await worker.pause(true);     // Stop fetching new jobs
  await worker.close();         // close BullMQ worker
  await disconnectDB();         // close MongoDB connection
  await connection.quit();      // close Redis connection
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);