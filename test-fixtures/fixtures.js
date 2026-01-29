const { test: base } = require("@playwright/test");

const { LoginPage } = require("../pages/LoginPage");
const { ProductsPage } = require("../pages/ProductsPage");
const { CartPage } = require("../pages/CartPage");
const creds = require("../data/credentials.json");

const test = base.extend({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    productsPage: async ({ page }, use) => {
        await use(new ProductsPage(page));
    },

    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },

    // Fixture loggedIn to be used in tests needing a logged-in user
    loggedIn: async ({ loginPage, productsPage, page }, use) => {
        await loginPage.open();
        await loginPage.login(creds.standard.username, creds.standard.password);

        await productsPage.waitForProductPage();

        await use(page);
    }

});

test.afterEach(async ({ page }, testInfo) => {
    if (
        testInfo.status !== testInfo.expectedStatus &&
        page && !page.isClosed()
    ) {
        await testInfo.attach("Failure screenshot", {
            body: await page.screenshot(),
            contentType: "image/png",
        });
    }
});


module.exports = { test };
