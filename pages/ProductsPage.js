// Methods:
// - Verify products page
// - Get all products with name + price
// - Add any product
// - Read cart badge count

const { BasePage } = require("./BasePage");

class ProductsPage extends BasePage {
    constructor(page) {
        super(page);
        this.title = page.locator(".title"); //page title: Products, use for assertion
        this.inventoryItems = page.locator(".inventory_item");
        this.cartLink = page.locator(".shopping_cart_link");
        this.cartBadge = page.locator(".shopping_cart_badge");
    }

    async assertLoggedIn() {
        await this.title.waitFor({ state: "visible" });

        const pageTitle = (await this.title.textContent());
        this.log(`Product page title: ${pageTitle}`);

        await this.inventoryItems.first().waitFor({ state: "visible" });
    }

    async addFirstProductToCart() {
        const first = this.inventoryItems.first();
        const name = (await first.locator(".inventory_item_name").textContent());

        this.log(`Adding product to cart: ${name}`);
        await first.locator('button:has-text("Add to cart")').click();

        return name;
    }

    async getAllProducts() {
        const count = await this.inventoryItems.count();
        this.log(`Found ${count} products`);

        const products = [];
        for (let i = 0; i < count; i++) {
            const item = this.inventoryItems.nth(i);
            const name = (await item.locator(".inventory_item_name").textContent());
            const price = (await item.locator(".inventory_item_price").textContent());
            products.push({ name, price });
        }
        return products;
    }

    async getCartCount() {
        if (await this.cartBadge.isVisible()) {
            const txt = (await this.cartBadge.textContent());
            return Number(txt);
        }
        return 0;
    }

    async openCart() {
        this.log(`Opening cart`);
        await this.cartLink.click();
    }
}

module.exports = { ProductsPage };