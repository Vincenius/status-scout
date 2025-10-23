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
import { runDnsCheck } from './checks/dns.js'
import { ObjectId } from 'mongodb'
import { runNotifications, runDailyNotification } from './notification.js'

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
      runSslCheck(baseParams),
      runDnsCheck(baseParams),
    ]

    if (type === 'extended' || type === 'full' || type === 'free') {
      checks.push(
        runFuzzCheck({ ...baseParams, type }),
      )
    }

    if (type === 'full' || type === 'extended') {
      checks.push(
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

    console.log('finished all checks')

    // todo check if not manual trigger
    await runNotifications({ db, website, check: type })
  } catch (e) {
    console.error('unexpected error', e)
  }
}

export const runCustomFlow = async ({ flowId, id }) => {
  try {
    const db = await connectDB()

    const createdAt = new Date().toISOString()
    console.log(createdAt, `run custom flow for`, flowId)

    await runCustomChecks({ flowId, db, createdAt, id })

    console.log('finished custom flow')
  } catch (e) {
    console.error('unexpected error', e)
  }
}

export const runNotification = async ({ websiteId }) => {
  try {
    const db = await connectDB()
    const [website] = await db.collection('websites').find({ _id: new ObjectId(websiteId) }).toArray()

    console.log('running daily notifications for', website.domain)

    await runDailyNotification({ db, website })

    console.log('finished daily notifications for', website.domain)
  } catch (e) {
    console.error('unexpected error', e)
  }
}