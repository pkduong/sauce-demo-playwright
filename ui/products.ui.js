class ProductsUI {
    constructor(page) {
        this.page = page;
    }

    // Stable anchors
    title() { return this.page.locator(".title"); }
    cartLink() { return this.page.locator(".shopping_cart_link"); }
    cartBadge() { return this.page.locator(".shopping_cart_badge"); }

    // List root
    inventoryItems() { return this.page.locator(".inventory_item"); }

    // Item “sub-locators” (scoped under root)
    name(root) { return root.locator(".inventory_item_name"); }
    price(root) { return root.locator(".inventory_item_price"); }
    addButton(root) { return root.getByRole("button", { name: /add to cart/i }); }
    removeButton(root) { return root.getByRole("button", { name: /remove/i }); }

    // Detail
    detailName() { return this.page.locator(".inventory_details_name"); }
    detailPrice() { return this.page.locator(".inventory_details_price"); }
    detailDesc() { return this.page.locator(".inventory_details_desc"); }
    backToProductsButton() { return this.page.locator("#back-to-products"); }

    // Finder: stable anchor → scoped match
    itemByNameContains(name) {
        return this.inventoryItems()
            .filter({ has: this.page.locator(".inventory_item_name", { hasText: name }) })
            .first();
    }
}

module.exports = { ProductsUI };
