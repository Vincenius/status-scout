import 'dotenv/config'
import { connectDB, disconnectDB } from './db.js'
import { runUptimeCheck } from './checks/uptime.js'
import { runFuzzCheck } from './checks/fuzz.js'
import { runHeaderCheck } from './checks/headers.js'
import { runLighthouseCheck } from './checks/lighthouse.js'
import { runPerformanceCheck } from './checks/performance.js'
import { runCustomChecks } from './checks/custom.js'

export const run = async () => {
  try {
    const db = await connectDB()
    const users = await db.collection('users').find({}).toArray()

    for (const user of users) {
      const createdAt = new Date().toISOString()
      console.log(createdAt, 'run status check for', user.domain)

      await runUptimeCheck({ uri: user.domain, db, userId: user._id, createdAt })
      await runFuzzCheck({ uri: user.domain, db, userId: user._id, createdAt })
      await runHeaderCheck({ uri: user.domain, db, userId: user._id, createdAt })
      await runLighthouseCheck({ uri: user.domain, db, userId: user._id, createdAt })
      await runPerformanceCheck({ uri: user.domain, db, userId: user._id, createdAt })
      await runCustomChecks({ uri: user.domain, db, userId: user._id, createdAt })

      // run other checks
      // SSL https://www.npmjs.com/package/node-ssllabs

      console.log('finished all checks')
    }
  } catch (e) {
    console.error('unexpected error', e)
  } finally {
    await disconnectDB()
  }
}

run()
