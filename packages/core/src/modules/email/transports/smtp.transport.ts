import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { EmailMessage, EmailTransport } from "../email.types";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: process.env.SMTP_USER ?? "",
        pass: process.env.SMTP_PASS ?? "",
      },
    });
  }
  return transporter;
}

export const smtpTransport: EmailTransport = {
  async send(message: EmailMessage): Promise<void> {
    const from = message.from ?? process.env.SMTP_FROM ?? "noreply@pharmacie.local";
    await getTransporter().sendMail({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  },
};
