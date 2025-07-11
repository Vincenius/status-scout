import cron from 'node-cron'
import { run } from './status-check.js'
import { runSecurityCheck } from './security-check.js'

let errorCount = 0; // prevent error spam

console.log('Init cron job')

// run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
    try {
        await run(errorCount)
    } catch (e) {
        errorCount++;
        console.error('Error in cron job', e)
        if (errorCount <= 1) {
            await fetch('https://ntfy.sh/www-onlogist-monitoring', {
                method: 'POST',
                body: 'Unexpected error'
            })
        }
    }
})

// once a day
cron.schedule('0 10 * * *', async () => {
    try {
        await runSecurityCheck()
    } catch (e) {
        errorCount++;
        console.error('Error in cron job', e)
        if (errorCount <= 1) {
            await fetch('https://ntfy.sh/www-onlogist-monitoring', {
                method: 'POST',
                body: 'Unexpected error on security monitoring'
            })
        }
    }
})