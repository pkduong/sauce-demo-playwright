const { expect } = require("@playwright/test");
const { test } = require("../test-fixtures/fixtures");

const PRODUCT_DETAILS = [
    {
        name: "Sauce Labs Backpack",
        price: "$29.99",
        desc: "Carry all things with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection.",
    }, // expect description mismatch
    {
        name: "Sauce Labs Bike Light",
        price: "$9.99",
        desc: "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
    },
    {
        name: "Sauce Labs Bolt T-Shirt",
        price: "$15.99",
        desc: "Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.",
    },
    {
        name: "Sauce Labs Fleece Jacket",
        price: "$49.99",
        desc: "It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office.",
    },
    {
        name: "Sauce Labs Onesie",
        price: "$7.99",
        desc: "Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel.",
    },
    {
        name: "Sauce Labs T-Shirt (Red)",
        price: "$15.99",
        desc: "This classic Sauce Labs t-shirt is perfect to wear when cozying up to your laptop to automate some tests. Super-soft and comfy ringspun combed cotton.",
    },
];

test.describe("@product @intentionally-failing Data-driven - verify product list vs detail (name/price/desc)", () => {
    test("verify product list page: name + price", async ({ loggedIn, productsPage }) => {
        for (const tc of PRODUCT_DETAILS) {
            await test.step(`verify product list: ${tc.name} - ${tc.price}`, async () => {
                const product = await productsPage.getProductSnapshotByNameContains(tc.name);

                expect.soft(product.name, `[LIST] Check Name matched for "${tc.name}"`).toBe(tc.name);
                expect.soft(product.price, `[LIST] Check Price matched for "${tc.price}"`).toBe(tc.price);
            });
        }
    });

    test("@product @intentionally-failing verify product detail page: name + price + description",
        async ({ loggedIn, productsPage }) => {
            for (const tc of PRODUCT_DETAILS) {
                await test.step(`verify product detail: ${tc.name}`, async () => {
                    await productsPage.goToProductDetailByNameContains(tc.name);

                    const product = await productsPage.getProductDetailSnapshot();

                    expect.soft(product.detailName, `[DETAIL] Check Name matched for "${tc.name}"`).toBe(tc.name);
                    expect.soft(product.detailPrice, `[DETAIL] Check Price matched for "${tc.price}"`).toBe(tc.price);
                    expect.soft(product.detailDesc, `[DETAIL] Check description matched for "${tc.desc}"`).toBe(tc.desc);

                    await productsPage.goBackToProductList();
                });
            }
        }
    );
});
