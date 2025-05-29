import { DiscountStrategy } from "./DiscountStrategy";

// Percentage-based Discount
export default class PercentageDiscountStrategy extends DiscountStrategy {
  constructor(percentage) {
    super();
    this.percentage = percentage;
  }

  calculate(price) {
    return price * (1 - this.percentage / 100);
  }

  getDescription() {
    return `${this.percentage}% off`;
  }
}
