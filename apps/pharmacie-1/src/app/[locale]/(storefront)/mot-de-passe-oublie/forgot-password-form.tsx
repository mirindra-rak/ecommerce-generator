"use client";

import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { Button, Card, Heading, Input } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setSubmitted(true);
    setPending(false);
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <Heading as="h1" className="text-2xl">
        {t("title")}
      </Heading>
      <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>

      {submitted ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-sm bg-green-50 px-3 py-2 text-sm text-green-700">{t("success")}</p>
          <Link
            href="/connexion"
            className="inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              {t("email")}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("pending") : t("submit")}
          </Button>

          <div className="text-center">
            <Link
              href="/connexion"
              className="text-sm text-muted hover:text-foreground hover:underline"
            >
              {t("backToLogin")}
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
}
