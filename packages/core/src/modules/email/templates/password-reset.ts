import type { TemplateResult } from "../email.types";
import { wrapInLayout } from "./layout";

export interface PasswordResetData {
  url: string;
  name: string;
}

export function renderPasswordReset(data: PasswordResetData): TemplateResult {
  const body = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Réinitialisez votre mot de passe</h2>
    <p style="margin:0 0 16px;color:#334155;font-size:14px;line-height:1.6;">
      Bonjour <strong>${escapeHtml(data.name)}</strong>,
    </p>
    <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.6;">
      Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.
    </p>
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 24px;">
      <tr>
        <td style="padding:12px 24px;background-color:#2563eb;border-radius:6px;">
          <a href="${escapeHtml(data.url)}" style="color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">
            Réinitialiser mon mot de passe
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;color:#64748b;font-size:13px;">
      Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
    </p>
    <p style="margin:0 0 16px;color:#64748b;font-size:12px;word-break:break-all;">
      ${escapeHtml(data.url)}
    </p>
    <p style="margin:0;color:#94a3b8;font-size:12px;">
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.
    </p>`;

  return {
    subject: "Réinitialisez votre mot de passe",
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
