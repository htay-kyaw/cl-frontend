// Mirrors Order::calculatePointsEarned() in cl-backend: 1 point per 30,000 MMK of products,
// after any points discount; the delivery fee never counts. Credited when the order is delivered.
export const POINTS_THRESHOLD_MMK = 30000;

export function pointsFor(productTotal, discount = 0) {
  return Math.floor(Math.max(productTotal - discount, 0) / POINTS_THRESHOLD_MMK);
}
