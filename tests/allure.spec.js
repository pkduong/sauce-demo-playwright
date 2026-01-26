import { test } from "@playwright/test";
import { allure } from "allure-playwright";

test("attach example (allure)", async ({ page }) => {
    await page.goto("https://www.saucedemo.com/");

    const shot = await page.screenshot();

    //allure is deprecated, use testInfo.attach in next example
    await allure.attachment("Login page", shot, "image/png");

    await allure.attachment("debug info", JSON.stringify({ a: 1 }, null, 2), "application/json");
});


test("attach example (recommended)", async ({ page }, testInfo) => {
    await page.goto("https://www.saucedemo.com/");

    //capture screenshot even with no failure
    const screenshot = await page.screenshot();
    await testInfo.attach("Login page", {
        body: screenshot,
        contentType: "image/png",
    });

    await testInfo.attach("debug info", {
        body: JSON.stringify({ a: 1 }, null, 2),
        contentType: "application/json",
    });
});
