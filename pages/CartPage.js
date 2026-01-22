// Methods:
// - Verify quantity + description presence
// - Verify buttons enabled (Remove / Checkout / Continue Shopping)
// - Remove product
// - Get badge/count after removal

const { BasePage } = require("./BasePage");

class CartPage extends BasePage {

    constructor(page) {
        super(page);
        this.cartTitle = page.locator(".title");
        this.cartItems = page.locator(".cart_item");

        this.qty = page.locator(".cart_quantity");
        this.description = page.locator(".inventory_item_desc");

        this.removeButton = page.locator('button:has-text("Remove")');
        this.checkoutButton = page.locator("button#checkout");
        this.continueShoppingButton = page.locator("button#continue-shopping");

        this.cartBadge = page.locator(".shopping_cart_badge");
    }

    async assertCartPage() {
        await this.cartTitle.waitFor({ state: "visible" });
        this.log(`Cart page title: ${await this.cartTitle.textContent()}`);
    }

    async assertCartUIEnable() {
        //Verify button enable
        await this.removeButton.first().waitFor({ state: "visible" });

        const removeEnabled = await this.removeButton.first().isEnabled();
        const checkoutEnabled = await this.checkoutButton.first().isEnabled();
        const continueEnabled = await this.continueShoppingButton.isEnabled();

        this.log(`Button enable? remove=${removeEnabled}, checkout=${checkoutEnabled}, continue=${continueEnabled}`);

        return { removeEnabled, checkoutEnabled, continueEnabled };

    }

    async assertQuantityAndDescriptionPresent() {
        await this.qty.first().waitFor({ state: "visible" });
        await this.description.first().waitFor({ state: "visible" });

        const qtyText = (await this.qty.first().textContent());
        const descText = (await this.description.first().textContent());

        this.log(`Cart qty: ${qtyText}`);
        this.log(`Cart desc: ${(descText || "").slice(0, 50)}...)`);

        return { qtyText, descText };
    }

    async removeFirstItem() {
        this.log("Removing first item from cart");
        await this.removeButton.first().click();
    }

    async getCartCount() {
        if (await this.cartBadge.isVisible()) {
            const txt = (await this.cartBadge.textContent());
            return Number(txt);
        }
        return 0;
    }

    async getItemsCount() {
        return await this.cartItems.count();
    }
}

module.exports = { CartPage }; 