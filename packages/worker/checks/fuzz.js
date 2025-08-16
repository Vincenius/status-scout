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

export const runFuzzCheck = async ({ uri, db, userId, createdAt, type, quickcheckId }) => {
  console.log(`Running fuzz check for ${uri}`)
  const [prevCheck] = await db.collection('checks')
    .find({ check: 'fuzz' })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  const prevFiles = (prevCheck?.result?.details?.files || []).map(f => f.file)
  const file = type === 'full' ? 'fuzz_all.txt' : 'fuzz_base.txt' // https://github.com/Bo0oM/fuzz.txt
  const fuzzPath = path.join(process.cwd(), `checks/${file}`)
  const fuzzFile = fs.readFileSync(fuzzPath).toString()
  const fuzzFiles = fuzzFile.split('\n')
  const files = [...new Set([...fuzzFiles, ...prevFiles])]

  // split into batches
  const limit = pLimit(20); // max 10 concurrent requests
  const promises = files.map(file =>
    limit(async () => {
      try {
        const filename = file.startsWith('/') ? file.slice(1) : file;
        const res = await fetch(`${uri}/${filename}`, { method: 'head' });
        return { status: res.status, file };
      } catch (err) {
        return { status: 500, file };
      }
    })
  );

  const results = await Promise.all(promises);

  const availableFiles = results.filter(sc => sc.status === 200) // todo warn on other codes like [401, 403, 405, 301, 302];
  const result = {
    status: availableFiles.length === 0 ? 'success' : 'fail',
    details: {
      files: availableFiles
    },
  }

  await createCheckResult({ db, userId, createdAt, check: 'fuzz', result, quickcheckId })
}
