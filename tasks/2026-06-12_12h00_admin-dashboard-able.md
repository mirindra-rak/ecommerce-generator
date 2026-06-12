# Admin dashboard — style Able

**Date:** 2026-06-12 12:00
**Statut:** En cours

## Contexte

L'admin généré par l'agent catalogue est fonctionnel mais visuellement minimal
(slate-50, rounded-2xl, border-slate-200). L'utilisateur veut un admin « sérieux »
inspiré du template Able Bootstrap : sidebar navy, top bar, cartes KPI colorées,
graphique, fil d'activité.

## Modifications

- [x] `packages/ui/src/icons.tsx` — ajout des icônes admin (House, Tag, Storefront, Package, ShoppingBag, Bell, Gear, WarningCircle, SignOut)
- [x] `apps/pharmacie-1/package.json` — ajout de `recharts` (graphiques)
- [x] `apps/pharmacie-1/src/app/admin/(protected)/_components/admin-shell.tsx` — nouveau : coque client (sidebar navy + topbar)
- [x] `apps/pharmacie-1/src/app/admin/(protected)/_components/kpi-cards.tsx` — nouveau : 4 cartes KPI colorées (client)
- [x] `apps/pharmacie-1/src/app/admin/(protected)/_components/weekly-chart.tsx` — nouveau : AreaChart Recharts (données simulées)
- [x] `apps/pharmacie-1/src/app/admin/(protected)/layout.tsx` — refonte : délègue le shell à AdminShell
- [x] `apps/pharmacie-1/src/app/admin/(protected)/page.tsx` — refonte : dashboard KPI + chart + activité récente
- [x] `apps/pharmacie-1/src/app/admin/(protected)/categories/page.tsx` — alignement tokens DS
- [x] `apps/pharmacie-1/src/app/admin/(protected)/marques/page.tsx` — alignement tokens DS

## Notes

- Sidebar : bg-foreground (navy #15244c), texte blanc, Cross brand mark
- Top bar : bg-surface, h-16, border-b border-line
- KPI cards : bg-brand-600 / bg-accent-600 / bg-teal-600 / bg-info-solid
- Chart : AreaChart Recharts, données simulées (pas d'orders en DB)
- Active nav : indicateur dot brand-500

## Rollback

```bash
git checkout HEAD -- apps/pharmacie-1/src/app/admin/
git checkout HEAD -- packages/ui/src/icons.tsx
# retirer recharts de package.json + pnpm install
```
