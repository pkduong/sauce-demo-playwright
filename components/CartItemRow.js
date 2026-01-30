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
        return this.ui.qty(this.root);
    }

    description() {
        return this.ui.description(this.root);
    }

    name() {
        return this.ui.name(this.root);
    }

    removeButton() {
        return this.ui.removeButton(this.root);
    }

    async snapshot() {
        const qty = (await this.qty().textContent())?.trim() ?? "";
        const name = (await this.name().textContent())?.trim() ?? "";
        const description = (await this.description().textContent())?.trim() ?? "";
        return { qty, name, description };
    }

}

module.exports = { CartItemRow };
