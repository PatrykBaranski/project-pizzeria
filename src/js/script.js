/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: "active",
      imageVisible: "active",
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
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

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
    }

    initAccordion() {
      const thisProduct = this;

      thisProduct.accordionTrigger.addEventListener("click", (e) => {
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

      thisProduct.form.addEventListener("submit", function (e) {
        e.preventDefault();
        thisProduct.processOrder();
      });

      thisProduct.formInputs.forEach((input) =>
        input.addEventListener("change", () => {
          thisProduct.processOrder();
        })
      );

      thisProduct.cartButton.addEventListener("click", function (e) {
        e.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;

      for (const paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        const checkedOptions = formData[paramId];

        for (const optionId in param.options) {
          const option = param.options[optionId];

          if (checkedOptions.includes(optionId) && !option.default)
            price += option.price;

          if (!checkedOptions.includes(optionId) && option.default)
            price -= option.price;
        }
      }

      thisProduct.priceElem.innerHTML = price;
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
