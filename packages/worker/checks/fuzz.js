import fs from 'fs'
import path from 'path'
import pLimit from 'p-limit';
import { createCheckResult } from '../db.js'

export const runFuzzCheck = async ({ uri, id, db, websiteId, createdAt, type, quickcheckId }) => {
  console.log(`Running fuzz check for ${uri}`)
  const [prevCheck] = await db.collection('checks')
    .find({ check: 'fuzz' })
    .sort({ createdAt: -1 })
    .limit(1)
    .toArray();

  const prevFiles = (prevCheck?.result?.details?.files || []).map(f => f.file)
  const file = type === 'full' ? 'fuzz_all.txt' : 'fuzz_base.txt' // https://github.com/Bo0oM/fuzz.txt
  const fuzzPath = path.join(process.cwd(), `utils/${file}`)
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
        if (res.status === 200) {
          const contentRes = await fetch(`${uri}/${filename}`);
          const text = await contentRes.text();
          return { status: 200, file, hasContent: text.trim().length > 0 };
        }
        return { status: res.status, file };
      } catch (err) {
        return { status: 500, file };
      }
    })
  );

  const results = await Promise.all(promises);

  const filesWithContent = results.filter(sc => sc.status === 200 && sc.hasContent);
  const result = {
    status: filesWithContent.length === 0 ? 'success' : 'fail',
    details: {
      files: filesWithContent
    },
  }

  await createCheckResult({ id, websiteId, createdAt, check: 'fuzz', result, quickcheckId })
}
