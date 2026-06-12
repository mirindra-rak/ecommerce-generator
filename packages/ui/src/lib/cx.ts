// Concaténation de classes conditionnelle — minimal, zéro dépendance.
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
