import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth-guard";
import { type Role, isStaff } from "@pharmacie/core/modules/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.login");
  return { title: t("title") };
}

export default async function AdminLoginPage() {
  // Déjà connecté avec un rôle suffisant → pas de double connexion.
  const user = await getCurrentUser();
  if (user && isStaff(user.role as Role)) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <LoginForm />
    </div>
  );
}
