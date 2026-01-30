# 🎯 SauceDemo Playwright POM Framework (JavaScript)

A scalable Playwright test framework built with POM in respect of OOP, SOLID, and a centralized locator strategy designed for modern web applications.
Based on example from https://www.saucedemo.com/

## ✨ Features
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

## 📁 Project Structure

```
├── data/
│   └── credentials.json          # Test data (accounts, static inputs)
│
├── pages/
│   ├── BasePage.js                # Shared logic: navigation, waits, error handling
│   ├── LoginPage.js               # Login page orchestration
│   ├── ProductsPage.js            # Products listing & flow control
│   └── CartPage.js                # Cart page orchestration
│
├── ui/
│   ├── login.ui.js                # Login UI map (locators only)
│   ├── products.ui.js             # Products UI map
│   └── cart.ui.js                 # Cart UI map
│
├── test-fixtures/
│   └── fixtures.js                # Custom Playwright fixtures & test extensions
│
├── tests/
│   ├── saucedemo.spec.js           # End-to-end happy flow (login → cart)
│   ├── shopping.explore.spec.js    # User exploration flows
│   ├── products.data-driven.spec.js
│   ├── products.data-driven.detail-assert.spec.js
│   └── allure.spec.js              # Report / debug-oriented scenarios
│
├── scripts/
│   └── changelog.js                # Auto changelog generation script
│
├── playwright-report/              # Playwright HTML report (generated)
├── test-results/                   # Raw test artifacts (screenshots, traces)
│
├── playwright.config.js             # Playwright configuration
├── package.json                     # Project scripts & dependencies
├── package-lock.json
├── CHANGELOG.md                     # Auto-generated release notes
├── README.md                        # Project documentation
└── .gitignore
```

## ⚙️ Environment Setup
- NodeJS version: v22+ 
- Java JDK v17+ (for Allure Reporter)

## 💻 IDE
- Visual Studio Code (VS Code)
- VSCode Playwright Extensions: https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright

## 🛠️ Setup
1. Install Node.js.
2. Run `npm install` to install Playwright and dependencies.
3. Run `npx playwright install` to download browser binaries.
4. Run `npm install -D allure-playwright` to install Allure Playwright Reporter
5. Run `npm install -g allure-commandline` to generate & open the report. 
6. Run `npm i -D rimraf` to support clean shortcut commands (when running `npm run allure` smoothly)

## 📊 Running Tests for Allure report
* **Run all tests (Headless, all browser, parallel):**
`npm run allure:clean; npx playwright test; npm run allure:generate; npm run allure:open;`

- Or use the shortcut commands:
`npm run allure`
`npm run allure:generate`
`npm run allure:open`

## 🧪 Running Tests for Playwright report 
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

## 🐞 Error Handling & CI Debugging Strategy (V5.0.0)

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

## 📦 Locator strategy (V6.0.0)
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

## ✅ SOLID alignment achieved (V6.1.0)

Starting from **v6.1**, the framework has been refactored to align closely with **SOLID principles**, making it easier to scale, extend, and maintain as the test suite grows.

### What’s improved

| Principle | v6.1 improvement |
|----------|------------------|
| **S – Single Responsibility** | Components own row-level data and behavior; Pages orchestrate flows only |
| **O – Open / Closed** | Standardized naming rules allow extension without breaking existing APIs |
| **L – Liskov Substitution** | Consistent method contracts across Pages and Components |
| **I – Interface Segregation** | Tests interact with small, focused Page APIs instead of raw locators |
| **D – Dependency Inversion** | Pages depend on UI maps; shared logic is centralized in `BasePage` |

### Why this matters

- 📈 **Scalable architecture** – adding new features or pages does not introduce ripple changes  
- 🧠 **Clear ownership** – components handle data, pages handle orchestration, tests handle intent  
- 🔧 **Low maintenance cost** – shared behaviors live in one place (`BasePage`)  
- 🧪 **Stable tests** – tests consume semantic APIs, not fragile selectors  

This structure allows the framework to evolve confidently while keeping tests readable, stable, and aligned with real user behavior.

## 🏗️ Architecture Overview

The framework is structured around **clear responsibility boundaries** between Pages, Components, and Tests.

- **BasePage**
  - Centralizes shared behaviors: navigation helpers, error handling, logging, and action wrappers
  - Provides a stable foundation for all pages

- **Page Objects**
  - Orchestrate user flows and high-level actions
  - Do not expose raw locators to tests
  - Delegate row-level or repeated UI logic to Components

- **Components**
  - Represent reusable UI units (e.g. product item, cart row)
  - Own their own locators and data extraction logic
  - Return structured snapshots instead of DOM handles

- **Tests**
  - Express business intent, not UI mechanics
  - Interact only with Page APIs
  - Never depend directly on selectors or DOM structure

This separation ensures that UI changes remain localized and do not cascade into test failures.

---

## 📐 Design Rules & Conventions

To keep the framework consistent and scalable, the following conventions are enforced:

### Method naming (verb-based)

- `list...()` → return collections  
  _e.g. `listProducts()`_

- `get...()` → return data or snapshots  
  _e.g. `getCartSnapshot()`_

- `open() / goTo() / backTo()` → navigation and flow control  
  _e.g. `openCart()`, `backToProducts()`_

- `waitFor...()` → explicit page or state synchronization  
  _e.g. `waitForProductListPage()`_

### Page Object rules

- Pages **do not assert**
- Pages **do not return locators**
- Pages **orchestrate**, Components **operate**
- All shared logic must live in `BasePage`

### Test rules

- Tests describe **what** is verified, not **how**
- Assertions belong in tests, never in Page Objects
- Tests should read like user journeys, not automation scripts

---

## 🚫 Anti-patterns avoided

The following common automation pitfalls are intentionally avoided:

- ❌ Exposing locators directly to tests  
- ❌ Mixing assertions inside Page Objects  
- ❌ Duplicating wait logic across multiple tests  
- ❌ Page Objects growing into “god classes”  
- ❌ Tight coupling between tests and DOM structure  

By avoiding these patterns, the framework remains flexible, readable, and resilient to UI changes.

