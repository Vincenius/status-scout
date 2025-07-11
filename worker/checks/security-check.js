import fs from 'fs'
import path from 'path'
import { updateCheck } from '../db.js'

// async function checkSecurityHeaders(url) {
//     const recommendedHeaders = {
//         'content-security-policy': 'Content-Security-Policy',
//         'strict-transport-security': 'Strict-Transport-Security',
//         'x-content-type-options': 'X-Content-Type-Options',
//         'x-frame-options': 'X-Frame-Options',
//         'x-xss-protection': 'X-XSS-Protection',
//         'referrer-policy': 'Referrer-Policy',
//         'permissions-policy': 'Permissions-Policy',
//         'cross-origin-resource-policy': 'Cross-Origin-Resource-Policy',
//         'cross-origin-opener-policy': 'Cross-Origin-Opener-Policy',
//         'cross-origin-embedder-policy': 'Cross-Origin-Embedder-Policy'
//     };

//     try {
//         const res = await fetch(url, { redirect: 'follow' });
//         const headers = res.headers.raw();

//         console.log(`\n🔍 Security header check for: ${url}\n`);

//         Object.entries(recommendedHeaders).forEach(([key, name]) => {
//             const header = headers[name.toLowerCase()];
//             if (header) {
//                 console.log(`✅ ${name}: ${header.join('; ')}`);
//             } else {
//                 console.warn(`⚠️  Missing header: ${name}`);
//             }
//         });

//         console.log('\nCheck complete.\n');

//     } catch (err) {
//         console.error(`Error fetching ${url}:`, err.message);
//     }
// }


function splitIntoBatches(arr, batchSize) {
  let result = [];
  
  for (let i = 0; i < arr.length; i += batchSize) {
    result.push(arr.slice(i, i + batchSize));
  }
  
  return result;
}

export const runSecurityCheck = async ({ uri, db, userId, createdAt }) => {
  const fuzzPath = path.join(process.cwd(), 'checks/fuzz.txt')
  const fuzzFile = fs.readFileSync(fuzzPath).toString() // https://github.com/Bo0oM/fuzz.txt
  const files = fuzzFile.split('\n')
  // split into batches
  const batches = splitIntoBatches(files, 30);
  const statusCodes = []
  let i = 0;
  for (const batch of batches) {
    console.log(`Batch ${i++} of ${batches.length}`)
    const results = await Promise.all(
      batch.map(async (file) => {
        const filename = file.startsWith('/') ? file.slice(1) : file;
        const res = await fetch(`${uri}/${filename}`, { method: 'head' })
        return { status: res.status, file }
      })
    )
    statusCodes.push(...results)
    if (i > 5) {
      break; // for debugging
    }
  }

  const availableFiles = statusCodes.filter(sc => sc.status !== 404 && sc.status !== 403)
  // TODO checkSecurityHeaders('https://example.com');
  const result = {
    status: availableFiles.length === 0 ? 'success' : 'fail',
    details: {
      files: availableFiles
    }, 
  }

  await updateCheck({ db, userId, createdAt, check: 'security', result })
}
