import { expect, test } from "@playwright/test";

// Critères d'acceptation story 03 — sélecteur de langue.
// Prérequis : navigateurs installés (`pnpm exec playwright install`) + base seedée.

const SWITCHER = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: /changer de langue|change language/i });

test("scénario 1 — switch FR→EN conserve la page et les filtres", async ({ page }) => {
  // Page de catégorie avec une facette en query (filtre) pour vérifier la préservation.
  await page.goto("/fr/categorie/visage-soin?marque=avene");

  await SWITCHER(page).click();
  await page.getByRole("option", { name: /english/i }).click();

  await expect(page).toHaveURL("/en/categorie/visage-soin?marque=avene");
});

test("scénario 2 — le choix persiste (cookie NEXT_LOCALE)", async ({ page, context }) => {
  await page.goto("/fr");
  await SWITCHER(page).click();
  await page.getByRole("option", { name: /english/i }).click();
  await expect(page).toHaveURL(/^\/en(\/|$)/);

  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "NEXT_LOCALE")?.value).toBe("en");

  // Nouvelle visite de la racine → la locale persistée est restaurée.
  await page.goto("/");
  await expect(page).toHaveURL(/^\/en(\/|$)/);
});

test("scénario 3 — la liste expose les locales supportées, l'active marquée", async ({ page }) => {
  await page.goto("/fr");
  await SWITCHER(page).click();

  const listbox = page.getByRole("listbox", { name: /changer de langue/i });
  await expect(listbox.getByRole("option")).toHaveCount(2);
  await expect(listbox.getByRole("option", { name: /français/i })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
