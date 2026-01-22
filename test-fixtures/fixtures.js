const { test: base } = require("@playwright/test");

const { LoginPage } = require("../pages/LoginPage");
const { ProductsPage } = require("../pages/ProductsPage");
const { CartPage } = require("../pages/CartPage");
const creds = require("../data/credentials.json");

const test = base.extend({
    loginpage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    productsPage: async ({ page }, use) => {
        await use(new ProductsPage(page));
    },

    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },

    //logged-in state fixture
    // Fixture loggedIn đảm bảo vào test là đã login xong.
    loggedIn: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.open();
        await loginPage.login(creds.standard.username, creds.standard.password);

        const productsPage = new ProductsPage(page);
        await productsPage.assertLoggedIn();

        await use(page);
    }

});

module.exports = { test };
