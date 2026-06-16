import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.forbidden");
  return { title: t("title") };
}

export default async function ForbiddenPage() {
  const t = await getTranslations("admin.forbidden");

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-red-600">{t("code")}</p>
      <h1 className="mt-2 text-2xl font-bold text-foreground">{t("title")}</h1>
      <p className="mt-3 text-sm text-muted">{t("message")}</p>
      <Link href="/" className="mt-6 text-sm font-semibold text-brand-700 hover:underline">
        {t("backToShop")}
      </Link>
    </div>
  );
}
