class LoginUI {
    /**
     * @param {import("@playwright/test").Page} page
     */
    constructor(page) {
        this.page = page;
    }

    usernameInput() {
        return this.page.getByTestId("username");
    }

    passwordInput() {
        return this.page.getByTestId("password");
    }

    loginButton() {
        return this.page.getByTestId("login-button");
    }

    logo() {
        return this.page.locator(".login_logo");
    }

    errorMessage() {
        return this.page.getByTestId("error");
    }
}

module.exports = { LoginUI };
