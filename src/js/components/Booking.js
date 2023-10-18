import { classNames, select, settings, templates } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.selectedTable = null;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(
      thisBooking.datePicker.minDate
    )}`;

    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(
      thisBooking.datePicker.maxDate
    )}`;

    const params = {
      booking: [startDateParam, endDateParam],

      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],

      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking: `${settings.db.url}/${
        settings.db.bookings
      }?${params.booking.join("&")}`,

      eventsCurrent: `${settings.db.url}/${
        settings.db.events
      }?${params.eventsCurrent.join("&")}`,

      eventsRepeat: `${settings.db.url}/${
        settings.db.events
      }?${params.eventsRepeat.join("&")}`,
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then((allResponse) => {
        const [bookingResponse, eventsCurrentResponse, eventsRepeatResponse] =
          allResponse;

        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then((data) => thisBooking.parseData(data));
  }

  parseData([bookings, eventsCurrent, eventsRepeat]) {
    const thisBooking = this;
    const { minDate, maxDate } = thisBooking.datePicker;

    thisBooking.booked = {};

    bookings.forEach(({ date, hour, duration, table }) => {
      thisBooking.makeBooked(date, hour, duration, table);
    });

    eventsCurrent.forEach(({ date, hour, duration, table }) => {
      thisBooking.makeBooked(date, hour, duration, table);
    });

    eventsRepeat.forEach(({ hour, duration, table, repeat }) => {
      if (repeat == "daily") {
        for (let i = minDate; i <= maxDate; i = utils.addDays(i, 1)) {
          thisBooking.makeBooked(utils.dateToStr(i), hour, duration, table);
        }
      }
    });

    thisBooking.updateDOM();
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] === "undefined" ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ===
        "undefined"
    ) {
      allAvailable = true;
    }

    thisBooking.dom.tables.forEach((table) => {
      let tableID = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableID)) {
        tableID = parseInt(tableID);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableID)
      ) {
        table.classList.add(classNames.booking.tableBooked);
        thisBooking.resetActiveTables();
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    });
  }

  makeBooked(data, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[data] === "undefined") {
      thisBooking.booked[data] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[data][hourBlock] === "undefined") {
        thisBooking.booked[data][hourBlock] = [];
      }

      thisBooking.booked[data][hourBlock].push(table);
    }
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
    thisBooking.dom.datePicker = document.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hoursPicker = document.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = document.querySelector(
      select.booking.floorPlan
    );
    thisBooking.dom.form = document.querySelector(select.booking.form);
  }

  resetActiveTables() {
    const { tables } = this.dom;
    this.selectedTable = null;
    tables.forEach((table) => {
      table.classList.remove("active");
    });
  }

  initWidgets() {
    const thisBooking = this;
    const {
      peopleAmount,
      hoursAmount,
      datePicker,
      hoursPicker,
      floorPlan,
      form,
    } = thisBooking.dom;

    new AmountWidget(peopleAmount);
    new AmountWidget(hoursAmount);

    thisBooking.datePicker = new DatePicker(datePicker);
    thisBooking.hourPicker = new HourPicker(hoursPicker);

    [floorPlan, datePicker, hoursPicker].forEach((elem) => {
      elem.addEventListener("update", () => {
        thisBooking.updateDOM();
        thisBooking.resetActiveTables();
      });
    });

    floorPlan.addEventListener("click", (e) => {
      const clickedElement = e.target;
      if (
        !(
          clickedElement.classList.contains("table") &&
          !clickedElement.classList.contains("booked")
        )
      )
        return;

      if (clickedElement.classList.contains("active")) {
        clickedElement.classList.remove("active");
        thisBooking.selectedTable = null;
      } else {
        thisBooking.resetActiveTables();
        clickedElement.classList.add("active");
        thisBooking.selectedTable = +clickedElement.dataset.table;
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      thisBooking.sendBooking();
    });
  }

  sendBooking() {
    const thisBooking = this;
    const { date, selectedTable: table } = thisBooking;
    const hour = thisBooking.hourPicker.correctValue;
    const { hoursAmount, peopleAmount, wrapper } = thisBooking.dom;
    const duration = hoursAmount.querySelector("input").value;
    const ppl = peopleAmount.querySelector("input").value;
    const phone = wrapper.querySelector("[name=phone]").value;
    const address = wrapper.querySelector("[name=address").value;

    const url = `${settings.db.url}/${settings.db.bookings}`;
    const payload = {
      date,
      hour,
      table,
      duration,
      ppl,
      starters: [...wrapper.querySelectorAll("[type=checkbox]")]
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value),
      phone,
      address,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).then((response) => {
      thisBooking.getData();
      console.log("response:", response);
    });
  }
}

export default Booking;
