const { BasePage } = require("./BasePage");

class ProductsPage extends BasePage {
    constructor(page, testInfo) {
        super(page, testInfo);

        /* ===============================
           SHARED / GLOBAL SELECTORS
        =============================== */
        this.titleSel = ".title";
        this.cartLinkSel = ".shopping_cart_link";
        this.cartBadgeSel = ".shopping_cart_badge";

        this.title = this.page.locator(this.titleSel);
        this.cartLink = this.page.locator(this.cartLinkSel);

        /* ===============================
           PRODUCT LIST PAGE (inventory.html)
        =============================== */
        this.inventoryItemSel = ".inventory_item";
        this.itemNameSel = ".inventory_item_name";
        this.itemPriceSel = ".inventory_item_price";
        this.addBtnSel = 'button:has-text("Add to cart")';
        this.removeBtnSel = 'button:has-text("Remove")';

        this.inventoryItems = this.page.locator(this.inventoryItemSel);

        /* ===============================
           PRODUCT DETAIL PAGE (inventory-item.html)
        =============================== */
        this.detailNameSel = ".inventory_details_name";
        this.detailPriceSel = ".inventory_details_price";
        this.detailDescSel = ".inventory_details_desc";
        this.backToProductsSel = "#back-to-products";

        this.detailName = this.page.locator(this.detailNameSel);
        this.detailPrice = this.page.locator(this.detailPriceSel);
        this.detailDesc = this.page.locator(this.detailDescSel);
        this.backToProductsButton = this.page.locator(this.backToProductsSel);
    }

    /* =====================================================
       PRODUCT LIST PAGE – ACTIONS & HELPERS
    ===================================================== */

    async waitForProductListPage() {
        return this.withAction("products.waitForProductListPage", async () => {
            await this.title.waitFor({ state: "visible" });
            await this.page.waitForURL(/inventory\.html/);
        });
    }

    productItemByNameContains(name) {
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

    async getProductItemSnapshot(itemRoot) {
        return this.withAction("products.getProductItemSnapshot", async () => {
            await itemRoot.waitFor({ state: "visible" });

            const product = this.getProductItem(itemRoot);

            const name = (await product.name.textContent())?.trim() ?? "";
            const price = (await product.price.textContent())?.trim() ?? "";

            // Optional: for later used in case of UI check button status
            // const canAdd = await product.addToCart.isVisible().catch(() => false);

            return { name, price };
        });
    }


    async openProductDetailByNameContains(name) {
        return this.withAction("products.openProductDetail", async () => {
            const item = await this.findProductByNameContains(name);
            const product = this.getProductItem(item);

            await this.safeClick(product.name, "products.clickProductName", { name });
            await this.detailName.waitFor({ state: "visible" });
        }, { name });
    }

    async addToCartByNameContains(name) {
        return this.withAction("products.addToCartByNameContains", async () => {
            const item = await this.findProductByNameContains(name);
            const product = this.getProductItem(item);

            await this.safeClick(product.addToCart, "products.clickAddToCart", { name });
        }, { name });
    }

    async addFirstProductToCart() {
        return this.withAction("products.addFirstProductToCart", async () => {
            const first = this.inventoryItems.first();
            await first.waitFor({ state: "visible" });

            const product = this.getProductItem(first);
            const name = (await product.name.textContent())?.trim() ?? "";

            await this.safeClick(product.addToCart, "products.clickAddToCart", { name });
            return name;
        });
    }

    async getAllProducts() {
        const count = await this.inventoryItems.count();
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

    /* =====================================================
       PRODUCT DETAIL PAGE – SNAPSHOT & ACTIONS
    ===================================================== */

    async getProductDetailSnapshot() {
        return this.withAction("products.getProductDetailSnapshot", async () => {
            await this.detailName.waitFor({ state: "visible" });

            const detailName = (await this.detailName.textContent())?.trim() ?? "";
            const detailPrice = (await this.detailPrice.textContent())?.trim() ?? "";
            const detailDesc = (await this.detailDesc.textContent())?.trim() ?? "";

            return { detailName, detailPrice, detailDesc };
        });
    }

    async backToProducts() {
        return this.withAction("products.backToProducts", async () => {
            await Promise.all([
                this.page.waitForURL(/inventory\.html/),
                this.backToProductsButton.click(),
            ]);
        });
    }

    /* =====================================================
       CART / HEADER HELPERS
    ===================================================== */

    async openCart() {
        return this.withAction("products.openCart", async () => {
            await Promise.all([
                this.page.waitForURL(/cart\.html/),
                this.cartLink.click(),
            ]);
        });
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
