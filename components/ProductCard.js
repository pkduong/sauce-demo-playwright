class ProductCard {
    /**
     * @param {import("@playwright/test").Locator} root
     * @param {import("../ui/products.ui").ProductsUI} ui
     */
    constructor(root, ui) {
        this.root = root;
        this.ui = ui;
    }

    name() { return this.ui.itemName(this.root); }
    price() { return this.ui.itemPrice(this.root); }
    add() { return this.ui.addBtn(this.root); }
    remove() { return this.ui.removeBtn(this.root); }
}

module.exports = { ProductCard };
