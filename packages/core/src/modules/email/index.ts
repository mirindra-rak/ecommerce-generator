export { sendEmail, sendTemplatedEmail, setEmailTransport } from "./email.service";
export type { EmailMessage, EmailTransport, TemplateResult } from "./email.types";
export { consoleTransport } from "./transports/console.transport";
export { smtpTransport } from "./transports/smtp.transport";
export { renderEmailVerification } from "./templates/email-verification";
export { renderPasswordReset } from "./templates/password-reset";
