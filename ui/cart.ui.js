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
    qty(root) {
        return root.locator(".cart_quantity");
    }

    description(root) {
        return root.locator(".inventory_item_desc");
    }

    name(root) {
        return root.locator(".inventory_item_name");
    }

    removeButton(root) {
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
