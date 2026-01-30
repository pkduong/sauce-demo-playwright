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
                // username is not sensitive, password is
                await this.safeFillPlain(this.ui.usernameInput(), username, "login.fillUsername");
                await this.safeFillSensitive(this.ui.passwordInput(), password, "login.fillPassword");

                await Promise.all([
                    this.page.waitForURL(/inventory\.html/),
                    this.safeClick(this.ui.loginButton(), "login.clickLogin"),
                ]);
            },
            { username }
        );
    }

    async loginExpectError(username, password) {
        return this.withAction(
            "login.submitExpectError",
            async () => {
                await this.safeFillPlain(this.ui.usernameInput(), username, "login.fillUsername");
                await this.safeFillSensitive(this.ui.passwordInput(), password, "login.fillPassword");
                await this.safeClick(this.ui.loginButton(), "login.clickLogin");

                // Expect error message to appear on same page
                await this.ui.errorMessage().waitFor({ state: "visible" });
                return (await this.ui.errorMessage().textContent())?.trim();
            },
            { username }
        );
    }

    async getErrorTextIfAny() {
        return this.withAction("login.getErrorTextIfAny", async () => {
            const err = this.ui.errorMessage();
            if (await err.count()) {
                return (await err.textContent())?.trim();
            }
            return null;
        });
    }
}

module.exports = { LoginPage };
