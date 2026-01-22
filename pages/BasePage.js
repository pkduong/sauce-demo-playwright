class BasePage {
    constructor(page) {
        this.page = page;
    }

    log(message) {
        const ts = new Date().toISOString();
        console.log(`[${ts}] ${message}`);
    }

    async goto(path = "/") {
        this.log(`Navigating to: ${path}`);
        await this.page.goto(path, { waitUntil: "domcontentloaded" });
        this.log(`Current URL: ${this.page.url()}`);
    }

}

module.exports = { BasePage };
