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

test.describe("@demo @intentionally-failing Data-driven - verify product name + price", () => {
    test("verify all products by name and price",
        async ({ page, loggedIn, productsPage }) => {

            for (const tc of PRODUCT_LIST) {
                await test.step(`verify product list: ${tc.name} - ${tc.price}`, async () => {
                    const product = await productsPage.getProductSnapshotByNameContains(tc.name);

                    // assertion, expect to have failed on the last item T-Shirt (Red)
                    expect.soft(product.name, `Check Name matched for "${tc.name}"`).toBe(tc.name);
                    expect.soft(product.price, `Check Price matched for "${tc.price}"`).toBe(tc.price);
                });
            }
        });
});
