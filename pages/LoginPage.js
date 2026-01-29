const { BasePage } = require("./BasePage");

class LoginPage extends BasePage {
    constructor(page, testInfo) {
        super(page, testInfo);

        this.usernameInput = page.locator("input#user-name");
        this.passwordInput = page.locator("input#password");
        this.loginButton = page.locator("input#login-button");
        this.logo = page.locator(".login_logo");
        this.errorMessage = page.locator('[data-test="error"]');
    }

    /**
     * Open login page and wait until it is ready.
     * Return the logo text so the test can assert (keep asserts out of POM).
     */
    async open() {
        await this.goto("/");
        const title = await this.safeText(this.logo, "login.waitForLogo");
        this.log("Login page ready", { title });
        return title;
    }

    async login(username, password) {
        return this.withAction("login", async () => {
            await this.safeFill(this.usernameInput, username, "login.fillUsername");
            await this.safeFill(this.passwordInput, password, "login.fillPassword");

            await Promise.all([
                this.page.waitForURL(/inventory\.html/),
                this.loginButton.click(),
            ]);
        }, { username });
    }

    async loginExpectError(username, password) {
        return this.withAction("loginExpectError", async () => {
            await this.safeFill(this.usernameInput, username, "login.fillUsername");
            await this.safeFill(this.passwordInput, password, "login.fillPassword");
            await this.loginButton.click();
            await this.errorMessage.waitFor({ state: "visible" });
            return (await this.errorMessage.textContent())?.trim();
        }, { username });
    }
}

module.exports = { LoginPage };
