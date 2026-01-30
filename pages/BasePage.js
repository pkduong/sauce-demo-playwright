class BasePage {
    /**
     * @param {import("@playwright/test").Page} page
     * @param {import("@playwright/test").TestInfo=} testInfo (pass from fixture to enable auto-attachments.)
     */
    constructor(page, testInfo) {
        this.page = page;
        this.testInfo = testInfo;
    }

    within(root, builder) {
        // builder receives root and returns locators/actions bound to root
        return builder(root);
    }

    log(message, meta = {}) {
        const ts = new Date().toISOString();
        // Structured log = easier to grep on CI
        console.log(
            JSON.stringify({
                ts,
                msg: message,
                url: this.page?.url?.(),
                ...meta,
            })
        );
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
                await this.attachActionContext(actionName, meta, err);
            }

            throw enriched;
        }
    }

    async attachActionContext(actionName, meta, err) {
        // Context-only attachment (no screenshot / DOM / url attachments)
        // Fixtures already attach global artifacts on test failure.
        try {
            const payload = {
                ts: new Date().toISOString(),
                action: actionName,
                url: this.page?.url?.(),
                meta,
                error: {
                    message: err?.message || String(err),
                    stack: err?.stack || "",
                    cause: err?.cause ? String(err.cause) : undefined,
                },
            };

            await this.testInfo.attach(`action-failure-${actionName}.json`, {
                body: Buffer.from(JSON.stringify(payload, null, 2)),
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

    /**
     * Fill input safely with optional masking.
     * - Default mask=true (safe for passwords/tokens)
     */
    async safeFill(locator, value, actionName = "fill", meta = {}, options = { mask: true }) {
        const mask = options?.mask !== false;
        return this.withAction(actionName, async () => {
            await locator.waitFor({ state: "visible" });
            await locator.fill(value);
        }, { ...meta, ...(mask ? { valueMasked: "***" } : { value }) });
    }

    async safeFillSensitive(locator, value, actionName = "fillSensitive", meta = {}) {
        return this.safeFill(locator, value, actionName, meta, { mask: true });
    }

    async safeFillPlain(locator, value, actionName = "fillPlain", meta = {}) {
        return this.safeFill(locator, value, actionName, meta, { mask: false });
    }

    async safeText(locator, actionName = "textContent", meta = {}) {
        return this.withAction(actionName, async () => {
            await locator.waitFor({ state: "visible" });
            return await locator.textContent();
        }, meta);
    }

    /**
     * Read an optional integer from a locator (e.g., cart badge).
     * Returns defaultValue when locator doesn't exist/has no text or cannot parse.
     */
    async readOptionalInt(locator, defaultValue = 0, actionName = "readOptionalInt", meta = {}) {
        return this.withAction(actionName, async () => {
            if (!(await locator.count())) return defaultValue;
            const raw = (await locator.textContent())?.trim() ?? "";
            const n = parseInt(raw, 10);
            return Number.isFinite(n) ? n : defaultValue;
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
