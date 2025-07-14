import cron from 'node-cron'

console.log('Init cron job')

// once a day
cron.schedule('0 10 * * *', async () => {
    // TODO
})