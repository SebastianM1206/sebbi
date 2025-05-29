export class DiscountStrategy {
  calculatePrice(originalPrice) {
    throw new Error("Method calculatePrice() must be implemented");
  }

  getDescription() {
    throw new Error("Method getDescription() must be implemented");
  }
}
