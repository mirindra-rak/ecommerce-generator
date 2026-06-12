import { prisma } from "@pharmacie/core";
import { betterAuth } from "better-auth";
import { authOptions } from "../src/lib/auth-options";

// Seed idempotent du compte ADMIN initial. Le mot de passe est haché par Better Auth
// (auth.api.signUpEmail) — JAMAIS à la main ni inséré directement en base.
// Instance HEADLESS (sans nextCookies, qui dépend de next/headers indisponible ici).

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

async function main(): Promise<void> {
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans l'environnement.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    }
    console.warn(`Compte admin déjà présent (${email}) — rôle garanti ADMIN.`);
    return;
  }

  const auth = betterAuth({
    ...authOptions,
    emailAndPassword: { enabled: true, autoSignIn: false },
  });

  await auth.api.signUpEmail({ body: { name: "Administrateur", email, password } });
  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.warn(`Compte admin créé (${email}).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
