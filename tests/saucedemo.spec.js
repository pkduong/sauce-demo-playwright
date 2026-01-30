// Covers requirement steps:
// - Open site, login
// - Verify Products page
// - Get all products with name + price
// - Add a product, verify cart quantity
// - On Cart page verify quantity/description and buttons enabled
// - Remove product and verify cart numbers

const { expect } = require("@playwright/test");
const { test } = require("../test-fixtures/fixtures");

const creds = require("../data/credentials.json");

test.describe("@demo SauceDemo - Login + Cart flow (POM)", () => {
    test('debug config playwright: testIdAttribute = data-test', async ({ page }, testInfo) => {
        console.log('testIdAttribute =', testInfo.project.use.testIdAttribute);
        expect(testInfo.project.use.testIdAttribute).toBe('data-test');
    });

    test("should login, list products, add/remove cart item, verify cart UI",
        async ({ loginPage, productsPage, cartPage }) => {

            await test.step("Open website", async () => {
                await loginPage.open();
            });

            await test.step("Login with Json credentials", async () => {
                const { username, password } = creds.standard;
                await loginPage.login(username, password);
            });

            await test.step("Verify successful login (Products page visible)", async () => {
                await productsPage.waitForProductListPage();

                const title = await productsPage.getPageTitle();
                expect.soft(title, "[UI][PRODUCTS] Title should display 'Products'").toMatch(/Products/i);
            });

            await test.step("Get all products with ProductName and Price", async () => {
                const products = await productsPage.listProducts();

                expect.soft(products.length, "[LIST] Products list should not be empty").toBeGreaterThan(0);
                expect.soft(products[0], "[LIST] Product item should contain property: name").toHaveProperty("name");
                expect.soft(products[0], "[LIST] Product item should contain property: price").toHaveProperty("price");
            });

            await test.step("Add a product to cart and verify cart quantity", async () => {
                await productsPage.addToCartByNameContains("Sauce Labs Backpack");

                const cartCount = await productsPage.getCartCount();
                expect.soft(cartCount, "[HEADER] Cart badge should increase to 1 after adding product").toBe(1);
            });

            await test.step("Go to cart and verify cart UI snapshot", async () => {
                await productsPage.openCart();
                await cartPage.waitForCartPage();

                const cartTitle = await cartPage.getPageTitle();
                expect.soft(cartTitle, "[UI][CART] Title should display 'Your Cart'").toMatch(/Your Cart/i);

                const snapCart = await cartPage.getCartSnapshot();

                expect.soft(snapCart.qty, "[CART] Qty should exist").toMatch(/\d+/);
                expect.soft(snapCart.description, "[CART] Desc should exist").not.toBe("");

                expect.soft(snapCart.removeEnabled, "[CART] Remove button should be enabled").toBe(true);
                expect.soft(snapCart.checkoutEnabled, "[CART] Checkout button should be enabled").toBe(true);
                expect.soft(snapCart.continueEnabled, "[CART] Continue Shopping button should be enabled").toBe(true);
            });

            await test.step("Remove first cart item and verify badge count becomes 0", async () => {
                await cartPage.removeFirstItem();

                const cartCount = await cartPage.getCartCount();
                expect.soft(cartCount, "[HEADER] Cart badge should be 0 after removing product").toBe(0);
            });
        }
    );
});
