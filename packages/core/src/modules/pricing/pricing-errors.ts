export class InvalidMoneyAmountError extends Error {
  constructor(amount: number) {
    super(`Invalid money amount: ${amount}`);
    this.name = "InvalidMoneyAmountError";
  }
}

export class InvalidTaxRateError extends Error {
  constructor(message = "Invalid tax rate") {
    super(message);
    this.name = "InvalidTaxRateError";
  }
}

export class TaxRateNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Tax rate not found: ${identifier}`);
    this.name = "TaxRateNotFoundError";
  }
}
