import fs from 'fs'
import path from 'path'
import pLimit from 'p-limit';
import { createCheckResult } from '../db.js'

function splitIntoBatches(arr, batchSize) {
  let result = [];

  for (let i = 0; i < arr.length; i += batchSize) {
    result.push(arr.slice(i, i + batchSize));
  }

  return result;
}

export const runFuzzCheck = async ({ uri, db, userId, createdAt }) => {
  const fuzzPath = path.join(process.cwd(), 'checks/fuzz_base.txt') // TODO _all
  const fuzzFile = fs.readFileSync(fuzzPath).toString() // https://github.com/Bo0oM/fuzz.txt
  const files = fuzzFile.split('\n')
  // split into batches

  const limit = pLimit(20); // max 10 concurrent requests
  const promises = files.map(file =>
    limit(async () => {
      try {
        const filename = file.startsWith('/') ? file.slice(1) : file;
        const res = await fetch(`${uri}/${filename}`, { method: 'head' });
        return { status: res.status, file };
      } catch (err) {
        console.log('fetch error', file, err)
        return { status: 500, file };
      }
    })
  );

  const results = await Promise.all(promises);

  const availableFiles = results.filter(sc => sc.status !== 404 && sc.status !== 403)
  const result = {
    status: availableFiles.length === 0 ? 'success' : 'fail',
    details: {
      files: availableFiles
    },
  }

  await createCheckResult({ db, userId, createdAt, check: 'fuzz', result })
}
