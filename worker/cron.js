import cron from 'node-cron'
import { run } from './index.js'

console.log('Init cron jobs')

let currentJob = null

async function tryRun(type, priority) {
  const priorities = { full: 3, extended: 2, quick: 1 }

  if (currentJob) {
    if (priorities[currentJob] >= priority) {
      console.log(`Skipping ${type}: ${currentJob} is running`)
      return
    }
  }

  currentJob = type
  try {
    console.log(`Starting ${type} scan`)
    await run({ type })
  } catch (err) {
    console.error(`Error in ${type} job:`, err)
  } finally {
    currentJob = null
  }
}

// once a day at 04:00:00 — full
cron.schedule('0 0 4 * * *', () => tryRun('full', 3))

// every 2 hours at :00:10 — extended
cron.schedule('10 0 */2 * * *', () => tryRun('extended', 2))

// every 10 minutes at :00:20 — quick
cron.schedule('20 */10 * * * *', () => tryRun('quick', 1))
