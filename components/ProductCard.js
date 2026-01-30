class ProductCard {
    /**
     * @param {import("@playwright/test").Locator} root
     * @param {import("../ui/products.ui").ProductsUI} ui
     */
    constructor(root, ui) {
        this.root = root;
        this.ui = ui;
    }

    name() { return this.ui.name(this.root); }
    price() { return this.ui.price(this.root); }
    add() { return this.ui.addButton(this.root); }
    remove() { return this.ui.removeButton(this.root); }
}

module.exports = { ProductCard };
