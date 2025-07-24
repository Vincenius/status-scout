import 'dotenv/config'
import { connectDB, disconnectDB } from './db.js'
import { runUptimeCheck } from './checks/uptime.js'
import { runFuzzCheck } from './checks/fuzz.js'
import { runHeaderCheck } from './checks/headers.js'
import { runSslCheck } from './checks/ssl.js'
import { runLighthouseCheck } from './checks/lighthouse.js'
import { runPerformanceCheck } from './checks/performance.js'
import { runCustomChecks } from './checks/custom.js'
import { runBrokenLinkCheck } from './checks/links.js'

export const run = async ({ type = 'quick' }) => {
  // type (of check) -> quick, extended, full
  try {
    const db = await connectDB()
    const users = await db.collection('users').find({}).toArray()

    for (const user of users) {
      const createdAt = new Date().toISOString()
      console.log(createdAt, `run ${type} status check for`, user.domain)

      await runUptimeCheck({ uri: user.domain, db, userId: user._id, createdAt })
      await runHeaderCheck({ uri: user.domain, db, userId: user._id, createdAt })
      await runSslCheck({ uri: user.domain, db, userId: user._id, createdAt })

      if (type === 'extended' || type === 'full') {
        await runFuzzCheck({ uri: user.domain, db, userId: user._id, createdAt, type })
        await runCustomChecks({ uri: user.domain, db, userId: user._id, createdAt })
      }
      if (type === 'full') {
        await runLighthouseCheck({ uri: user.domain, db, userId: user._id, createdAt })
        await runPerformanceCheck({ uri: user.domain, db, userId: user._id, createdAt })
        await runBrokenLinkCheck({ uri: user.domain, db, userId: user._id, createdAt })
      }

      const newChecks = await db
        .collection('checks')
        .find({ userId: user._id, createdAt })
        .toArray();

      const failedChecks = newChecks.filter(c => c.result.status === 'fail');
      const failedMap = new Map(user.failedChecks.map(fc => [fc.check, fc]));
      const notifications = []

      for (const failedCheck of failedChecks) {
        if (failedMap.has(failedCheck.check)) {
          failedMap.set(failedCheck.check, failedCheck);
        } else {
          failedMap.set(failedCheck.check, failedCheck);
          notifications.push(failedCheck)
        }
      }

      // Save updated failed checks
      const updatedFailedChecks = Array.from(failedMap.values());

      if (updatedFailedChecks.length > 0) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { failedChecks: updatedFailedChecks } }
        );
      }

      if (notifications.length > 0) {
        console.log('sending notifications');
        await fetch('https://ntfy.sh/www-onlogist-monitoring', {
          method: 'POST',
          body: 'Error: ' + notifications.map(n => n.check).join(', ')
        })
      }

      console.log('finished all checks')
    }
  } catch (e) {
    console.error('unexpected error', e)
  } finally {
    await disconnectDB()
  }
}

run({ type: 'quick' })
