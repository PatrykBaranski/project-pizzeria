import { settings, select, classNames, templates } from "../settings.js";
import utils from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFeElem = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPriceElem = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPriceElems = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumberElem = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
  }

  initActions() {
    const thisCart = this;
    const { toggleTrigger, wrapper, productList, form } = thisCart.dom;

    toggleTrigger.addEventListener("click", () =>
      wrapper.classList.toggle(classNames.cart.wrapperActive)
    );
    productList.addEventListener("update", () => {
      thisCart.update();
    });
    productList.addEventListener("remove", (e) => {
      thisCart.remove(e.detail.cartProduct);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder() {
    const thisCart = this;
    const { address, phone } = thisCart.dom;
    const { totalPrice, totalNumber, deliveryFee, subtotalPrice } = thisCart;
    const url = `${settings.db.url}/${settings.db.orders}`;
    const payload = {
      address: address.value,
      phone: phone.value,
      totalPrice,
      subtotalPrice,
      totalNumber,
      deliveryFee,
      products: thisCart.products.map((product) => product.getData()),
    };
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      console.log("response:", response);
    });
  }

  add(menuProduct) {
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  remove(cartProduct) {
    const thisCart = this;

    cartProduct.dom.wrapper.remove();
    thisCart.products.splice(thisCart.products.indexOf(cartProduct), 1);
    thisCart.update();
  }
  update() {
    const thisCart = this;
    const {
      totalNumberElem,
      totalPriceElems,
      subtotalPriceElem,
      deliveryFeElem,
    } = thisCart.dom;
    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0,
      subtotalPrice = 0;
    const { products } = thisCart;

    products.forEach((product) => {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    });
    if (products) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }

    thisCart.totalNumber = totalNumber;
    thisCart.deliveryFee = deliveryFee;
    thisCart.subtotalPrice = subtotalPrice;
    totalNumberElem.innerHTML = totalNumber;
    totalPriceElems.forEach(
      (elem) => (elem.innerHTML = subtotalPrice ? thisCart.totalPrice : 0)
    );
    deliveryFeElem.innerHTML = subtotalPrice ? deliveryFee : 0;
    subtotalPriceElem.innerHTML = subtotalPrice;
  }
}

export default Cart;
