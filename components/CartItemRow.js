class CartItemRow {
    /**
     * @param {import("@playwright/test").Locator} root
     * @param {import("../ui/cart.ui").CartUI} ui
     */
    constructor(root, ui) {
        this.root = root;
        this.ui = ui;
    }

    qty() {
        return this.ui.itemQty(this.root);
    }

    desc() {
        return this.ui.itemDesc(this.root);
    }

    name() {
        return this.ui.itemName(this.root);
    }

    removeButton() {
        return this.ui.itemRemoveButton(this.root);
    }
}

module.exports = { CartItemRow };
