import lighthouse from 'lighthouse';
import playwright from 'playwright'
import getPort from 'get-port';
import { createCheckResult } from '../db.js'

function parseAuditItem(item) {
  if (item.node) {
    const snippet = item.node.snippet || '(no snippet)';
    const selector = item.node.selector || item.node.path || '';
    return `${snippet} ${selector ? `(${selector})` : ''}`;
  } else {
    // Fallback for generic key-value objects
    const entry = Object.entries(item)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return entry;
  }
}

export const runLighthouseCheck = async ({ uri, db, userId, createdAt, quickcheckId }) => {
  const port = await getPort();
  console.log(`Running lighthouse check for ${uri} on port ${port}`)
  const browser = await playwright.chromium.launch({
    args: [`--remote-debugging-port=${port}`]
  });

  try {
    const options = {
      logLevel: 'error',
      output: 'html',
      port,
      onlyCategories: ['seo', 'accessibility'],
      settings: {
        throttlingMethod: 'provided',
        disableNetworkThrottling: true,
        disableCpuThrottling: true,
        disableScreenshots: true,
      },
    };
    const runnerResult = await lighthouse(uri, options);

    // `.report` is the HTML report as a string
    const report = runnerResult.lhr;
    const seoAudits = report.categories.seo;
    const seoResult = {
      status: (seoAudits.score * 100) > 90 ? 'success' : 'fail',
      details: {
        score: seoAudits.score * 100,
        items: []
      }
    }

    for (const auditRef of seoAudits.auditRefs) {
      const audit = report.audits[auditRef.id];
      if (audit.score === 1 || audit.scoreDisplayMode !== 'binary') continue;

      const auditElem = {
        title: audit.title,
        description: audit.description,
        items: []
      }

      const items = audit.details?.items || [];

      items.forEach((item) => {
        auditElem.items.push(parseAuditItem(item));
      });

      seoResult.details.items.push(auditElem);
    }

    const a11yCategory = report.categories.accessibility;

    const a11yResult = {
      status: (a11yCategory.score * 100) > 90 ? 'success' : 'fail',
      details: {
        score: a11yCategory.score * 100,
        items: []
      }
    }

    const a11yAudits = runnerResult.lhr.audits;
    const failedA11yAudits = Object.values(a11yAudits).filter(
      audit =>
        audit.scoreDisplayMode === 'binary' && // scored audit (not manual/informative)
        audit.score !== 1 // failed
    );

    failedA11yAudits.forEach(audit => {
      const auditElem = {
        title: audit.title,
        description: audit.description,
        items: []
      }

      const items = audit.details?.items || [];

      items.forEach((item) => {
        auditElem.items.push(parseAuditItem(item));
      });

      a11yResult.details.items.push(auditElem);
    });

    await Promise.all([
      createCheckResult({ db, userId, createdAt, check: 'seo', result: seoResult, quickcheckId }),
      createCheckResult({ db, userId, createdAt, check: 'a11y', result: a11yResult, quickcheckId }),
    ])
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close()
  }
}