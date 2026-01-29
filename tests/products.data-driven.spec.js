const { expect } = require("@playwright/test");
const { test } = require("../test-fixtures/fixtures");

const PRODUCT_LIST = [
    { name: "Sauce Labs Backpack", price: "$29.99" },
    { name: "Sauce Labs Bike Light", price: "$9.99" },
    { name: "Sauce Labs Bolt T-Shirt", price: "$15.99" },
    { name: "Sauce Labs Fleece Jacket", price: "$49.99" },
    { name: "Sauce Labs Onesie", price: "$7.99" },
    { name: "T-Shirt (Red)", price: "$15.99" }, // failed expect will happen in this item by name
];

test.describe("@demo Data-driven - verify product name + price", () => {
    test("verify all products by name and price",
        async ({ page, loggedIn, productsPage }) => {

            for (const tc of PRODUCT_LIST) {
                await test.step(`Verify product list: ${tc.name} - ${tc.price}`, async () => {
                    const item = await productsPage.findProductByNameContains(tc.name);

                    const product = productsPage.getProductItem(item);
                    const actualName = (await product.name.textContent());
                    const actualPrice = (await product.price.textContent());

                    // assertion, expect to have failed on the last item T-Shirt (Red)
                    expect.soft(actualName, `Check Name matched for "${tc.name}"`).toBe(tc.name);
                    expect.soft(actualPrice, `Check Price matched for "${tc.price}"`).toBe(tc.price);
                });
            }
        });
});
