import { DiscountStrategy } from "./DiscountStrategy";

export class PercentageDiscountStrategy extends DiscountStrategy {
  constructor(percentage) {
    super();
    this.percentage = percentage;
  }

  calculatePrice(originalPrice) {
    return originalPrice * (1 - this.percentage / 100);
  }

  getDescription() {
    return `Descuento del ${this.percentage}%`;
  }
}
