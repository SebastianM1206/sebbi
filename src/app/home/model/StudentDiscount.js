import { DiscountStrategy } from "./DiscountStrategy";

export class StudentDiscountStrategy extends DiscountStrategy {
  calculatePrice(originalPrice) {
    return originalPrice * 0.8; // 20% de descuento para estudiantes
  }

  getDescription() {
    return "Descuento especial para estudiantes (20%)";
  }
}
