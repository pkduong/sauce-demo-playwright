class BasePage {
    /**
     * @param {import("@playwright/test").Page} page
     * @param {import("@playwright/test").TestInfo=} testInfo (pass from fixture to enable auto-attachments.)
     */
    constructor(page, testInfo) {
        this.page = page;
        this.testInfo = testInfo;

        // Breadcrumbs buffer stored on the Playwright page for global access (fixture can read it)
        if (this.page && !this.page.__breadcrumbs) {
            this.page.__breadcrumbs = [];
        }
    }

    log(message, meta = {}) {
        const ts = new Date().toISOString();

        const safeClone = (obj) => {
            if (!obj) return undefined;
            try {
                // Removes circular refs + strips Playwright objects (Locator/Page/Response etc.)
                return JSON.parse(JSON.stringify(obj));
            } catch {
                return { note: "meta not serializable" };
            }
        };

        // Breadcrumbs: lightweight timeline of what the test was doing (last N actions).
        // Stored on page so fixtures (and other helpers) can read it at teardown.
        try {
            if (this.page) {
                this.page.__breadcrumbs = this.page.__breadcrumbs || [];
                this.page.__breadcrumbs.push({
                    ts,
                    msg: message,
                    url: this.page?.url?.(),
                    meta: safeClone(meta),
                });

                // Keep the last 50 entries only (avoid huge attachments)
                if (this.page.__breadcrumbs.length > 50) {
                    this.page.__breadcrumbs = this.page.__breadcrumbs.slice(-50);
                }
            }
        } catch {
            // ignore breadcrumb issues
        }

        // Structured log = easier to grep on CI (never crash because of unserializable meta)
        const logObj = {
            ts,
            msg: message,
            url: this.page?.url?.(),
            meta: safeClone(meta),
        };

        try {
            console.log(JSON.stringify(logObj));
        } catch {
            console.log(`[LOG-UNSERIALIZABLE] ${ts} ${message} url=${logObj.url || ""}`);
        }
    }

    async withAction(actionName, fn, meta = {}) {
        try {
            this.log(`START: ${actionName}`, meta);
            const result = await fn();
            this.log(`END: ${actionName}`, meta);
            return result;
        } catch (err) {
            const enriched = new Error(
                [
                    `[ACTION FAILED] ${actionName}`,
                    `URL: ${this.page?.url?.()}`,
                    `META: ${safeJson(meta)}`,
                    `CAUSE: ${err?.message || String(err)}`,
                ].join("\n")
            );
            enriched.cause = err;

            // Auto-attach only when testInfo is injected (fixture recommended)
            if (this.testInfo) {
                // await this.attachOnFailure(actionName); // Moved to test fixture for broader coverage
                await this.attachActionContext(actionName, meta, err);
            }

            throw enriched;
        }
    }

    async attachActionContext(actionName, meta, err) {
        // Context-only attachment (no screenshot / DOM / url attachments)
        // Fixtures already attach global artifacts on test failure.
        const safeClone = (obj) => {
            if (!obj) return undefined;
            try {
                return JSON.parse(JSON.stringify(obj));
            } catch {
                return { note: "meta not serializable" };
            }
        };

        const safeStringify = (obj) => {
            try {
                return JSON.stringify(obj, null, 2);
            } catch (e) {
                return JSON.stringify(
                    { note: "payload not serializable", error: String(e) },
                    null,
                    2
                );
            }
        };

        try {
            const payload = {
                ts: new Date().toISOString(),
                action: actionName,
                url: this.page?.url?.(),
                meta: safeClone(meta),
                breadcrumbs: (this.page?.__breadcrumbs || []).slice(-50),
                error: {
                    message: err?.message || String(err),
                    stack: err?.stack || "",
                    cause: err?.cause ? String(err.cause) : undefined,
                },
            };

            await this.testInfo.attach(`action-failure-${actionName}.json`, {
                body: Buffer.from(safeStringify(payload)),
                contentType: "application/json",
            });
        } catch (attachErr) {
            // Never fail the test because of attachments
            this.log("WARN: attachActionContext failed", { attachErr: String(attachErr) });
        }
    }

    async goto(path = "/") {
        return this.withAction("goto", async () => {
            await this.page.goto(path, { waitUntil: "domcontentloaded" });
        }, { path });
    }

    async safeClick(locator, actionName = "click", meta = {}) {
        return this.withAction(actionName, async () => {
            await locator.waitFor({ state: "visible" });
            await locator.click();
        }, meta);
    }

    async safeFill(locator, value, actionName = "fill", meta = {}) {
        return this.withAction(actionName, async () => {
            await locator.waitFor({ state: "visible" });
            await locator.fill(value);
        }, { ...meta, valueMasked: "***" });
    }

    async safeText(locator, actionName = "textContent", meta = {}) {
        return this.withAction(actionName, async () => {
            await locator.waitFor({ state: "visible" });
            return await locator.textContent();
        }, meta);
    }
}

function safeJson(obj) {
    try {
        return JSON.stringify(obj);
    } catch {
        return "[unserializable-meta]";
    }
}

module.exports = { BasePage };
