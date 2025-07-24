import { LinkChecker } from 'linkinator';
import { createCheckResult } from '../db.js';

const fileRegex = /\.[a-z0-9]+([?#].*)?$/i;
const skipList = ['/error', '/presse', '/imprensa'] // todo dynamic
let crawlCount = 0;
const crawlLimit = 5000 // todo dynamic

export const runBrokenLinkCheck = async ({ uri, db, userId, createdAt }) => {
  const url = new URL(uri);
  const baseUrl = url.origin;
  const checker = new LinkChecker();

  const results = await checker.check({
    path: baseUrl,
    recurse: true,
    linksToSkip: (url) => {
      const isFile = fileRegex.test(url); // skip files
      const skip = skipList.some(skip => url.includes(skip));

      if (!skip && !isFile) {
        crawlCount++;
      }

      return Promise.resolve(skip || isFile || crawlCount >= crawlLimit);
    }
  });

  const result = {
    status: results.links.filter(r => r.status === 404 || r.status === 500).length > 0 ? 'fail' : 'success',
    details: results.links.filter(r => r.status === 404 || r.status === 500).map(l => ({
      url: l.url,
      status: l.status,
      parent: l.parent
    }))
  }

  await createCheckResult({ db, userId, createdAt, check: 'links', result })
}
