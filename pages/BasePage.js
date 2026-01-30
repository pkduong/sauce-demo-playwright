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
                // await this.attachOnFailure(actionName); // Moved to test fixture for broader coverage
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

    // Moved to test fixture for broader coverage==============================
    // async attachOnFailure(actionName) {
    //     // Best ROI for daily triage on CI: screenshot + DOM + URL
    //     try {
    //         await this.testInfo.attach(`failure-${actionName}-url.txt`, {
    //             body: Buffer.from(String(this.page.url())),
    //             contentType: "text/plain",
    //         });

    //         await this.testInfo.attach(`failure-${actionName}-screenshot.png`, {
    //             body: await this.page.screenshot({ fullPage: true }),
    //             contentType: "image/png",
    //         });

    //         const html = await this.page.content();
    //         await this.testInfo.attach(`failure-${actionName}-dom.html`, {
    //             body: Buffer.from(html),
    //             contentType: "text/html",
    //         });
    //     } catch (attachErr) {
    //         // Never fail the test because of attachments
    //         this.log("WARN: attachOnFailure failed", { attachErr: String(attachErr) });
    //     }
    // }

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
