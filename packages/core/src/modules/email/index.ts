export { sendEmail, sendTemplatedEmail, setEmailTransport } from "./email.service";
export type { EmailMessage, EmailTransport, TemplateResult } from "./email.types";
export { consoleTransport } from "./transports/console.transport";
export { smtpTransport } from "./transports/smtp.transport";
