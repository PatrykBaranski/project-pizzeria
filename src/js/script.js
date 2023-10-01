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

      thisProduct.dom.priceElem.innerHTML =
        price * thisProduct.amountWidget.value;
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

      const event = new Event("update");
      thisWidget.element.dispatchEvent(event);
    }
  }
  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      console.log("new Cart", thisCart);
    }
    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
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

    init: function () {
      const thisApp = this;
      console.log("*** App starting ***");
      console.log("thisApp:", thisApp);
      console.log("classNames:", classNames);
      console.log("settings:", settings);
      console.log("templates:", templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };
  app.init();
}
