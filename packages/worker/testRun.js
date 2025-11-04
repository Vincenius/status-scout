// a helper to test functions without running the whole worker

import 'dotenv/config'
import { connectDB, disconnectDB } from './db.js'
import { runDailyNotification, runNotifications } from './notification.js';
import runSubfinder from './utils/runSubfinder.js';
import runSubzy from './utils/runSubzy.js';
import { runDnsCheck } from './checks/dns.js';
import { ObjectId } from 'mongodb';

const run = async () => {
  try {
    const db = await connectDB()
    const website = await db.collection('websites').findOne({ _id: new ObjectId('68fbd32f604ef22b37a051fe') })
    // console.log(website)
    // await runDailyNotification({ db, website })
    // await runDnsCheck({
    //   db,
    //   uri: website.domain,
    //   websiteId: website._id,
    // });
    // const test = await runSubfinder('statusscout.dev')
    // await runDailyNotification({ db, website })
    // runSubzy('test.statusscout.dev').then(issues => {
    //   console.log('Subzy issues found:', issues);
    // }).catch(err => {
    //   console.error('Error running Subzy:', err);
    // });
  } catch (e) {
    console.error('Error running test:', e);
  } finally {
    await disconnectDB();
  }
}

run()