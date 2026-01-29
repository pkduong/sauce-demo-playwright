const { test } = require("../test-fixtures/fixtures");
const { expect } = require("@playwright/test");

const PRODUCT_EXPLORE_ACTION = [
    { name: "Sauce Labs Bolt T-Shirt", action: "check-detail" },
    { name: "Sauce Labs Fleece Jacket", action: "check-detail" },
    { name: "T-Shirt (Red)", action: "check-detail" },
    { name: "Sauce Labs Bolt T-Shirt", action: "add-to-cart" },
];

test.describe("@explore Simulate shopping behavior - explore details then add to cart", () => {
    test("explore products detail pages, go back, then add to cart",
        async ({ page, loggedIn, productsPage }) => {

            let expectedBadge = 0;

            for (const p of PRODUCT_EXPLORE_ACTION) {
                await test.step(`Action: ${p.action} | Product: ${p.name}`, async () => {
                    if (p.action === "check-detail") {
                        // open product detail
                        await productsPage.openProductDetailByNameContains(p.name);

                        // user is now on detail page → verify by visible product name
                        const detailName = await productsPage.getDetailName();
                        expect.soft(
                            detailName,
                            `[DETAIL] Product detail page should display correct product name: ${p.name}`
                        ).toContain(p.name);

                        // user reads description
                        const desc = await productsPage.getDetailDesc();
                        expect.soft(
                            desc.length,
                            `[DETAIL] Product description should not be empty`
                        ).toBeGreaterThan(0);

                        // user decides to go back to product list
                        await productsPage.backToProducts();

                        // verify user is back on Products page
                        await expect.soft(
                            productsPage.title,
                            "[NAV][PRODUCTS] Should return to Products page after clicking Back"
                        ).toHaveText(/Products/i);

                        await expect.soft(
                            productsPage.inventoryItems.first(),
                            "[LIST][PRODUCTS] Product list should be visible after returning from detail page"
                        ).toBeVisible();
                    }

                    if (p.action === "add-to-cart") {
                        await productsPage.addToCartByNameContains(p.name);

                        expectedBadge += 1;
                        const badge = await productsPage.getCartCount();
                        expect(
                            badge,
                            "[HEADER] Cart badge should increase after adding product"
                        ).toBe(expectedBadge);
                    }
                });
            }
        });
});
