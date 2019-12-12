const puppeteer = require('puppeteer');
const url = process.env.URL || 'https://www.example.com/';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const requestCount = [];
    let type;
    try {
        page.on('response', theResponse => {
            type = theResponse.request().resourceType()
            if (type === 'xhr' || type === 'fetch') {
                requestCount.push({
                    url: theResponse.url(),
                    type
                })
            }

        });
        await page.goto(url, {
            waitUntil: 'networkidle2'
        });
        const performanceTiming = JSON.parse(
            await page.evaluate(() => JSON.stringify(window.performance.timing))
        );

        const perfMetrics = await page.metrics();
        const res = JSON.stringify({
            metrics: perfMetrics,
            performanceTiming,
            xhr_fetch: {
                count: requestCount.length,
                urls: requestCount
            }
        });
        console.log(res);
        await browser.close();
    } catch (err) {
        console.log('Error loading page:', err);
        await browser.close();
    }
})();
