const { BasePage } = require("./BasePage");
const { LoginUI } = require("../ui/login.ui");

class LoginPage extends BasePage {
    /**
     * @param {import("@playwright/test").Page} page
     * @param {import("@playwright/test").TestInfo} testInfo
     */
    constructor(page, testInfo) {
        super(page, testInfo);
        this.ui = new LoginUI(page);
    }


    // OOP-ready contract (override BasePage.waitUntilReady)
    async waitUntilReady() {
        return this.withAction("login.waitUntilReady", async () => {
            await this.ui.logo().waitFor({ state: "visible" });
        });
    }



    /**
     * Open login page and wait until it is ready.
     * Returns logo text so tests can assert (keep asserts out of POM).
     */
    async open() {
        return this.withAction("login.open", async () => {
            await this.goto("/");
            const title = await this.safeText(this.ui.logo(), "login.waitForLogo");
            this.log("Login page ready", { title });
            return title;
        });
    }

    async login(username, password) {
        return this.withAction(
            "login.submit",
            async () => {
                await this.safeFill(this.ui.usernameInput(), username, "login.fillUsername");
                await this.safeFill(this.ui.passwordInput(), password, "login.fillPassword");

                await Promise.all([
                    this.page.waitForURL(/inventory\.html/),
                    this.ui.loginButton().click(),
                ]);
            },
            { username }
        );
    }

    async loginExpectError(username, password) {
        return this.withAction(
            "login.submitExpectError",
            async () => {
                await this.safeFill(this.ui.usernameInput(), username, "login.fillUsername");
                await this.safeFill(this.ui.passwordInput(), password, "login.fillPassword");

                await this.ui.loginButton().click();
                await this.ui.errorMessage().waitFor({ state: "visible" });

                return (await this.ui.errorMessage().textContent())?.trim() ?? "";
            },
            { username }
        );
    }

    async getErrorTextIfAny() {
        return this.withAction("login.getErrorTextIfAny", async () => {
            const err = this.ui.errorMessage();
            if (await err.count()) {
                const visible = await err.isVisible().catch(() => false);
                if (visible) return (await err.textContent())?.trim() ?? "";
            }
            return "";
        });
    }
}

module.exports = { LoginPage };
