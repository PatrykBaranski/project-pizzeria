import { templates, select } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.dom = {};

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    const menuContainer = document.querySelector(select.containerOf.menu);

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.dom = {
      accordionTrigger: thisProduct.element.querySelector(
        select.menuProduct.clickable
      ),
      form: thisProduct.element.querySelector(select.menuProduct.form),
      formInputs: thisProduct.element
        .querySelector(select.menuProduct.form)
        .querySelectorAll(select.all.formInputs),
      cartButton: thisProduct.element.querySelector(
        select.menuProduct.cartButton
      ),
      priceElem: thisProduct.element.querySelector(
        select.menuProduct.priceElem
      ),
      imageWrapper: thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      ),
      amountWidgetElem: thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      ),
    };
  }

  initAccordion() {
    const thisProduct = this;

    thisProduct.dom.accordionTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      const activeProducts = document.querySelectorAll(
        select.all.menuProductsActive
      );

      activeProducts.forEach((product) =>
        product !== thisProduct.element
          ? product.classList.remove("active")
          : ""
      );

      thisProduct.element.classList.toggle("active");
    });
  }

  initOrderForm() {
    const thisProduct = this;
    const { form, formInputs, cartButton } = thisProduct.dom;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      thisProduct.processOrder();
    });

    formInputs.forEach((input) =>
      input.addEventListener("change", () => {
        thisProduct.processOrder();
      })
    );

    cartButton.addEventListener("click", (e) => {
      e.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart(thisProduct);
    });
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(
      thisProduct.dom.amountWidgetElem
    );
    thisProduct.dom.amountWidgetElem.addEventListener("update", () => {
      thisProduct.processOrder();
    });
  }

  processOrder() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    let price = thisProduct.data.price;

    for (const paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      const checkedOptions = formData[paramId];

      for (const optionId in param.options) {
        const option = param.options[optionId];
        const optionImageEl = thisProduct.dom.imageWrapper.querySelector(
          `.${paramId}-${optionId}`
        );

        optionImageEl?.classList.remove("active");
        if (checkedOptions.includes(optionId))
          optionImageEl?.classList.add("active");
        if (checkedOptions.includes(optionId) && !option.default)
          price += option.price;
        if (!checkedOptions.includes(optionId) && option.default)
          price -= option.price;
      }
    }

    thisProduct.priceSingle = price;
    thisProduct.dom.priceElem.innerHTML =
      price * thisProduct.amountWidget.value;
  }
  addToCart() {
    const thisProduct = this;

    const event = new CustomEvent("add-to-cart", {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct() {
    const thisProduct = this;
    const {
      id,
      data: { name },
      amountWidget: { value: amount },
      priceSingle,
    } = thisProduct;
    const productSummary = {
      id,
      name,
      amount,
      priceSingle,
      price: priceSingle * amount,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }
  prepareCartProductParams() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const productParams = {};
    for (const paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      const checkedOptions = formData[paramId];

      productParams[paramId] = {
        label: param.label,
        options: {},
      };
      for (const optionId in param.options) {
        const option = param.options[optionId];

        if (checkedOptions.includes(optionId)) {
          productParams[paramId].options[optionId] = option.label;
        }
      }
    }
    return productParams;
  }
}

export default Product;
