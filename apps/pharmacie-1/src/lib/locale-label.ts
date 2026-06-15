// Libellé d'une locale en AUTONYME (le nom de la langue dans cette langue : "fr" →
// "Français", "en" → "English"), donc identique quelle que soit l'UI active. Calculé via
// `Intl.DisplayNames` ; repli sur le code brut si la plateforme ne le résout pas.
export function localeLabel(code: string): string {
  try {
    // `fallback: "none"` → renvoie `undefined` (et non un écho du code) si non reconnu.
    const name = new Intl.DisplayNames([code], { type: "language", fallback: "none" }).of(code);
    if (!name) return code;
    // Capitalise la première lettre (certaines locales renvoient une minuscule initiale).
    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    return code;
  }
}
