import lighthouse from 'lighthouse';
import playwright from 'playwright'
import { createCheckResult } from '../db.js'

// todo use pagespeed insighst for performance & lighthouse for seo and a11y
// https://developers.google.com/speed/docs/insights/v5/get-started -> use this instead

function parseAuditItem(item, index) {
  if (item.node) {
    const snippet = item.node.snippet || '(no snippet)';
    const selector = item.node.selector || item.node.path || '';
    return `${index + 1}. ${snippet} ${selector ? `(${selector})` : ''}`;
  } else {
    // Fallback for generic key-value objects
    const entry = Object.entries(item)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return `${index + 1}. ${entry}`;
  }
}

export const runLighthouseCheck = async ({ uri, db, userId, createdAt }) => {
  const browser = await playwright.chromium.launch({
    args: ['--remote-debugging-port=9222']
  });

  try {
    const debuggingPort = 9222;

    const options = {
      logLevel: 'info',
      output: 'html',
      port: debuggingPort,
      onlyCategories: ['seo', 'accessibility'],
      settings: {
        throttlingMethod: 'provided', // disables network & CPU throttling
        disableNetworkThrottling: true,
        disableCpuThrottling: true,
        // optionally disable screenshots too
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

      items.forEach((item, i) => {
        auditElem.items.push(parseAuditItem(item, i));
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

      items.forEach((item, i) => {
        auditElem.items.push(parseAuditItem(item, i));
      });

      a11yResult.details.items.push(auditElem);
    });

    await Promise.all([
      createCheckResult({ db, userId, createdAt, check: 'seo', result: seoResult }),
      createCheckResult({ db, userId, createdAt, check: 'a11y', result: a11yResult }),
    ])
    console.debug(`Finished lighthouse check for ${uri}`);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close()
  }
}