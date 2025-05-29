import { DiscountStrategy } from "./DiscountStrategy";

export class DiscountContext {
  constructor() {
    this.strategy = null;
  }

  setStrategy(strategy) {
    if (!(strategy instanceof DiscountStrategy)) {
      throw new Error("Strategy must be an instance of DiscountStrategy");
    }
    this.strategy = strategy;
  }

  calculatePrice(originalPrice) {
    if (!this.strategy) {
      return originalPrice;
    }
    return this.strategy.calculatePrice(originalPrice);
  }
}
