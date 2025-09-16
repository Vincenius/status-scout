import { run } from './index.js';

const jobData = JSON.parse(process.env.JOB_DATA);

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
