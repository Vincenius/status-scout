import playwright from 'playwright'
import { AxeBuilder } from '@axe-core/playwright';

export const run = async (errorCount) => {
    console.log(new Date().toISOString(), '- Running status check...')

    const browser = await playwright.chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    const failedTests = []

    // www redirect test
    await page.goto('https://onlogist.com/')
    if (page.url() !== 'https://www.onlogist.com/') {
        failedTests.push('www')
    }

    // plugins get initialized correctly
    await page.goto('https://www.onlogist.com')
    await page.waitForTimeout(3000);

    // Try to find and click cookie consent accept button
    const acceptSelectors = [
        '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
        '.accept-cookies',
        '[data-accept="all"]',
        '[aria-label*="accept"]',
    ];
    let accepted = false;

    for (const sel of acceptSelectors) {
        const btn = await page.$(sel);
        if (btn) {
            await btn.click();
            accepted = true;
            break;
        }
    }

    if (!accepted) {
        console.log("⚠️ Could not find accept button — adjust selector.");
    } else {
        // Wait for plugins to initialize
        await page.waitForTimeout(3000);
    }

    const pluginResults = await page.evaluate(() => {
        const checks = {
            "Cookiebot (CTM)": () => !!window.Cookiebot || !!window.CookiebotCallback,
            "Google Analytics": () => {
                if (typeof window.ga === "function") {
                    return window.ga.getAll && window.ga.getAll().length > 0;
                }
                if (typeof window.gtag === "function") {
                    return true; // gtag defined
                }
                return false;
            },
            "Facebook Pixel": () => {
                if (typeof window.fbq.getState === "function") {
                    const pixels = window.fbq.getState().pixels || [];
                    return pixels.length > 0;
                }
                return false;
            },
            "Bing Ads Conversion": () => {
                return typeof window.uetq !== "undefined" &&
                    Array.isArray(window.uetq) &&
                    window.uetq.length > 0;
            },
            "Microsoft Clarity": () => {
                return typeof window.clarity === "function";
            },
        };
        const results = {};
        for (const [name, fnStr] of Object.entries(checks)) {
            try {
                results[name] = eval(`(${fnStr.toString()})`)();
            } catch {
                results[name] = false;
            }
        }
        return results;
    });

    for (const [plugin, result] of Object.entries(pluginResults)) {
        if (!result) {
            failedTests.push(`${plugin} not initialized correctly`)
            console.log(`${plugin}: ${result ? "✅ Initialized correctly" : "❌ Not initialized correctly"}`);
        }
    }

    // homepage works
    const text = await page.innerText('body')
    if (!text.includes('Europäischer Marktführer für Fahrzeugüberführungen')) {
        failedTests.push('home')
    } else {
        const results = await new AxeBuilder({ page }).analyze()
        const violations = results.violations.filter(v => !v.nodes.every(n => n.html.includes('Cookiebot')));
        if (violations > 0) {
            violations.forEach(violation => console.log(violation));
            failedTests.push('accessibility-home')
        }
    }

    // landingpage works
    await page.goto('https://www.onlogist.com/fahrzeugueberfuehrung')
    const text2 = await page.innerText('body')
    if (!text2.includes('Fahrzeuge überführen')) {
        failedTests.push('landing')
    } else {
        const results = await new AxeBuilder({ page }).analyze()
        const violations = results.violations.filter(v => !v.nodes.every(n => n.html.includes('Cookiebot')));
        if (violations > 0) {
            violations.forEach(violation => console.log(violation));
            failedTests.push('accessibility-landing')
        }
    }

    // panel (site with no cloudfront cache) works
    await page.goto('https://www.onlogist.com/panel')
    const text3 = await page.innerText('body')
    if (!text3.includes('Anmelden')) {
        failedTests.push('panel')
    }

    // check if robots.txt is correct
    await page.goto('https://www.onlogist.com/robots.txt')
    const text4 = await page.innerText('body')
    if (!text4.includes('disallow: /kirby/') || !text4.includes('sitemap: https://www.onlogist.com/sitemap.xml')) {
        failedTests.push('robots')
    }

    if (failedTests.length > 0) {
        console.log(new Date().toISOString(), '- Tests failed: ' + failedTests.join(', '))

        // only trigger on two errors in a row
        // (ignore single error because it occassionally happens because of bad connection)
        // only send the notification on the second error and ignore the once afterward to prevent spam.
        errorCount++;
        if (errorCount === 2) {
            await fetch('https://ntfy.sh/www-onlogist-monitoring', {
                method: 'POST', // PUT works too
                body: 'Error: ' + failedTests.join(', ')
            })
        }
    } else {
        errorCount = 0; // reset the error count once it has been fixed
        console.log(new Date().toISOString(), '- All Tests passed')
    }

    await browser.close()
}