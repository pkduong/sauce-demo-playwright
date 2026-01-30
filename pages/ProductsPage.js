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
    //Override method to wait until page is ready
    async waitUntilReady() {
        return this.withAction("products.waitUntilReady", async () => {
            await this.ui.title().waitFor({ state: "visible" });

            // updated a way of waiting-load stronger than URL-only: ensures list is actually rendered
            await this.ui.inventoryItems().first().waitFor({ state: "visible" });
        });
    }

    // async waitForProductListPage() {
    //     return this.withAction("products.waitForProductListPage", async () => {
    //         await this.ui.title().waitFor({ state: "visible" });
    //         await this.page.waitForURL(/inventory\.html/);
    //     });
    // }

    async openCart() {
        return this.withAction("products.openCart", async () => {
            await Promise.all([
                this.page.waitForURL(/cart\.html/),
                this.ui.cartLink().click(),
            ]);
        });
    }

    async getCartCount() {
        return this.withAction("products.getCartCount", async () => {
            const badge = this.ui.cartBadge();
            if (await badge.count()) {
                const text = (await badge.textContent())?.trim();
                return text ? Number(text) : 0;
            }
            return 0;
        });
    }

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
                name: (await card.name().textContent())?.trim() ?? "",
                price: (await card.price().textContent())?.trim() ?? "",
            };
        }, { name });
    }

    async addToCartByNameContains(name) {
        return this.withAction("products.addToCartByNameContains", async () => {
            const card = await this.getCardByNameContains(name);
            await this.safeClick(card.add(), "products.clickAddToCart", { name });
        }, { name });
    }

    async openProductDetailByNameContains(name) {
        return this.withAction("products.openProductDetailByNameContains", async () => {
            const root = this.ui.itemByNameContains(name);
            await root.waitFor({ state: "visible" });

            await this.safeClick(this.ui.itemName(root), "products.clickProductName", { name });
            await this.ui.detailName().waitFor({ state: "visible" });
            await this.page.waitForURL(/inventory-item\.html/);
        }, { name });
    }

    async getProductDetailSnapshot() {
        return this.withAction("products.getProductDetailSnapshot", async () => {
            await this.ui.detailName().waitFor({ state: "visible" });

            const detailName = (await this.ui.detailName().textContent())?.trim() ?? "";
            const detailPrice = (await this.ui.detailPrice().textContent())?.trim() ?? "";
            const detailDesc = (await this.ui.detailDesc().textContent())?.trim() ?? "";

            return { detailName, detailPrice, detailDesc };
        });
    }

    async backToProducts() {
        return this.withAction("products.backToProducts", async () => {
            await Promise.all([
                this.page.waitForURL(/inventory\.html/),
                this.ui.backToProducts().click(),
            ]);
        });
    }
}

module.exports = { ProductsPage };
