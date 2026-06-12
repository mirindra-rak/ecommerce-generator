// Point d'entrée public de @pharmacie/ui (design system thémable).
// Direction : « officine éditoriale » — serif display, encre navy, accent vert,
// filets hairline, angles nets, motif croix. Tout est piloté par les design tokens.

export { cx } from "./lib/cx";

export { Button, buttonClasses } from "./components/button";
export type { ButtonVariant, ButtonSize } from "./components/button";
export { Badge } from "./components/badge";
export { Card } from "./components/card";
export { Container } from "./components/container";
export { Section } from "./components/section";
export { Heading } from "./components/heading";
export { Eyebrow } from "./components/eyebrow";
export { IconButton } from "./components/icon-button";
export { Input } from "./components/input";
export { Select } from "./components/select";
export type { SelectOption } from "./components/select";
export { MultiSelect } from "./components/multi-select";
export { Textarea } from "./components/textarea";
export { Field } from "./components/field";
export { Rule } from "./components/rule";
export { Cross } from "./components/cross";
export { IconProvider } from "./components/icon-provider";

// Icônes (Phosphor) — ArrowRight + tout le set *Icon.
export * from "./icons";
