// Covers requirement steps:
// - Open site, login
// - Verify Products page
// - Get all products with name + price
// - Add a product, verify cart quantity
// - On Cart page verify quantity/description and buttons enabled
// - Remove product and verify cart numbers

const { expect } = require("@playwright/test");
const { test } = require("../test-fixtures/fixtures")

const creds = require("../data/credentials.json");
const { LoginPage } = require("../pages/LoginPage");
const { ProductsPage } = require("../pages/ProductsPage");
const { CartPage } = require("../pages/CartPage");

test.describe("@demo SauceDemo - Login + Cart flow (POM)", () => {
    test("should login, list products, add/remove cart item, verify cart UI",
        async ({ page, loggedIn, productsPage, cartPage }) => {
            //loggedIn no need to call out, listed there in param list fair-enough for fixture running
            //step Login before fixture, can be deleted.

            await test.step("Verify successful login (Products page visible)", async () => {
                await expect(productsPage.title).toHaveText(/Products/i);
                // await expect(page).toHaveURL(/inventory\.html/);
            });

            await test.step("Verify successful login (Products page visible)", async () => {
                await productsPage.assertLoggedIn();

                //verify page title: Product
                await expect(productsPage.title).toHaveText(/Products/i);
                await expect(page).toHaveURL(/inventory\.html/);
            });

            await test.step("Get all products with ProductName and Price", async () => {
                const products = await productsPage.getAllProducts();
                console.log(`PRODUCTS: `, products); // sao không viết product ở trong `` nh7 mọi khi?

                //basic assert
                expect(products.length).toBeGreaterThan(0);
                expect(products[0]).toHaveProperty("name");
                expect(products[0]).toHaveProperty("price");
            })

            await test.step("Add any product in cart an verify cart quantity", async () => {
                await productsPage.addFirstProductToCart();
                const cartCount = await productsPage.getCartCount();
                expect(cartCount).toBe(1);
            })

            await test.step("Go to Cart and verify quantity, description and button enable", async () => {
                await productsPage.openCart();
                await cartPage.assertCartPage();

                const { qtyText, descText } = await cartPage.assertQuantityAndDescriptionPresent();
                expect(qtyText).toBe("1");
                expect(descText.length).toBeGreaterThan(0);

                const { removeEnabled, checkoutEnabled, continueEnabled } = await cartPage.assertCartUIEnable();
                expect(removeEnabled).toBeTruthy();
                expect(checkoutEnabled).toBeTruthy();
                expect(continueEnabled).toBeTruthy();

            })

            await test.step("Remove the product and verify cart numbers", async () => {
                await cartPage.removeFirstItem();

                //after removeing, badge should be gone, count 0
                const cartCount = await cartPage.getCartCount();
                expect(cartCount).toBe(0);

                //also confirm actual no item left in cart
                const itemsCount = await cartPage.getItemsCount();
                expect(itemsCount).toBe(0);
            });

        })
})

module.exports = {}