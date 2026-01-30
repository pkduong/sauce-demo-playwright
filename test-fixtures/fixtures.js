const { test: base } = require("@playwright/test");

const { LoginPage } = require("../pages/LoginPage");
const { ProductsPage } = require("../pages/ProductsPage");
const { CartPage } = require("../pages/CartPage");
const creds = require("../data/credentials.json");

/**
 * Professional error-handling fixtures:
 * - Collect console logs / page errors / request failures
 * - Auto-attach artifacts on failure: url + screenshot + DOM + logs
 * - Inject testInfo into Page Objects so BasePage.withAction() can auto-attach on action failures
 */
const test = base.extend({
    // Override page fixture to install collectors and attach artifacts on failure
    page: async ({ page }, use, testInfo) => {
        const consoleLogs = [];
        const pageErrors = [];
        const requestFailed = [];

        const onConsole = (msg) => {
            // Keep it readable on CI: [type] text
            consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
        };
        const onPageError = (err) => {
            pageErrors.push(String(err));
        };
        const onRequestFailed = (request) => {
            const failure = request.failure();
            requestFailed.push(
                `[${request.method()}] ${request.url()} :: ${failure?.errorText || "requestfailed"}`
            );
        };

        page.on("console", onConsole);
        page.on("pageerror", onPageError);
        page.on("requestfailed", onRequestFailed);

        await use(page);

        // Teardown: attach artifacts only when test failed
        const failed = testInfo.status !== testInfo.expectedStatus;
        if (failed && page && !page.isClosed()) {
            // URL (super useful when the error is vague)
            await testInfo.attach("failure-url", {
                body: Buffer.from(page.url()),
                contentType: "text/plain",
            });

            // Screenshot
            await testInfo.attach("failure-screenshot", {
                body: await page.screenshot({ fullPage: true }),
                contentType: "image/png",
            });

            // DOM snapshot (often more useful than screenshot for debugging locators)
            try {
                const html = await page.content();
                await testInfo.attach("failure-dom", {
                    body: Buffer.from(html),
                    contentType: "text/html",
                });
            } catch (e) {
                // ignore if page is navigating/closed unexpectedly
            }

            // Logs
            const clamp = (arr, max = 200) => arr.slice(-max).join("\n");

            if (consoleLogs.length) {
                await testInfo.attach("failure-console", {
                    body: Buffer.from(clamp(consoleLogs)),
                    contentType: "text/plain",
                });
            }

            if (pageErrors.length) {
                await testInfo.attach("failure-pageerror", {
                    body: Buffer.from(clamp(pageErrors)),
                    contentType: "text/plain",
                });
            }

            if (requestFailed.length) {
                await testInfo.attach("failure-requestfailed", {
                    body: Buffer.from(clamp(requestFailed)),
                    contentType: "text/plain",
                });
            }
        }

        // Cleanup listeners (good practice even though page will be disposed)
        page.off("console", onConsole);
        page.off("pageerror", onPageError);
        page.off("requestfailed", onRequestFailed);
    },

    loginPage: async ({ page }, use, testInfo) => {
        await use(new LoginPage(page, testInfo));
    },

    productsPage: async ({ page }, use, testInfo) => {
        await use(new ProductsPage(page, testInfo));
    },

    cartPage: async ({ page }, use, testInfo) => {
        await use(new CartPage(page, testInfo));
    },

    // Fixture loggedIn to be used in tests needing a logged-in user
    loggedIn: async ({ loginPage, productsPage, page }, use) => {
        await loginPage.open();
        await loginPage.login(creds.standard.username, creds.standard.password);

        await productsPage.waitUntilReady();

        await use(page);
    },
});

module.exports = { test };
