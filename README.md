# SauceDemo Playwright POM Framework (JavaScript)

A scalable Playwright test framework built with POM in respect of OOP, SOLID, and a centralized locator strategy designed for modern web applications.
Based on example from https://www.saucedemo.com/

## Features
- Page Object Model (POM)
- Login credentials stored in JSON
- Multi-browser runs: Chromium, Firefox, WebKit
- Parallel execution
- Screenshot, trace captured on failure
- Changelog.md auto tracking every 2 weeks sprint (V4.0.0)
- HTML report with Allure Reporter (V4.0.0)
  - https://pkduong.github.io/sauce-demo-playwright/docs/allure/
- Error handling and CI debug logging (V5.0.0)
- Locator strategy (V6.0.0), separate WHAT we do (page actions) from HOW we find elements (UI map).

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
│ ├─ ....spec.js
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

## Error Handling & CI Debugging Strategy (V5.0.0)

This framework implements a **production-style error handling system** designed to
debug flaky tests and CI/CD failures **quickly without rerunning tests locally**.

### 1. Action-level Error Context (Page Object Layer)

All critical user actions are wrapped in a common handler at `BasePage`:

- Each action logs **START / END** with metadata
- On failure, an enriched error is thrown including:
  - action name
  - current URL
  - sanitized metadata
  - original error preserved as `cause`

This ensures every failure is **consistent, searchable, and self-descriptive**.

### 2. Breadcrumbs - Execution Timeline **(under development)**

The framework records **breadcrumbs** — a lightweight execution timeline — for each test:

- Last ~50 meaningful actions
- Timestamp, message, URL, and sanitized metadata
- Automatically collected without polluting test steps

Breadcrumbs answer the question:
> *“What happened right before the test failed?”*

### 3. Failure Context Bundle (CI-Friendly)

On test failure, a single **entry-point artifact** is attached:

#### `failure-context.json`
Contains:
- Test title, file, browser, retry
- Current URL
- Breadcrumbs timeline
- Console logs
- Page errors
- Network request failures
- All assertion errors (including soft assertions)

This allows fast triage on CI **without opening multiple artifacts**.

### 4. Shortcut Attachment for Allure UI

Due to Allure UI limitations, the same failure context is also attached as:

#### `error-context.json`

This file appears near screenshots and traces, making it **easy to download immediately**
even when a test contains multiple failed steps.

### 5. Automatic Artifacts on Failure

Additionally, the framework captures:
- Screenshot
- DOM snapshot
- Playwright trace
- Console output

All artifacts are collected **only on failure** to keep reports clean and efficient.

### 6. Designed for Flaky Test Investigation

This strategy helps quickly distinguish:
- Flaky timing / synchronization issues
- Locator problems
- Frontend JavaScript crashes
- Backend / API failures
- Real product defects

The goal is **fast root-cause analysis**, not just reporting that a test failed.

## Locator strategy (V6.0.0)
```
UI Map (selectors only)
        ↓
Page Object (actions & flows)
        ↓
Component Object (reusable widgets)
```
- Introduced UI Map layer
- Introduced Component Objects
- Refactored all pages to remove raw selectors
- Tests updated to use page APIs
- Locator priority when locating elements:
  - getByRole, getByLabel, getByTestId
  - Stable container + scoped locators
  - CSS/XPath as last resort

### SOLID Principles in Practice
- Single Responsibility:	UI map, Page, Component clearly separated
- Open/Closed:	Extend UI maps without breaking pages
- Liskov:	Components/pages share consistent contracts
- Interface Segregation:	Tests use small page APIs
- Dependency Inversion:	Pages depend on UI maps, not selectors




