import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "./reset-password-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.resetPassword");
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <ResetPasswordForm />
    </div>
  );
}
