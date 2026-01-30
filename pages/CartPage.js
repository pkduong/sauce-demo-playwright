const { BasePage } = require("./BasePage");
const { CartUI } = require("../ui/cart.ui");
const { CartItemRow } = require("../components/CartItemRow");

class CartPage extends BasePage {
    /**
     * @param {import("@playwright/test").Page} page
     * @param {import("@playwright/test").TestInfo} testInfo
     */
    constructor(page, testInfo) {
        super(page, testInfo);
        this.ui = new CartUI(page);
    }

    async waitForCartPage() {
        return this.withAction("cart.waitForCartPage", async () => {
            await this.ui.title().waitFor({ state: "visible" });
            await this.page.waitForURL(/cart\.html/);
        });
    }

    async getPageTitle() {
        return this.withAction("cart.getPageTitle", async () => {
            const text = (await this.ui.title().textContent()) ?? "";
            return text.trim();
        });
    }

    async getCartCount() {
        return this.readOptionalInt(this.ui.cartBadge(), 0, "cart.getCartCount");
    }

    async getItemsCount() {
        return this.withAction("cart.getItemsCount", async () => {
            const count = await this.ui.cartItems().count();
            this.log("Cart item count", { count });
            return count;
        });
    }

    async listItems() {
        return this.withAction("cart.listItems", async () => {
            const items = this.ui.cartItems();
            const count = await items.count();
            const rows = [];
            for (let i = 0; i < count; i++) {
                rows.push(new CartItemRow(items.nth(i), this.ui));
            }
            return rows;
        });
    }

    async removeFirstItem() {
        return this.withAction("cart.removeFirstItem", async () => {
            const firstRoot = this.ui.cartItems().first();
            await firstRoot.waitFor({ state: "visible" });

            const row = new CartItemRow(firstRoot, this.ui);
            await row.removeButton().click();
        });
    }

    async clickContinueShopping() {
        return this.withAction("cart.clickContinueShopping", async () => {
            await Promise.all([
                this.page.waitForURL(/inventory\.html/),
                this.ui.continueShoppingButton().click(),
            ]);
        });
    }

    async clickCheckout() {
        return this.withAction("cart.clickCheckout", async () => {
            await Promise.all([
                this.page.waitForURL(/checkout-step-one\.html/),
                this.ui.checkoutButton().click(),
            ]);
        });
    }

    async getCartSnapshot() {
        return this.withAction("cart.getCartSnapshot", async () => {
            const rows = await this.listItems();
            const first = rows[0];

            const { qty, description } = await first.snapshot();

            await this.ui.continueShoppingButton().waitFor({ state: "visible" });
            await this.ui.checkoutButton().waitFor({ state: "visible" });

            return {
                qty,
                description,
                removeEnabled: await first.removeButton().isEnabled(),
                checkoutEnabled: await this.ui.checkoutButton().isEnabled(),
                continueEnabled: await this.ui.continueShoppingButton().isEnabled(),
            };
        });
    }

}

module.exports = { CartPage };
