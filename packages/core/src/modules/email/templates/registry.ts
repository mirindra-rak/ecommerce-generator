import type { TemplateResult } from "../email.types";
import { renderEmailVerification } from "./email-verification";
import { renderLowStock } from "./low-stock";
import { renderPasswordReset } from "./password-reset";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templates: Record<string, (data: any) => TemplateResult> = {
  "low-stock": renderLowStock,
  "email-verification": renderEmailVerification,
  "password-reset": renderPasswordReset,
};

export function resolveTemplate(name: string, data: unknown): TemplateResult | null {
  const render = templates[name];
  if (!render) return null;
  return render(data);
}
