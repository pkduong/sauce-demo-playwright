const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests",

    fullyParallel: true,

    timeout: 30_000,
    expect: { timeout: 5_000 },

    use: {
        baseURL: "https://www.saucedemo.com",
        headless: true,
        viewport: { width: 1280, height: 720 },
        testIdAttribute: 'data-test',
        screenshot: "only-on-failure",
        trace: "retain-on-failure"
    },

    reporter: [
        ["list"],
        ["html", { open: "never", outputDir: "playwright-report" }],
        ["allure-playwright", { outputFolder: "allure-results" }]
    ],

    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        // { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ]
})