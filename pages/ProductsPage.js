const { BasePage } = require("./BasePage");
const { ProductsUI } = require("../ui/products.ui");
const { ProductCard } = require("../components/ProductCard");

class ProductsPage extends BasePage {
    /**
     * @param {import("@playwright/test").Page} page
     * @param {import("@playwright/test").TestInfo} testInfo
     */
    constructor(page, testInfo) {
        super(page, testInfo);
        this.ui = new ProductsUI(page);
    }

    // -----------------------------
    // Page state / queries (small API for tests)
    // -----------------------------
    async waitForProductListPage() {
        return this.withAction("products.waitForProductListPage", async () => {
            await this.ui.title().waitFor({ state: "visible" });
            await this.page.waitForURL(/inventory\.html/);
        });
    }

    async getPageTitle() {
        return this.withAction("products.getPageTitle", async () => {
            const text = (await this.ui.title().textContent()) ?? "";
            return text.trim();
        });
    }

    async isProductListVisible() {
        return this.withAction("products.isProductListVisible", async () => {
            return await this.ui.inventoryItems().first().isVisible();
        });
    }

    async listProducts() {
        return this.withAction("products.listProducts", async () => {
            const items = this.ui.inventoryItems();
            const count = await items.count();
            const out = [];

            for (let i = 0; i < count; i++) {
                const root = items.nth(i);
                const card = new ProductCard(root, this.ui);

                const name = ((await card.name().textContent()) ?? "").trim();
                const price = ((await card.price().textContent()) ?? "").trim();

                out.push({ name, price });
            }

            return out;
        });
    }

    // -----------------------------
    // Navigation / header
    // -----------------------------
    async openCart() {
        return this.withAction("products.openCart", async () => {
            await Promise.all([
                this.page.waitForURL(/cart\.html/),
                this.ui.cartLink().click(),
            ]);
        });
    }

    async getCartCount() {
        return this.readOptionalInt(this.ui.cartBadge(), 0, "products.getCartCount");
    }

    // -----------------------------
    // Product-level helpers (using Component Object)
    // -----------------------------
    async getCardByNameContains(name) {
        return this.withAction("products.getCardByNameContains", async () => {
            const root = this.ui.itemByNameContains(name);
            await root.waitFor({ state: "visible" });
            return new ProductCard(root, this.ui);
        }, { name });
    }

    async getProductSnapshotByNameContains(name) {
        return this.withAction("products.getProductSnapshotByNameContains", async () => {
            const card = await this.getCardByNameContains(name);
            return {
                name: ((await card.name().textContent()) ?? "").trim(),
                price: ((await card.price().textContent()) ?? "").trim(),
            };
        }, { name });
    }

    async goToProductDetailByNameContains(name) {
        return this.withAction("products.goToProductDetailByNameContains", async () => {
            const card = await this.getCardByNameContains(name);

            await Promise.all([
                this.page.waitForURL(/inventory-item\.html/),
                card.name().click(),
            ]);
        }, { name });
    }

    async goBackToProductList() {
        return this.withAction("products.goBackToProductList", async () => {
            await Promise.all([
                this.page.waitForURL(/inventory\.html/),
                this.ui.backToProductsButton().click(),
            ]);
        });
    }

    async getProductDetailSnapshot() {
        return this.withAction("products.getProductDetailSnapshot", async () => {
            await this.ui.detailName().waitFor({ state: "visible" });

            return {
                detailName: ((await this.ui.detailName().textContent()) ?? "").trim(),
                detailPrice: ((await this.ui.detailPrice().textContent()) ?? "").trim(),
                detailDesc: ((await this.ui.detailDesc().textContent()) ?? "").trim(),
            };
        });
    }

    async addToCartByNameContains(name) {
        return this.withAction("products.addToCartByNameContains", async () => {
            const card = await this.getCardByNameContains(name);
            await card.add().click();
        }, { name });
    }

    async removeFromCartByNameContains(name) {
        return this.withAction("products.removeFromCartByNameContains", async () => {
            const card = await this.getCardByNameContains(name);
            await card.remove().click();
        }, { name });
    }
}

module.exports = { ProductsPage };
