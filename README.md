# SauceDemo Playwright POM Framework (JavaScript)

Automated test framework using Playwright Test + Page Object Model (POM) for https://www.saucedemo.com/

## Features
- Page Object Model (POM)
- Login credentials stored in JSON
- Multi-browser runs: Chromium, Firefox, WebKit
- Parallel execution
- Screenshot, trace captured on failure
- HTML report
- Debug logging

## Project Structure

```
saucedemo-playwright-pom/
├─ data/
│  └─ credentials.json
├─ pages/
│  ├─ BasePage.js
│  ├─ LoginPage.js
│  ├─ ProductsPage.js
│  └─ CartPage.js
├─ tests/
│  └─ saucedemo.spec.js
├─ playwright.config.js
├─ package.json
└─ README.md
```

## Environment Setup
- NodeJS version: v22+ 

## IDE
- Visual Studio Code (VS Code)
- VSCode Playwright Extensions: https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright

## Setup
1. Install Node.js.
2. Run `npm install` to install Playwright and dependencies.
3. Run `npx playwright install` to download browser binaries.

## Running Tests
* **Run all tests (Headless, all browser, parallel):**
    `npm run test`

* **Run with UI Mode:**
    `npm run test:headed`

* **Run headless with debugging (Headless):**
    `npm run test:debug`

* **Run on specific browser (Headless):**
    `npm run test:firefox`
    `npm run test:chrome`
    `npm run test:safari`
   
* **To view the last run report (HTML):**
    `npm run report`


