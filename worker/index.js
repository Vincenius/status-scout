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
import { ObjectId } from 'mongodb'

export const run = async ({ type = 'quick', userId, quickcheckId, url }) => {
  // type (of check) -> quick, extended, full
  try {
    const db = await connectDB()
    const [user] = userId
      ? await db.collection('users').find({ _id: new ObjectId(userId) }).toArray()
      : [{ domain: url }] // quickcheck

    const createdAt = new Date().toISOString()
    console.log(createdAt, `run ${type} status check for`, user.domain)

    const baseParams = { uri: user.domain, db, userId: user._id, quickcheckId, createdAt }

    const checks = [
      runUptimeCheck(baseParams),
      runHeaderCheck(baseParams),
      runSslCheck(baseParams)
    ]

    if (type === 'extended' || type === 'full' || type === 'free') {
      checks.push(
        runFuzzCheck({ ...baseParams, type }),
        runCustomChecks(baseParams)
      )
    }

    if (type === 'full' || type === 'free') {
      checks.push(
        runLighthouseCheck(baseParams),
        runPerformanceCheck(baseParams),
        runBrokenLinkCheck({ ...baseParams, type })
      )
    }

    await Promise.all(checks)

    const newChecks = await db
      .collection('checks')
      .find({ userId: user._id, createdAt })
      .toArray();

    const failedChecks = newChecks.filter(c => c.result.status === 'fail');
    const failedMap = new Map((user.failedChecks || []).map(fc => [fc.check, fc]));
    const notifications = []

    for (const failedCheck of failedChecks) {
      if (failedMap.has(failedCheck.check)) {
        failedMap.set(failedCheck.check, failedCheck);
      } else {
        failedMap.set(failedCheck.check, failedCheck);
        notifications.push(failedCheck)
      }
    }

    // TODO remove old failed checks that succeeded now

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
  } catch (e) {
    console.error('unexpected error', e)
  } finally {
    await disconnectDB() // TODO improve db handling
  }
}
