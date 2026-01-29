const { BasePage } = require("./BasePage");

class CartPage extends BasePage {
    constructor(page) {
        super(page);

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
        await this.title.waitFor({ state: "visible" });
        await this.page.waitForURL(/cart\.html/);
    }

    // --- data getters used by tests ---
    async getFirstItemQtyAndDescription() {
        const first = this.cartItems.first();
        await first.waitFor({ state: "visible" });

        const qtyText = (await first.locator(this.itemQtySel).textContent())?.trim() ?? "";
        const descText = (await first.locator(this.itemDescSel).textContent())?.trim() ?? "";

        return { qtyText, descText };
    }

    async getCartUIEnabledState() {
        // These buttons exist on cart page; ensure visible first
        await this.continueShoppingButton.waitFor({ state: "visible" });
        await this.checkoutButton.waitFor({ state: "visible" });

        const first = this.cartItems.first();
        await first.waitFor({ state: "visible" });

        const removeEnabled = await first.locator(this.itemRemoveBtnSel).isEnabled();
        const checkoutEnabled = await this.checkoutButton.isEnabled();
        const continueEnabled = await this.continueShoppingButton.isEnabled();

        return { removeEnabled, checkoutEnabled, continueEnabled };
    }

    async removeFirstItem() {
        const first = this.cartItems.first();
        await first.waitFor({ state: "visible" });
        await first.locator(this.itemRemoveBtnSel).click();
    }

    async getItemsCount() {
        return await this.cartItems.count();
    }

    async getCartCount() {
        const badge = this.page.locator(this.cartBadgeSel);
        if (await badge.count()) {
            const text = (await badge.textContent())?.trim();
            return text ? Number(text) : 0;
        }
        return 0;
    }
}

module.exports = { CartPage };
