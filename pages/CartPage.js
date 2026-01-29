const { BasePage } = require("./BasePage");

class CartPage extends BasePage {
    constructor(page, testInfo) {
        super(page, testInfo);

        // page-level selectors
        this.titleSel = ".title";
        this.cartItemSel = ".cart_item";
        this.cartBadgeSel = ".shopping_cart_badge";

        // item-level selectors (scoped under cart item root)
        this.itemQtySel = ".cart_quantity";
        this.itemDescSel = ".inventory_item_desc";
        this.itemNameSel = ".inventory_item_name";
        this.itemRemoveBtnSel = 'button:has-text("Remove")';

        // page buttons
        this.continueShoppingSel = "#continue-shopping";
        this.checkoutSel = "#checkout";

        // locators
        this.title = this.page.locator(this.titleSel);
        this.cartItems = this.page.locator(this.cartItemSel);

        this.continueShoppingButton = this.page.locator(this.continueShoppingSel);
        this.checkoutButton = this.page.locator(this.checkoutSel);
    }

    // --- page helpers ---
    async waitForCartPage() {
        return this.withAction("cart.waitForCartPage", async () => {
            await this.title.waitFor({ state: "visible" });
            await this.page.waitForURL(/cart\.html/);
        });
    }

    async removeFirstItem() {
        return this.withAction("cart.removeFirstItem", async () => {
            const first = this.cartItems.first();
            await first.waitFor({ state: "visible" });
            await this.safeClick(first.locator(this.itemRemoveBtnSel), "cart.clickRemoveFirstItem");
        });
    }

    async getCartSnapshot() {
        return this.withAction("cart.getCartSnapshot", async () => {
            const first = this.cartItems.first();
            await first.waitFor({ state: "visible" });

            const qtyText = (await first.locator(this.itemQtySel).textContent())?.trim() ?? "";
            const descText = (await first.locator(this.itemDescSel).textContent())?.trim() ?? "";

            await this.continueShoppingButton.waitFor({ state: "visible" });
            await this.checkoutButton.waitFor({ state: "visible" });

            const removeEnabled = await first.locator(this.itemRemoveBtnSel).isEnabled();
            const checkoutEnabled = await this.checkoutButton.isEnabled();
            const continueEnabled = await this.continueShoppingButton.isEnabled();

            return {
                qtyText,
                descText,
                removeEnabled,
                checkoutEnabled,
                continueEnabled,
            };
        });
    }

    // --- data getters used by tests ---

    async getFirstItemQtyAndDescription() {
        const { qtyText, descText } = await this.getCartSnapshot();
        return { qtyText, descText };
    }

    async getCartUIEnabledState() {
        const { removeEnabled, checkoutEnabled, continueEnabled } =
            await this.getCartSnapshot();

        return { removeEnabled, checkoutEnabled, continueEnabled };
    }

    async getItemsCount() {
        return this.withAction("cart.getItemsCount", async () => {
            const count = await this.cartItems.count();
            this.log("Cart item count", { count });
            return count;
        });
    }

    async getCartCount() {
        return this.withAction("cart.getCartCount", async () => {
            const badge = this.page.locator(this.cartBadgeSel);

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


}

module.exports = { CartPage };
