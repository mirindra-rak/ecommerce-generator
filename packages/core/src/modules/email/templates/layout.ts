export function wrapInLayout(body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8f9fa;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <tr>
            <td style="padding:24px 32px;background-color:#1e293b;color:#ffffff;font-size:18px;font-weight:bold;">
              Pharmacie
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background-color:#f1f5f9;color:#64748b;font-size:12px;text-align:center;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
