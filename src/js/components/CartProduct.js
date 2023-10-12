import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    for (const key in menuProduct) {
      thisCartProduct[key] = menuProduct[key];
    }
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    const wrapper = thisCartProduct.dom.wrapper;
    thisCartProduct.dom.amountWidgetElem = wrapper.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.priceElem = wrapper.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = wrapper.querySelector(
      select.cartProduct.remove
    );
  }

  initAmountWidget() {
    const thisCartProduct = this;
    const { amountWidgetElem, priceElem } = thisCartProduct.dom;

    thisCartProduct.amountWidget = new AmountWidget(amountWidgetElem);
    amountWidgetElem.addEventListener("update", () => {
      const amountWidgetValue = thisCartProduct.amountWidget.value;

      thisCartProduct.amount = amountWidgetValue;
      thisCartProduct.price = thisCartProduct.priceSingle * amountWidgetValue;
      priceElem.innerHTML = thisCartProduct.price;
    });
  }

  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent("remove", {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions() {
    const thisCartProduct = this;
    const { remove } = thisCartProduct.dom;

    remove.addEventListener("click", () => {
      thisCartProduct.remove();
    });
  }

  getData() {
    const thisCartProduct = this;
    const { id, amount, price, priceSingle, name, params } = thisCartProduct;
    return {
      id,
      amount,
      price,
      priceSingle,
      name,
      params,
    };
  }
}
export default CartProduct;
