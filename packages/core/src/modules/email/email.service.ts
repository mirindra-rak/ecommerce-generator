import type { EmailMessage, EmailTransport, TemplateResult } from "./email.types";
import { resolveTemplate } from "./templates/registry";
import { consoleTransport } from "./transports/console.transport";

let activeTransport: EmailTransport = consoleTransport;

export function setEmailTransport(transport: EmailTransport): void {
  activeTransport = transport;
}

function getTransport(): EmailTransport {
  return activeTransport;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  try {
    await getTransport().send(message);
  } catch (error) {
    console.error("[Email] Failed to send:", error);
  }
}

export async function sendTemplatedEmail<T>(options: {
  to: string;
  template: string;
  data: T;
  from?: string;
}): Promise<void> {
  let result: TemplateResult | null;
  try {
    result = resolveTemplate(options.template, options.data);
  } catch (error) {
    console.error(`[Email] Template "${options.template}" resolution failed:`, error);
    return;
  }

  if (!result) {
    console.error(`[Email] Unknown template: "${options.template}"`);
    return;
  }

  await sendEmail({
    to: options.to,
    subject: result.subject,
    html: result.html,
    from: options.from,
  });
}
