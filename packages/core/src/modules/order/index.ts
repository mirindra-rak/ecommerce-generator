// Module: order
// Responsabilité: Checkout, commandes, statuts, factures, avoirs, remboursements
//
// Frontière d'accès données via Repository (voir ../../repositories).
// La logique métier vit dans des services de domaine de ce module.
//
// Montants : ce module consomme `PriceBreakdown` du module `pricing`
// pour figer les montants de commande. Ne jamais recalculer HT/TVA/TTC ici.

export type { PriceBreakdown, PriceBreakdownRange } from "../pricing";
