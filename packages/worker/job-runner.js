import { run, runCustomFlow, runNotification } from './index.js';

const jobData = JSON.parse(process.env.JOB_DATA);

if (jobData.type === 'custom-flow' && jobData.flowId) {
  // custom flow execution
  runCustomFlow({
    id: jobData.id,
    type: jobData.type,
    flowId: jobData.flowId
  })
    .then(() => {
      process.send?.({ status: 'done' });
      process.exit(0);
    })
    .catch((err) => {
      process.send?.({ status: 'error', error: err.message });
      process.exit(1);
    });
} else if (jobData.type === 'daily-notification' && jobData.websiteId) {
  // daily notification execution
  runNotification({
    websiteId: jobData.websiteId
  }).then(() => {
      process.send?.({ status: 'done' });
      process.exit(0);
    })
    .catch((err) => {
      process.send?.({ status: 'error', error: err.message });
      process.exit(1);
    });
} else {
  // regular check
  run({
    id: jobData.id,
    type: jobData.type,
    websiteId: jobData.websiteId,
    quickcheckId: jobData.quickcheckId,
    url: jobData.url
  })
    .then(() => {
      process.send?.({ status: 'done' });
      process.exit(0);
    })
    .catch((err) => {
      process.send?.({ status: 'error', error: err.message });
      process.exit(1);
    });
}
