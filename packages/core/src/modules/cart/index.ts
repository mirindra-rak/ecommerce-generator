// Module: cart
// Responsabilité: Panier (persistance, totaux, règles)
//
// Frontière d'accès données via Repository (voir ../../repositories).
// La logique métier vit dans des services de domaine de ce module.
//
// Montants : ce module consomme `PriceBreakdown` du module `pricing`
// pour figer les lignes panier. Ne jamais recalculer HT/TVA/TTC ici.

export type { PriceBreakdown, PriceBreakdownRange } from "../pricing";
