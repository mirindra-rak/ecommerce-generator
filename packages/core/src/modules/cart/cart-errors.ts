export class CartNotFoundError extends Error {
  constructor(cartId: string) {
    super(`Cart not found: ${cartId}`);
    this.name = "CartNotFoundError";
  }
}

export class ItemNotAvailableError extends Error {
  constructor(variantId: string) {
    super(`Item not available: ${variantId}`);
    this.name = "ItemNotAvailableError";
  }
}
