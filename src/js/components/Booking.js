import { select, templates } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = templates.bookingWidget();
    thisBooking.dom.peopleAmount = document.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = document.querySelector(
      select.booking.hoursAmount
    );
  }

  initWidgets() {
    const thisBooking = this;
    const { peopleAmount, hoursAmount } = thisBooking.dom;
    new AmountWidget(peopleAmount);
    new AmountWidget(hoursAmount);

    peopleAmount.addEventListener("update", () => {});
    hoursAmount.addEventListener("update", () => {});
  }
}

export default Booking;
