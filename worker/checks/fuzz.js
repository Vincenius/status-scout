import fs from 'fs'
import path from 'path'
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
  const batches = splitIntoBatches(files, 30);
  const statusCodes = []
  let i = 0;
  for (const batch of batches) {
    console.debug(`Batch ${i++} of ${batches.length}`)
    const results = await Promise.all(
      batch.map(async (file) => {
        const filename = file.startsWith('/') ? file.slice(1) : file;
        const res = await fetch(`${uri}/${filename}`, { method: 'head' })
        return { status: res.status, file }
      })
    )
    statusCodes.push(...results)
  }

  const availableFiles = statusCodes.filter(sc => sc.status !== 404 && sc.status !== 403)
  const result = {
    status: availableFiles.length === 0 ? 'success' : 'fail',
    details: {
      files: availableFiles
    }, 
  }

  await createCheckResult({ db, userId, createdAt, check: 'fuzz', result })
}
