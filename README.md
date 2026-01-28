# 📊 Playwright Allure Reports

This branch (`gh-pages`) hosts **Allure Test Reports** generated automatically from the Playwright CI/CD pipeline.

Reports are published using **GitHub Actions** and served via **GitHub Pages**.

---

## 🌐 How to View the Reports

### 🔹 Entry Point
Open the main report index here:

👉 **[https://<your-github-username>.github.io/<repo-name>/](https://pkduong.github.io/sauce-demo-playwright/)**

From there, you can navigate to:
- **Latest report**
- **Historical runs**

---

### 🔹 Latest Report
Shows the **most recent execution result** (overwritten on every run):

```
/allure/latest/<browser>/<tag>/
```

Example:
```
/allure/latest/chromium/demo/
```

---

### 🔹 Historical Runs
Each CI execution is stored as an immutable snapshot:

```
/allure/runs/<run-key>/<browser>/<tag>/
```

---

## 🧠 Report Retention Policy

- Only the **latest 20 runs** are kept
- `latest/` is overwritten every run
- Older runs are cleaned automatically

---

## 🛠 How Reports Are Generated

1. Playwright tests run in CI
2. Allure results are produced
3. History is restored
4. Allure report is generated
5. Reports are published to `gh-pages`

---

## ⚙️ Notes

- This branch is auto-managed by GitHub Actions
- Do not edit report files manually
- `.nojekyll` is required for Allure

---

Happy testing!
