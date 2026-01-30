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

test.describe("SauceDemo - Login + Cart flow (POM)", () => {
    test("should login, list products, add/remove cart item, verify cart UI",
        async ({ page, loginPage, productsPage, cartPage }, testInfo) => {

            await test.step("Open website", async () => {
                await loginPage.open();
            });

            await test.step("Login with Json credentials", async () => {
                const { username, password } = creds.standard;
                await loginPage.login(username, password);
            });

            await test.step("Verify successful login (Products page visible)", async () => {
                await productsPage.waitForProductListPage();

                //verify page title Products and correct url
                await expect.soft(
                    productsPage.ui.title(),
                    "[UI][PRODUCTS] Title should display 'Products'"
                ).toHaveText(/Products/i);

                await expect.soft(
                    page,
                    "[NAV][PRODUCTS] URL should be inventory.html after login"
                ).toHaveURL(/inventory\.html/);

            });

            await test.step("Get all products with ProductName and Price", async () => {
                const items = productsPage.ui.inventoryItems();
                const count = await items.count();

                const products = [];
                for (let i = 0; i < count; i++) {
                    const item = items.nth(i);
                    const name = (await productsPage.ui.itemName(item).textContent())?.trim() ?? "";
                    const price = (await productsPage.ui.itemPrice(item).textContent())?.trim() ?? "";
                    products.push({ name, price });
                }
                //just basic assertion
                expect.soft(
                    products.length,
                    "[LIST] Products list should not be empty after login"
                ).toBeGreaterThan(0);

                expect.soft(
                    products[0],
                    "[LIST] Product item should contain property: name"
                ).toHaveProperty("name");

                expect.soft(
                    products[0],
                    "[LIST] Product item should contain property: price"
                ).toHaveProperty("price");

            })

            await test.step("Add a product to cart and verify cart quantity", async () => {
                await productsPage.addToCartByNameContains("Sauce Labs Backpack");

                const cartCount = await productsPage.getCartCount();
                expect.soft(cartCount, "[HEADER] Cart badge should increase to 1 after adding product").toBe(1);
            });

            await test.step("Go to Cart and verify quantity, description and button enable", async () => {

                await productsPage.openCart();
                await cartPage.waitForCartPage();

                // const { qtyText, descText } = await cartPage.getFirstItemQtyAndDescription();
                const cart = await cartPage.getCartSnapshot();

                expect.soft(
                    cart.qtyText,
                    "[CART] Item quantity should be 1 for newly added product"
                ).toBe("1");

                expect.soft(
                    cart.descText.length,
                    "[CART] Item description should not be empty"
                ).toBeGreaterThan(0);

                // const { removeEnabled, checkoutEnabled, continueEnabled } = await cartPage.getCartUIEnabledState();

                expect.soft(
                    cart.removeEnabled,
                    "[CART] Remove button should be enabled"
                ).toBeTruthy();

                expect.soft(
                    cart.checkoutEnabled,
                    "[CART] Checkout button should be enabled"
                ).toBeTruthy();

                expect.soft(
                    cart.continueEnabled,
                    "[CART] Continue Shopping button should be enabled"
                ).toBeTruthy();

            })

            await test.step("Remove the product and verify cart numbers", async () => {
                await cartPage.removeFirstItem();

                //after removeing, badge should be gone, count 0
                const cartCount = await cartPage.getCartCount();
                expect.soft(
                    cartCount,
                    "[HEADER] Cart badge should be removed after deleting last item"
                ).toBe(0);

                //also confirm actual no item left in cart
                const itemsCount = await cartPage.getItemsCount();
                expect.soft(
                    itemsCount,
                    "[CART] Cart should be empty after removing product"
                ).toBe(0);

            });

        })
})

module.exports = {}