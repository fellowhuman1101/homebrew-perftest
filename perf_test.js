const puppeteer = require('puppeteer');
const url = process.env.URL || 'https://www.example.com/';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const requestCount = [];
    let type;
    try {
        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {

            type = interceptedRequest.resourceType()
            if (type === 'xhr' || type === 'fetch') {
                requestCount.push({
                    url: interceptedRequest.url(),
                    type: interceptedRequest.resourceType()
                })
            }
            interceptedRequest.continue();
        });

        await page.goto(url, {
            waitUntil: 'networkidle2'
        });

        const perfMetrics = await page.metrics();
        const res = JSON.stringify({
            metrics: perfMetrics,
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