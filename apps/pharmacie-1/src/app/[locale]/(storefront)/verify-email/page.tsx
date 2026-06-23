import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { VerifyEmailClient } from "./verify-email-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.verifyEmail");
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <VerifyEmailClient />
    </div>
  );
}
