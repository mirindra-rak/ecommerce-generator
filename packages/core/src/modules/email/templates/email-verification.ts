import type { TemplateResult } from "../email.types";
import { wrapInLayout } from "./layout";

export interface EmailVerificationData {
  url: string;
  name: string;
}

export function renderEmailVerification(data: EmailVerificationData): TemplateResult {
  const body = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Vérifiez votre adresse e-mail</h2>
    <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
      Bonjour <strong>${escapeHtml(data.name)}</strong>,
    </p>
    <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.6;">
      Merci pour votre inscription. Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail.
    </p>
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      <tr>
        <td style="padding:12px 24px;background-color:#16a34a;border-radius:6px;">
          <a href="${escapeHtml(data.url)}" style="color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">
            Vérifier mon e-mail
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;color:#64748b;font-size:13px;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
    </p>
    <p style="margin:0;color:#64748b;font-size:12px;word-break:break-all;">
      ${escapeHtml(data.url)}
    </p>`;

  return {
    subject: "Vérifiez votre adresse e-mail",
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
