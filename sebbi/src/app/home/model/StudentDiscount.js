import { DiscountStrategy } from "./DiscountStrategy";

// Student Discount
export class StudentDiscountStrategy extends DiscountStrategy {
  constructor() {
    super();
    this.percentage = 50;
  }

  calculate(price) {
    return price * (1 - this.percentage / 100);
  }

  getDescription() {
    return `${this.percentage}% Student Discount`;
  }
}
