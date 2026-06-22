import { sendTemplatedEmail } from "../email";
import type { LowStockNotifier } from "./inventory.types";

export const emailNotifier: LowStockNotifier = {
  async notify(variant, stock, threshold) {
    const to = process.env.ALERT_EMAIL_TO;
    if (!to) {
      const label = variant.sku ?? variant.id;
      console.warn(
        `[Low Stock Alert] "${variant.productName}" (${label}) — ` +
          `stock is ${stock}, below threshold of ${threshold}. ` +
          `Set ALERT_EMAIL_TO to receive email alerts.`,
      );
      return;
    }

    await sendTemplatedEmail({
      to,
      template: "low-stock",
      data: {
        productName: variant.productName,
        sku: variant.sku,
        stock,
        threshold,
      },
    });
  },
};
