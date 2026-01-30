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


    // OOP-ready contract (override BasePage.waitUntilReady)
    async waitUntilReady() {
        return this.withAction("cart.waitUntilReady", async () => {
            // Page-level anchor
            await this.ui.title().waitFor({ state: "visible" });

            // Navigation contract
            await this.page.waitForURL(/cart\.html/);

            // If cart may be empty, don't wait for first item visibility
            await this.ui.continueShoppingButton().waitFor({ state: "visible" });
            await this.ui.checkoutButton().waitFor({ state: "visible" });
        });
    }

    // async waitForCartPage() {
    //     return this.withAction("cart.waitForCartPage", async () => {
    //         await this.ui.title().waitFor({ state: "visible" });
    //         await this.page.waitForURL(/cart\.html/);
    //     });
    // }

    async getItemsCount() {
        return this.withAction("cart.getItemsCount", async () => {
            const count = await this.ui.cartItems().count();
            this.log("Cart item count", { count });
            return count;
        });
    }

    async getAllItems() {
        return this.withAction("cart.getAllItems", async () => {
            const items = this.ui.cartItems();
            const count = await items.count();
            const rows = [];
            for (let i = 0; i < count; i++) {
                rows.push(new CartItemRow(items.nth(i), this.ui));
            }
            return rows;
        });
    }

    async getFirstItem() {
        return this.withAction("cart.getFirstItem", async () => {
            const root = this.ui.cartItems().first();
            await root.waitFor({ state: "visible" });
            return new CartItemRow(root, this.ui);
        });
    }

    async removeFirstItem() {
        return this.withAction("cart.removeFirstItem", async () => {
            const item = await this.getFirstItem();
            await this.safeClick(item.removeButton(), "cart.clickRemoveFirstItem");
        });
    }

    async removeItemByNameContains(name) {
        return this.withAction("cart.removeItemByNameContains", async () => {
            const root = this.ui.itemByNameContains(name);
            await root.waitFor({ state: "visible" });
            const row = new CartItemRow(root, this.ui);
            await this.safeClick(row.removeButton(), "cart.clickRemoveByName", { name });
        }, { name });
    }

    async getCartCount() {
        return this.withAction("cart.getCartCount", async () => {
            const badge = this.ui.cartBadge();
            if (await badge.count()) {
                const text = (await badge.textContent())?.trim();
                const count = text ? Number(text) : 0;
                this.log("Cart badge count", { count });
                return count;
            }
            this.log("Cart badge not visible, count = 0");
            return 0;
        });
    }

    /**
     * Snapshot intended for tests to assert state (keeps asserts out of POM).
     * Uses UI map methods only (no raw selectors).
     */
    async getCartSnapshot() {
        return this.withAction("cart.getCartSnapshot", async () => {
            const firstRoot = this.ui.cartItems().first();
            await firstRoot.waitFor({ state: "visible" });

            const qtyText = (await this.ui.itemQty(firstRoot).textContent())?.trim() ?? "";
            const descText = (await this.ui.itemDesc(firstRoot).textContent())?.trim() ?? "";

            await this.ui.continueShoppingButton().waitFor({ state: "visible" });
            await this.ui.checkoutButton().waitFor({ state: "visible" });

            const removeEnabled = await this.ui.itemRemoveButton(firstRoot).isEnabled();
            const checkoutEnabled = await this.ui.checkoutButton().isEnabled();
            const continueEnabled = await this.ui.continueShoppingButton().isEnabled();

            return { qtyText, descText, removeEnabled, checkoutEnabled, continueEnabled };
        });
    }

    async getFirstItemQtyAndDescription() {
        const { qtyText, descText } = await this.getCartSnapshot();
        return { qtyText, descText };
    }

    async getCartUIEnabledState() {
        const { removeEnabled, checkoutEnabled, continueEnabled } = await this.getCartSnapshot();
        return { removeEnabled, checkoutEnabled, continueEnabled };
    }
}

module.exports = { CartPage };
