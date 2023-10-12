import { settings, select } from "./settings.js";
import Cart from "./components/Cart.js";
import Product from "./components/Product.js";

const app = {
  initMenu: function () {
    const thisApp = this;

    thisApp.data.forEach((product) => new Product(product.id, product));
  },

  initData: async function () {
    const thisApp = this;
    try {
      const url = `${settings.db.url}/${settings.db.products}`;
      const response = await fetch(url);
      const data = await response.json();
      thisApp.data = data;
      thisApp.initMenu();
    } catch (error) {
      console.log(error);
    }
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);

    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener("add-to-cart", (e) => {
      app.cart.add(e.detail.product);
    });
  },
  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
  },
};
app.init();
