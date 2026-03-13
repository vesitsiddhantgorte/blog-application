const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function test() {
    let options = new chrome.Options();
    options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    let passed = 0;
    let failed = 0;

    async function runTest(name, fn) {
        try {
            await fn();
            console.log(`✅ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`❌ FAIL: ${name} — ${err.message}`);
            failed++;
        }
    }

    try {
        await driver.get('http://localhost:8000');
        await driver.wait(until.elementLocated(By.css('body')), 5000);

        // Always print the page title immediately after page loads
        let title = await driver.getTitle();
        console.log("Page Title:", title);

        // Test 1: Check page title contains expected keyword
        await runTest('Page title contains "Homepage" or "Blog"', async () => {
            if (!title.includes("Blog") && !title.includes("Homepage")) {
                throw new Error(`Unexpected title: "${title}"`);
            }
        });

        // Test 2: Check "Published Blogs" heading is visible
        await runTest('"Published Blogs" heading is visible', async () => {
            let heading = await driver.wait(
                until.elementLocated(By.xpath("//*[contains(text(), 'Published Blogs')]")),
                5000
            );
            let isDisplayed = await heading.isDisplayed();
            if (!isDisplayed) throw new Error('"Published Blogs" heading not displayed');
        });

        // Test 3: Check if blog cards are present on the page
        await runTest('Blog cards are present on the page', async () => {
            let cards = await driver.findElements(By.css('.card'));
            console.log(`   Found ${cards.length} blog card(s)`);
            if (cards.length === 0) throw new Error('No blog cards found on the page');
        });

        // Test 4: Check each visible blog card has a "View Blog" link
        await runTest('Blog cards have "View Blog" links', async () => {
            let viewLinks = await driver.findElements(By.xpath("//a[contains(text(), 'View Blog')]"));
            console.log(`   Found ${viewLinks.length} "View Blog" link(s)`);
            if (viewLinks.length === 0) throw new Error('No "View Blog" links found');
        });

    } catch (err) {
        console.error("❌ Unexpected error:", err.message);
        failed++;
    } finally {
        await driver.quit();
    }

    console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
    console.log("TEST FILE RUNNING...");

    if (failed > 0) process.exit(1);
})();