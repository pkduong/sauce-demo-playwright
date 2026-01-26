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
├─ data/
│ └─ credentials.json
├─ pages/
│ ├─ BasePage.js
│ ├─ LoginPage.js
│ ├─ ProductsPage.js
│ └─ CartPage.js
├─ tests/
│ ├─ saucedemo.spec.js
│ └─ allure.spec.js
├─ playwright.config.js
├─ package.json
└─ README.md
```

## Environment Setup
- NodeJS version: v22+ 
- Java JDK v17+ (for Allure Reporter)

## IDE
- Visual Studio Code (VS Code)
- VSCode Playwright Extensions: https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright

## Setup
1. Install Node.js.
2. Run `npm install` to install Playwright and dependencies.
3. Run `npx playwright install` to download browser binaries.
4. Run `npm install -D allure-playwright` to install Allure Playwright Reporter
5. Run `npm install -g allure-commandline` to generate & open the report. 
6. Run `npm i -D rimraf` to support clean shortcut commands (when running `npm run allure` smoothly)

## Running Tests for Allure report
* **Run all tests (Headless, all browser, parallel):**
`npm run allure:clean; npx playwright test; npm run allure:generate; npm run allure:open;`

- Or use the shortcut commands:
`npm run allure`
`npm run allure:generate`
`npm run allure:open`

## Running Tests for Playwright report 
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



