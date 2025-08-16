import { createCheckResult } from '../db.js'

// https://chatgpt.com/c/6870d745-5aa8-8013-bc17-69fa16456d9a
export const runHeaderCheck = async ({ uri, db, userId, createdAt, quickcheckId }) => {
  console.log(`Running header check for ${uri}`)
  const recommendedHeaders = [
    'content-security-policy',
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy',
    'permissions-policy',
    'cross-origin-resource-policy',
    'cross-origin-opener-policy',
    'cross-origin-embedder-policy'
  ];

  try {
    const res = await fetch(uri, { redirect: 'follow' });
    const headers = {};

    // convert Headers to plain object (lowercased keys)
    for (const [key, value] of res.headers.entries()) {
      headers[key.toLowerCase()] = value;
    }

    const missingHeaders = []
    recommendedHeaders.forEach(name => {
      if (!headers[name]) {
        missingHeaders.push(name)
      }
    });

    const result = {
      status: missingHeaders.length === 0 ? 'success' : 'fail',
      details: {
        missingHeaders
      },
    }
    await createCheckResult({ db, userId, createdAt, check: 'headers', result, quickcheckId })
  } catch (err) {
    console.error(`Error fetching ${uri}:`, err.message);
  }
}
