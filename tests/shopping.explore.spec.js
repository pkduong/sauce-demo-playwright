const { test } = require("../test-fixtures/fixtures");
const { expect } = require("@playwright/test");

const PRODUCT_EXPLORE_ACTION = [
    { name: "Sauce Labs Bolt T-Shirt", action: "check-detail" },
    { name: "Sauce Labs Fleece Jacket", action: "check-detail" },
    { name: "T-Shirt (Red)", action: "check-detail" },
    { name: "Sauce Labs Bolt T-Shirt", action: "add-to-cart" },
];

test.describe("@explore @cart Simulate shopping behavior - explore details then add to cart", () => {
    test("explore products detail pages, go back, then add to cart",
        async ({ loggedIn, productsPage }) => {

            let expectedBadge = 0;

            for (const p of PRODUCT_EXPLORE_ACTION) {
                await test.step(`Action: ${p.action} | Product: ${p.name}`, async () => {
                    if (p.action === "check-detail") {
                        // open product detail
                        await productsPage.goToProductDetailByNameContains(p.name);

                        // verify detail page has product
                        const product = await productsPage.getProductDetailSnapshot();
                        expect.soft(product.detailName, "[DETAIL] Detail name should be visible").toContain(p.name);

                        // back
                        await productsPage.goBackToProductList();

                        const title = await productsPage.getPageTitle();
                        expect.soft(title, "[NAV][PRODUCTS] Should return to Products page").toMatch(/Products/i);

                        const listVisible = await productsPage.isProductListVisible();
                        expect.soft(listVisible, "[LIST][PRODUCTS] Product list should be visible").toBe(true);
                    }

                    if (p.action === "add-to-cart") {
                        await productsPage.addToCartByNameContains(p.name);
                        expectedBadge += 1;

                        const count = await productsPage.getCartCount();
                        expect.soft(count, "[HEADER] Cart badge should reflect add-to-cart actions").toBe(expectedBadge);
                    }
                });
            }
        }
    );
});
