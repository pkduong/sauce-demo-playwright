const { BasePage } = require("./BasePage");

class ProductsPage extends BasePage {
    constructor(page) {
        super(page);

        // page-level selectors
        this.titleSel = ".title";
        this.cartLinkSel = ".shopping_cart_link";
        this.cartBadgeSel = ".shopping_cart_badge";

        // inventory list selectors
        this.inventoryItemSel = ".inventory_item";
        this.itemNameSel = ".inventory_item_name";
        this.itemPriceSel = ".inventory_item_price";
        this.addBtnSel = 'button:has-text("Add to cart")';
        this.removeBtnSel = 'button:has-text("Remove")';

        // detail selectors
        this.detailNameSel = ".inventory_details_name";
        this.detailPriceSel = ".inventory_details_price";
        this.detailDescSel = ".inventory_details_desc";
        this.backToProductsSel = "#back-to-products";

        // locators
        this.title = this.page.locator(this.titleSel);
        this.cartLink = this.page.locator(this.cartLinkSel);
        this.inventoryItems = this.page.locator(this.inventoryItemSel);

        this.detailName = this.page.locator(this.detailNameSel);
        this.detailPrice = this.page.locator(this.detailPriceSel);
        this.detailDesc = this.page.locator(this.detailDescSel);
        this.backToProductsButton = this.page.locator(this.backToProductsSel);
    }

    async waitForProductPage() {
        await this.title.waitFor({ state: "visible" });
        await this.page.waitForURL(/inventory\.html/);
    }

    async openCart() {
        await Promise.all([
            this.page.waitForURL(/cart\.html/),
            this.cartLink.click(),
        ]);
    }

    // --- product finder + item wrapper ---
    productItemByNameContains(name) {
        // filter inventory_item by text in itemNameSel
        return this.inventoryItems
            .filter({ has: this.page.locator(this.itemNameSel, { hasText: name }) })
            .first();
    }

    async findProductByNameContains(name) {
        const item = this.productItemByNameContains(name);
        await item.waitFor({ state: "visible" });
        return item;
    }

    getProductItem(itemRoot) {
        return {
            root: itemRoot,
            name: itemRoot.locator(this.itemNameSel),
            price: itemRoot.locator(this.itemPriceSel),
            addToCart: itemRoot.locator(this.addBtnSel),
            remove: itemRoot.locator(this.removeBtnSel),
        };
    }

    async openProductDetailByNameContains(name) {
        const item = await this.findProductByNameContains(name);
        const product = this.getProductItem(item);

        await product.name.click();
        await this.detailName.waitFor({ state: "visible" });
    }

    async backToProducts() {
        await Promise.all([
            this.page.waitForURL(/inventory\.html/),
            this.backToProductsButton.click(),
        ]);
    }

    async addToCartByNameContains(name) {
        const item = await this.findProductByNameContains(name);
        const product = this.getProductItem(item);
        await product.addToCart.click();
    }

    async addFirstProductToCart() {
        const first = this.inventoryItems.first();
        await first.waitFor({ state: "visible" });

        const product = this.getProductItem(first);
        const name = (await product.name.textContent())?.trim() ?? "";

        this.log(`Adding product to cart: ${name}`);
        await product.addToCart.click();

        return name;
    }

    async getAllProducts() {
        const count = await this.inventoryItems.count();
        this.log(`Found ${count} products`);

        const products = [];
        for (let i = 0; i < count; i++) {
            const item = this.inventoryItems.nth(i);
            const product = this.getProductItem(item);

            const name = (await product.name.textContent())?.trim() ?? "";
            const price = (await product.price.textContent())?.trim() ?? "";

            products.push({ name, price });
        }
        return products;
    }

    // --- detail getters used in tests ---
    async getDetailName() {
        await this.detailName.waitFor({ state: "visible" });
        return (await this.detailName.textContent())?.trim() ?? "";
    }

    async getDetailPrice() {
        await this.detailPrice.waitFor({ state: "visible" });
        return (await this.detailPrice.textContent())?.trim() ?? "";
    }

    async getDetailDesc() {
        await this.detailDesc.waitFor({ state: "visible" });
        return (await this.detailDesc.textContent())?.trim() ?? "";
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

module.exports = { ProductsPage };
