import { settings, select, classNames } from "./settings.js";
import Cart from "./components/Cart.js";
import Product from "./components/Product.js";
import Booking from "./components/Booking.js";
import Home from "./components/Home.js";

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

  activatePage: function (pageID) {
    const thisApp = this;

    [...thisApp.pages].forEach((page) =>
      page.classList.toggle(classNames.pages.active, pageID === page.id)
    );

    thisApp.navLinks.forEach((link) =>
      link.classList.toggle(
        classNames.nav.active,
        pageID === link.getAttribute("href").slice(1)
      )
    );
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

  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = [
      ...document.querySelectorAll(select.nav.links),
      ...document.querySelectorAll(select.all.homeNavLinks),
    ];

    const windowID = window.location.hash.slice(1, -1);
    let pageMatchingHash = thisApp.pages[0].id;

    [...thisApp.pages].forEach((page) => {
      if (page.id === windowID) {
        pageMatchingHash = page.id;
      }
    });

    thisApp.activatePage(pageMatchingHash);
    thisApp.navLinks.forEach((link) =>
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const clickedElement = this;
        const clickedElementHref = clickedElement.getAttribute("href");

        thisApp.activatePage(clickedElementHref.slice(1));

        window.location.hash = `${clickedElementHref}/`;
      })
    );
  },

  initBooking: function () {
    const thisApp = this;
    const bookingContainer = document.querySelector(select.containerOf.booking);

    thisApp.booking = new Booking(bookingContainer);
  },
  initHome: function () {
    const thisApp = this;

    thisApp.home = new Home();
  },
  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initHome();
  },
};

app.init();
