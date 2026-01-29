const { expect } = require("allure-playwright");
const { BasePage } = require("./BasePage");

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.usernameInput = page.locator("input#user-name");
        this.passwordInput = page.locator("input#password");
        this.loginButton = page.locator("input#login-button");
    }

    async open() {
        await this.goto("/");

        const title = await this.page.locator(".login_logo").textContent();
        this.log(`Opened Login Page - title: ${title}`);
        expect(title).toBe("Swag Labs");

        await this.usernameInput.waitFor({ state: "visible" });
        this.log("Login page loaded");
    }

    async login(username, password) {
        this.log(`Login with username: ${username}`);
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);

        // await this.loginButton.click();
        await Promise.all([
            this.page.waitForURL(/inventory\.html/),
            this.loginButton.click(),
        ]);
    }
}

module.exports = { LoginPage };