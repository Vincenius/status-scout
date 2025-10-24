// a helper to test functions without running the whole worker

import 'dotenv/config'
import { connectDB, disconnectDB } from './db.js'
// import { runDailyNotification } from './notification.js';
import runSubfinder from './utils/runSubfinder.js';
import { runDnsCheck } from './checks/dns.js';
import { ObjectId } from 'mongodb';

const run = async () => {
  try {
    // const db = await connectDB()
    // const website = await db.collection('websites').findOne({ _id: new ObjectId('68c98b135ada929388e21a91') })
    // await runDnsCheck({
    //   db,
    //   uri: website.domain,
    // });
    // const test = await runSubfinder('statusscout.dev')
    console.log(test)
  } catch (e) {
    console.error('Error running test:', e);
  } finally {
    await disconnectDB();
  }
}

run()