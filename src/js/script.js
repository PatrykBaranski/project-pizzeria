/* global utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: "#template-cart-product",
    },
    containerOf: {
      menu: "#product-list",
      cart: "#cart",
    },
    all: {
      menuProducts: "#product-list > .product",
      menuProductsActive: "#product-list > .product.active",
      formInputs: "input, select",
    },
    menuProduct: {
      clickable: ".product__header",
      form: ".product__order",
      priceElem: ".product__total-price .price",
      imageWrapper: ".product__images",
      amountWidget: ".widget-amount",
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: "input.amount",
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: ".cart__order-summary",
      toggleTrigger: ".cart__summary",
      totalNumber: `.cart__total-number`,
      totalPrice:
        ".cart__total-price strong, .cart__order-total .cart__order-price-sum strong",
      subtotalPrice: ".cart__order-subtotal .cart__order-price-sum strong",
      deliveryFee: ".cart__order-delivery .cart__order-price-sum strong",
      form: ".cart__order",
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: ".widget-amount",
      price: ".cart__product-price",
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
    cart: {
      wrapperActive: "active",
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

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

      thisProduct.prepareCartProduct();
      app.cart.add(thisProduct.prepareCartProduct());
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

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(
        thisWidget.input.value
          ? thisWidget.input.value
          : settings.amountWidget.defaultValue
      );
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = +value;

      thisWidget.input.value = thisWidget.value;
      if (
        thisWidget.value === newValue ||
        isNaN(newValue) ||
        newValue < settings.amountWidget.defaultMin ||
        newValue > settings.amountWidget.defaultMax
      )
        return;
      thisWidget.value = newValue;
      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener("change", () =>
        thisWidget.setValue(thisWidget.input.value)
      );
      thisWidget.linkDecrease.addEventListener("click", (e) => {
        e.preventDefault();
        thisWidget.setValue(+thisWidget.input.value - 1);
      });
      thisWidget.linkIncrease.addEventListener("click", (e) => {
        e.preventDefault();
        thisWidget.setValue(+thisWidget.input.value + 1);
      });
    }
    announce() {
      const thisWidget = this;

      const event = new Event("update", { bubbles: true });
      thisWidget.element.dispatchEvent(event);
    }
  }
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
    }

    initActions() {
      const thisCart = this;
      const { toggleTrigger, wrapper, productList } = thisCart.dom;

      toggleTrigger.addEventListener("click", () =>
        wrapper.classList.toggle(classNames.cart.wrapperActive)
      );
      productList.addEventListener("update", () => {
        thisCart.update();
      });
      productList.addEventListener("remove", (e) => {
        thisCart.remove(e.detail.cartProduct);
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
      console.log(thisCart.products.indexOf(cartProduct));
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
      if (products) thisCart.totalPrice = subtotalPrice + deliveryFee;
      totalNumberElem.innerHTML = totalNumber;
      totalPriceElems.forEach((elem) => (elem.innerHTML = thisCart.totalPrice));
      deliveryFeElem.innerHTML = deliveryFee;
      subtotalPriceElem.innerHTML = subtotalPrice;
    }
  }

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
      const thisCart = this;
      const { remove, edit } = thisCart.dom;

      remove.addEventListener("click", () => {
        thisCart.remove();
        console.log("remove");
      });
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;

      for (const productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function () {
      const thisApp = this;
      console.log("*** App starting ***");
      console.log("thisApp:", thisApp);
      console.log("classNames:", classNames);
      console.log("settings:", settings);
      console.log("templates:", templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };
  app.init();
}
