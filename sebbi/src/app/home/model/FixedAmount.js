import { DiscountStrategy } from "./DiscountStrategy";

// Fixed Amount Discount
export class FixedAmountDiscountStrategy extends DiscountStrategy {
  constructor(amount) {
    super();
    this.amount = amount;
  }

  calculate(price) {
    return Math.max(0, price - this.amount);
  }

  getDescription() {
    return `${this.amount} off`;
  }
}
