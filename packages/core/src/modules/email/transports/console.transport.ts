import type { EmailMessage, EmailTransport } from "../email.types";

export const consoleTransport: EmailTransport = {
  async send(message: EmailMessage): Promise<void> {
    console.warn(
      `[Email] To: ${message.to} | Subject: ${message.subject} | From: ${message.from ?? "(default)"}`,
    );
  },
};
