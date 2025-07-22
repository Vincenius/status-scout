import sslChecker from 'ssl-checker';
import { createCheckResult } from '../db.js';

const getHostFromUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch (error) {
    console.error('Invalid URL:', error.message);
    return null;
  }
};

export const runSslCheck = async ({ uri, db, userId, createdAt }) => {
  const sslResult = await sslChecker(getHostFromUrl(uri), { method: 'GET', port: 443 });
  const result = {
    status: sslResult.valid ? 'success' : 'fail',
    details: sslResult
  }

  await createCheckResult({ db, userId, createdAt, check: 'ssl', result })
}
