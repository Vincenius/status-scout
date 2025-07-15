import cron from 'node-cron'
import { run } from './index.js'

console.log('Init cron job')

// once a day
cron.schedule('0 4 * * *', async () => {
    await run()
})