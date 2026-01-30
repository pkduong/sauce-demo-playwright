class CartUI {
    /**
     * @param {import("@playwright/test").Page} page
     */
    constructor(page) {
        this.page = page;
    }

    // Page-level
    title() {
        return this.page.locator(".title");
    }

    cartItems() {
        return this.page.locator(".cart_item");
    }

    cartBadge() {
        return this.page.locator(".shopping_cart_badge");
    }

    continueShoppingButton() {
        return this.page.locator("#continue-shopping");
    }

    checkoutButton() {
        return this.page.locator("#checkout");
    }

    // Item scoped locators (require root)
    itemQty(root) {
        return root.locator(".cart_quantity");
    }

    itemDesc(root) {
        return root.locator(".inventory_item_desc");
    }

    itemName(root) {
        return root.locator(".inventory_item_name");
    }

    itemRemoveButton(root) {
        // Use role/name when possible; demo app supports it fine
        return root.getByRole("button", { name: /remove/i });
    }

    // Finder patterns (anchor -> filter)
    itemByNameContains(name) {
        return this.cartItems()
            .filter({ has: this.page.locator(".inventory_item_name", { hasText: name }) })
            .first();
    }
}

module.exports = { CartUI };
