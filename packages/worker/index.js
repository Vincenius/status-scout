import 'dotenv/config'
import { connectDB } from './db.js'
import { runUptimeCheck } from './checks/uptime.js'
import { runFuzzCheck } from './checks/fuzz.js'
import { runHeaderCheck } from './checks/headers.js'
import { runSslCheck } from './checks/ssl.js'
import { runLighthouseCheck } from './checks/lighthouse.js'
import { runPerformanceCheck } from './checks/performance.js'
import { runCustomChecks } from './checks/custom.js'
import { runBrokenLinkCheck } from './checks/links.js'
import { ObjectId } from 'mongodb'

export const run = async ({ id, type = 'quick', websiteId, quickcheckId, url }) => {
  // type (of check) -> quick, extended, full
  try {
    const db = await connectDB()
    const [website] = !url && websiteId
      ? await db.collection('websites').find({ _id: new ObjectId(websiteId) }).toArray()
      : [{ domain: url }] // quickcheck

    const createdAt = new Date().toISOString()
    console.log(createdAt, `run ${type} status check for`, website.domain)

    const baseParams = { id, uri: website.domain, db, websiteId: website._id, quickcheckId, createdAt } // todo maybe replace quickcheckid with id

    const checks = [
      runUptimeCheck(baseParams),
      runHeaderCheck(baseParams),
      runSslCheck(baseParams)
    ]

    if (type === 'extended' || type === 'full' || type === 'free') {
      checks.push(
        runFuzzCheck({ ...baseParams, type }),
      )
    }

    if (type === 'full' || type === 'extended') {
      // todo
      // checks.push(
      //   runCustomChecks(baseParams)
      // )
    }

    if (type === 'full' || type === 'free') {
      checks.push(
        runLighthouseCheck(baseParams),
        runPerformanceCheck(baseParams),
        runBrokenLinkCheck({ ...baseParams, type })
      )
    }

    await Promise.all(checks)

    // tmp notifications
    if (process.env.NOTIFICATION_ENABLED === 'true') {
      const newChecks = await db
        .collection('checks')
        .find({ websiteId: website._id, createdAt })
        .toArray();

      const failedChecks = newChecks.filter(c => c.result.status === 'fail');
      const failedMap = new Map((website.failedChecks || []).map(fc => [fc.check, fc]));
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
        await db.collection('websites').updateOne(
          { _id: website._id },
          { $set: { failedChecks: updatedFailedChecks } }
        );
      }

      if (notifications.length > 0) {
        console.log('sending notifications');
        await fetch(process.env.NTFY_URL, {
          method: 'POST',
          body: 'Error: ' + notifications.map(n => n.check).join(', ')
        })
      }
    }

    console.log('finished all checks')
  } catch (e) {
    console.error('unexpected error', e)
  }
}

export const runCustomFlow = async ({ flowId }) => {
  try {
    const db = await connectDB()

    const createdAt = new Date().toISOString()
    console.log(createdAt, `run custom flow for`, flowId)

    await runCustomChecks({ flowId, db, createdAt })

    console.log('finished custom flow')
  } catch (e) {
    console.error('unexpected error', e)
  }
}