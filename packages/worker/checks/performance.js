import { createCheckResult } from "../db.js";

const fetchPageSpeedData = (url) => new Promise((resolve, reject) => {
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const loadingExp = data?.loadingExperience?.metrics;
      const coreVitals = {
        LCP: loadingExp?.LARGEST_CONTENTFUL_PAINT_MS,
        INP: loadingExp?.INTERACTION_TO_NEXT_PAINT,
        CLS: loadingExp?.CUMULATIVE_LAYOUT_SHIFT_SCORE
      };

      resolve(coreVitals);
    })
    .catch(err => {
      console.error(err);
      reject(err);
    });
})

export const runPerformanceCheck = async ({ uri, id, websiteId, createdAt, quickcheckId, type }) => {
  console.log(`Running performance check for ${uri}`)

  if (!process.env.GOOGLE_PAGESPEED_API_KEY) {
    console.warn('GOOGLE_PAGESPEED_API_KEY is not set, skipping performance check');
    return;
  }

  const mobileUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${uri}&strategy=mobile&key=${process.env.GOOGLE_PAGESPEED_API_KEY}`;
  const desktopUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${uri}&strategy=desktop&key=${process.env.GOOGLE_PAGESPEED_API_KEY}`;

  const [mobileResult, desktopResult] = await Promise.all([
    fetchPageSpeedData(mobileUrl),
    fetchPageSpeedData(desktopUrl)
  ])

  const result = {
    status:
      Object.values(mobileResult).every(metric => metric?.category === 'FAST') &&
        Object.values(desktopResult).every(metric => metric?.category === 'FAST') ? 'success' : 'fail',
    details: {
      mobileResult,
      desktopResult
    },
  }

  await createCheckResult({ id, websiteId, createdAt, check: 'performance', result, quickcheckId, type })
}
