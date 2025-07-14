import 'dotenv/config'
import { connectDB, disconnectDB } from './db.js'
import { runFuzzCheck } from './checks/fuzz.js'
import { runHeaderCheck } from './checks/headers.js'
import { lighthouseCheck } from './checks/lighthouse.js'
import { performanceCheck } from './checks/performance.js'

try {
  const db = await connectDB()
  const users = await db.collection('users').find({}).toArray()

  for (const user of users) {
    const createdAt = new Date().toISOString()
    console.log(createdAt, 'run status check for', user.domain)
    await db.collection('users').updateOne(
      { _id: user._id },
      { $push: { checks: { created_at: createdAt, status: 'running' } } }
    );

    // await runFuzzCheck({ uri: user.domain, db, userId: user._id, createdAt })
    // await runHeaderCheck({ uri: user.domain, db, userId: user._id, createdAt })
    // await lighthouseCheck({ uri: user.domain, db, userId: user._id, createdAt })
    await performanceCheck({ uri: user.domain, db, userId: user._id, createdAt })

    // run other checks
    // SSL https://www.npmjs.com/package/node-ssllabs

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { 'checks.$[elem].status': 'done' } },
      { arrayFilters: [{ 'elem.created_at': createdAt }] }
    );
    console.log('finished all checks')
  }
} catch (e) {
  console.error('unexpected error', e)
} finally {
  await disconnectDB()
}