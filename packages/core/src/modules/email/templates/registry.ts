import type { TemplateResult } from "../email.types";
import { renderLowStock } from "./low-stock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const templates: Record<string, (data: any) => TemplateResult> = {
  "low-stock": renderLowStock,
};

export function resolveTemplate(name: string, data: unknown): TemplateResult | null {
  const render = templates[name];
  if (!render) return null;
  return render(data);
}
