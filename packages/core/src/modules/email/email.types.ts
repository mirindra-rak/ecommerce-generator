export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailTransport {
  send(message: EmailMessage): Promise<void>;
}

export interface TemplateResult {
  subject: string;
  html: string;
}
