import playwright from 'playwright'
import { ObjectId } from 'mongodb'
import { createCheckResult } from '../db.js'

export const runCustomChecks = async ({ uri, id, db, websiteId, flowId, createdAt, quickcheckId }) => {
  console.log(`Running custom checks${uri ? ` for ${uri}` : ''}${flowId ? ` with flow ${flowId}` : ''}`)
  const browser = await playwright.chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    const checks = flowId
      ? await db.collection('flows').find({ _id: new ObjectId(flowId) }).toArray()
      : await db.collection('flows').find({ websiteId: websiteId.toString() }).toArray()

    const results = []

    if (checks.length) {
      for (const check of checks) {
        const stepResults = []

        for (const step of check.steps) {
          let errorMsg = null

          switch (step.type) {
            case 'goto': {
              // step.values[0]: url
              await page.goto(step.values[0], { waitUntil: 'load' })
              break;
            }
            case 'click': {
              // step.values[0]: selector
              await page.click(step.values[0]);
              break;
            }
            case 'fill': {
              // step.values[0]: selector, step.values[1]: value
              await page.fill(step.values[0], step.values[1]);
              break;
            }
            case 'type': {
              // step.values[0]: text
              await page.keyboard.type(step.values[0]);
              break;
            }
            case 'waitForSelector': {
              // step.values[0]: selector
              await page.waitForSelector(step.values[0]);
              break;
            }
            case 'waitForTimeout': {
              // step.values[0]: timeout (ms)
              await page.waitForTimeout(Number(step.values[0]));
              break;
            }
            case 'url': {
              // step.values[0]: expected url
              const currentUrl = page.url();
              if (currentUrl !== step.values[0]) {
                errorMsg = `Expected URL "${step.values[0]}" but got "${currentUrl}"`;
              }
              break;
            }
            case 'expect': {
              // step.values[0]: selector, step.values[1]: expected text, step.values[3]: visible
              const elementHandle = await page.$(step.values[0]);
              if (!elementHandle) {
                errorMsg = `Selector ${step.values[0]} not found`;
                break;
              }
              if (step.values[1]) {
                const text = await elementHandle.textContent();
                if (text.trim() !== step.values[1].trim()) {
                  errorMsg = `Expected text "${step.values[1]}" but got "${text}"`;
                }
              }
              if (step.values[3] !== undefined) {
                const isVisible = await elementHandle.isVisible();
                const expectedVisible = step.values[3] === 'true';
                if (isVisible !== expectedVisible) {
                  errorMsg = `Expected visibility ${expectedVisible} but got ${isVisible}`;
                }
              }
              break;
            }
            case 'evaluate': {
              // step.values[0]: JS code
              let result;
              try {
                result = await page.evaluate(step.values[0]);
              } catch (e) {
                errorMsg = `Evaluate error: ${e.message}`;
                break;
              }
              if (result !== true) {
                errorMsg = `Evaluate result mismatch: expected true, got ${result}`;
              }
              break;
            }
            default:
              console.warn(`Unknown step type: ${step.type}`);
          }

          if (errorMsg) {
            stepResults.push({ ...step, success: false, error: errorMsg })
            console.log('error in step', step, errorMsg)
            break
          } else {
            stepResults.push({ ...step, success: true })
            console.log('step succeeded', step)
          }
        }

        const result = {
          status: stepResults.some(result => !result.success) ? 'fail' : 'success',
          name: check.name,
          details: {
            steps: stepResults,
          }
        }

        console.log('YOYO', check._id, { id })

        await createCheckResult({ id, websiteId, createdAt, check: 'custom', result, quickcheckId, flowId: check._id.toString() })
        await db.collection('flows').updateOne(
          { _id: check._id },
          { $set: { lastCheckId: id } }
        )
      }
    }
  }
  catch (err) {
    console.error(`Error on custom check:`, err.message);
  } finally {
    await browser.close()
  }
}