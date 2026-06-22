import type { TemplateResult } from "../email.types";
import { wrapInLayout } from "./layout";

export interface LowStockData {
  productName: string;
  sku: string | null;
  stock: number;
  threshold: number;
}

export function renderLowStock(data: LowStockData): TemplateResult {
  const label = data.sku ?? "sans référence";

  const body = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Alerte stock faible</h2>
    <p style="margin:0 0 12px;color:#334155;font-size:14px;line-height:1.6;">
      Le stock du produit <strong>${escapeHtml(data.productName)}</strong>
      (${escapeHtml(label)}) est passé en dessous du seuil d'alerte.
    </p>
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 16px;background-color:#fef2f2;color:#991b1b;font-size:14px;font-weight:bold;border-radius:4px;">
          Stock actuel : ${data.stock} &nbsp;|&nbsp; Seuil : ${data.threshold}
        </td>
      </tr>
    </table>
    <p style="margin:0;color:#64748b;font-size:13px;">
      Pensez à réapprovisionner ce produit pour éviter une rupture de stock.
    </p>`;

  return {
    subject: `Alerte stock faible — ${data.productName}`,
    html: wrapInLayout(body),
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
