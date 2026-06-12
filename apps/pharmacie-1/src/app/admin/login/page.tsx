import { getCurrentUser } from "@/lib/auth-guard";
import { type Role, isStaff } from "@pharmacie/core/modules/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connexion" };

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
