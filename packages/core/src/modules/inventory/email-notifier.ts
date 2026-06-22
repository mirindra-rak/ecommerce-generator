import type { LowStockNotifier } from "./inventory.types";

export const emailNotifier: LowStockNotifier = {
  async notify(variant, stock, threshold) {
    const label = variant.sku ?? variant.id;
    const message =
      `[Low Stock Alert] "${variant.productName}" (${label}) — ` +
      `stock is ${stock}, below threshold of ${threshold}`;

    const to = process.env.ALERT_EMAIL_TO;
    if (!to) {
      console.warn(message);
      return;
    }

    // Placeholder: will use the `email` module once implemented.
    // For now, log + attempt Nodemailer if available.
    // Will use the `email` module once implemented. For now, log the alert.
    console.warn(message);
  },
};
