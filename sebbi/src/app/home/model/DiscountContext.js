import { DiscountStrategy } from "./DiscountStrategy";
// Discount Context
export class DiscountContext {
  constructor() {
    this.strategy = new DiscountStrategy();
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  calculatePrice(originalPrice) {
    return this.strategy.calculate(originalPrice);
  }

  getDiscountDescription() {
    return this.strategy.getDescription();
  }
}
