import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function StorefrontLoginPage() {
  const session = await getSession();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <LoginForm />
    </div>
  );
}
