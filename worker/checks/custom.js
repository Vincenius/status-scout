import playwright from 'playwright'
import { createCheckResult } from '../db.js'

// https://chatgpt.com/c/6870d745-5aa8-8013-bc17-69fa16456d9a
export const runCustomChecks = async ({ uri, db, userId, createdAt }) => {
  // tmp
  await db.collection('flows').updateMany(
    { userId: ObjectId("6870ad94c49ffd667b661fca") },
    { $set: { userId: ObjectId("68766d00f4448410de717731") } }
  )


  const checks = await db.collection('flows').find({ userId }).toArray()
  console.log({ checks, userId })

  // migrate all userIds with 6870ad94c49ffd667b661fca -> 68766d00f4448410de717731

  if (checks.length) {
    const browser = await playwright.chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    try {
      const results = []
      for (const check of checks) {
        let errorMsg = null
        let stepIndex = 0
        for (const step of check.steps) {
          switch (step.type) {
            case 'goto':
              console.debug(`Navigating to ${step.url}`)
              await page.goto(step.url, { waitUntil: step.waitUntil || 'load' })
              break

            case 'click':
              console.debug(`Clicking ${step.selector}`)
              await page.click(step.selector, step.options || {})
              break

            case 'fill':
              console.debug(`Filling ${step.selector} with ${step.value}`)
              await page.fill(step.selector, step.value)
              break

            case 'type':
              console.debug(`Typing ${step.value} into ${step.selector}`)
              await page.type(step.selector, step.value, step.options || {})
              break

            case 'waitForSelector':
              console.debug(`Waiting for ${step.selector}`)
              await page.waitForSelector(step.selector, step.options || {})
              break

            case 'waitForTimeout':
              console.debug(`Waiting for ${step.timeout}ms`)
              await page.waitForTimeout(step.timeout)
              break

            case 'url': {
              console.debug(`Asserting URL ${step.url}`)
              const currentUrl = page.url()
              if (currentUrl !== step.url) {
                errorMsg = `Expected URL "${step.url}" but got "${currentUrl}"`
              }
              break
            }

            case 'expect': {
              console.debug(`Asserting ${step.selector}`)
              // Basic assertion on selector content or visibility
              const elementHandle = await page.$(step.selector)
              if (!elementHandle) {
                errorMsg = `Selector ${step.selector} not found`
                break
              }
              const text = await elementHandle.textContent()
              if (step.text && text.trim() !== step.text.trim()) {
                errorMsg = `Expected text "${step.text}" but got "${text}"`
              }
              if (step.visible !== undefined) {
                const isVisible = await elementHandle.isVisible()
                if (isVisible !== step.visible) {
                  errorMsg = `Expected visibility ${step.visible} but got ${isVisible}`
                }
              }
              break
            }

            case 'evaluate': {
              console.debug(`Evaluating ${step.script}`)
              // Safer: allow only strings or predefined functions
              if (typeof step.script === 'string') {
                const result = await page.evaluate(step.script)
                if (step.expect !== undefined && result !== step.expect) {
                  errorMsg = `Evaluate result mismatch: expected ${step.expect}, got ${result}`
                }
              } else if (typeof step.script === 'function') {
                const result = await page.evaluate(step.script)
                if (step.expect !== undefined && result !== step.expect) {
                  errorMsg = `Evaluate result mismatch: expected ${step.expect}, got ${result}`
                }
              } else {
                throw new Error('Invalid evaluate script. Must be string or function.')
              }
              break
            }

            default:
              console.warn(`Unknown step type: ${step.type}`)
          }

          if (errorMsg) {
            break
          }
        }

        results.push({
          name: check.name,
          result: {
            status: errorMsg ? 'fail' : 'success',
            details: {
              failedStep: errorMsg ? stepIndex : null,
              errorMsg
            }
          }
        })
      }

      await createCheckResult({ db, userId, createdAt, check: 'custom', result: results })
    } catch (err) {
      console.error(`Error fetching ${uri}:`, err.message);
    } finally {
      await browser.close()
    }
  }
}