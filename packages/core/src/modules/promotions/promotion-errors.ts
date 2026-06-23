export class InvalidDiscountValueError extends Error {
  constructor(value: number) {
    super(`Invalid discount value: ${value}`);
    this.name = "InvalidDiscountValueError";
  }
}

export class InvalidFloorPriceError extends Error {
  constructor(value: number) {
    super(`Invalid floor price: ${value}`);
    this.name = "InvalidFloorPriceError";
  }
}

export class MissingTargetIdsError extends Error {
  constructor(targetType: string) {
    super(`Target type "${targetType}" requires at least one target ID`);
    this.name = "MissingTargetIdsError";
  }
}
