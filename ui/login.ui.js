class LoginUI {
    /**
     * @param {import("@playwright/test").Page} page
     */
    constructor(page) {
        this.page = page;
    }

    usernameInput() {
        return this.page.locator("input#user-name");
    }

    passwordInput() {
        return this.page.locator("input#password");
    }

    loginButton() {
        return this.page.locator("input#login-button");
    }

    logo() {
        return this.page.locator(".login_logo");
    }

    errorMessage() {
        return this.page.locator('[data-test="error"]');
    }
}

module.exports = { LoginUI };
