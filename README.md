# 📊 Playwright + Allure Reports (GitHub Pages)

This repository publishes **Allure Test Reports** generated from the Playwright CI/CD workflow to **GitHub Pages** (branch: `gh-pages`).

---

## 🌐 Live Reports Link (Entry Point)

Open the reports home:

👉 **https://pkduong.github.io/sauce-demo-playwright/docs/**

From there you can navigate to:
- **Latest** (most recent execution)
- **Runs** (history list of executions)

---

## 🧭 URL Structure (Updated)

### ✅ Latest report (overwritten every run)

```
/docs/allure/latest/<browser>/<tag>/
```

Example:

```
/docs/allure/latest/chromium/@product/
```

> Notes:
> - `<browser>` is one of: `chromium`, `firefox`, `webkit`
> - `<tag>` comes from your workflow input `tag` (sanitized to be URL-safe)

---

### ✅ Historical runs (immutable snapshots)

Each CI run is stored under a unique **run key**:

```
/docs/allure/runs/<run-key>/<browser>/<tag>/
```

Example:

```
/docs/allure/runs/12-1234567890/chromium/@product/
```

---

### ✅ Runs index (list of latest runs)

A listing page is generated automatically:

```
/docs/allure/runs/index.html
```

Direct link:

👉 **https://pkduong.github.io/sauce-demo-playwright/docs/allure/runs/**

---

## 🧠 Retention Policy

- Only the **latest 20 run folders** are kept under `runs/`
- `latest/` is overwritten on every run
- Older run folders are automatically removed

---

## 🛠 How the Workflow Publishes Reports (New Logic)

1. Run Playwright tests in CI (with inputs: workers, browser, tag)
2. Checkout `gh-pages` into a dedicated folder (e.g. `site/`)
3. Restore `history/` from:

   ```
   site/docs/allure/latest/<browser>/<tag>/history
   ```

4. Generate Allure report (`allure-report/`)
5. Publish to GitHub Pages (`gh-pages`) in the correct location:

   - Latest:
     ```
     site/docs/allure/latest/<browser>/<tag>/
     ```
   - Snapshot run:
     ```
     site/docs/allure/runs/<run-key>/<browser>/<tag>/
     ```
   - Runs index:
     ```
     site/docs/allure/runs/index.html
     ```

---

## ⚙️ Notes

- `gh-pages` is auto-managed by GitHub Actions — **do not edit report files manually**
- `.nojekyll` is used so Allure assets/folders render correctly on GitHub Pages

---

Happy testing! ✅
