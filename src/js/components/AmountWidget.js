import { select, settings } from "../settings.js";

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

export default AmountWidget;
