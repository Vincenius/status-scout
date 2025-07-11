import 'dotenv/config'
import { connectDB, disconnectDB } from './db.js'
import { runSecurityCheck } from './checks/security-check.js'

try {
  const db = await connectDB()
  const users = await db.collection('users').find({}).toArray()

  for (const user of users) {
    const createdAt = new Date().toISOString()
    console.log(createdAt, 'run status check for', user.domain)
    await db.collection('users').updateOne(
      { _id: user._id },
      { $push: { checks: { created_at: createdAt } } }
    );
    await runSecurityCheck({ uri: user.domain, db, userId: user._id, createdAt })
    // run other checks
    // audit: https://github.com/GoogleChrome/lighthouse
    // https://github.com/GoogleChrome/lighthouse/blob/main/docs/readme.md#using-programmatically
      // seo score
      // performance score
      // accessibility score
    // SSL https://www.npmjs.com/package/node-ssllabs


    console.log('finished all checks')
  }
} catch (e) {
  console.error('unexpected error', e)
} finally {
  await disconnectDB()
}