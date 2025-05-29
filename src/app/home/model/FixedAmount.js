import { DiscountStrategy } from "./DiscountStrategy";

export class FixedAmountDiscountStrategy extends DiscountStrategy {
  constructor(amount) {
    super();
    this.amount = amount;
  }

  calculatePrice(originalPrice) {
    return Math.max(0, originalPrice - this.amount);
  }

  getDescription() {
    return `Descuento fijo de $${this.amount}`;
  }
}
