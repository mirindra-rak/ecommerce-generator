"use client";

import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { Button, Card, Heading, Input } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

type Status = "form" | "success" | "expired";

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const initialStatus: Status = errorParam ? "expired" : "form";
  const [status, setStatus] = useState<Status>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError(t("mismatch"));
      setPending(false);
      return;
    }

    const { error: resetError } = await authClient.resetPassword({
      newPassword,
      token: token ?? "",
    });

    if (resetError) {
      setStatus("expired");
      setPending(false);
      return;
    }

    setStatus("success");
    setPending(false);
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <Heading as="h1" className="text-2xl">
        {t("title")}
      </Heading>

      {status === "expired" && (
        <div className="mt-6 space-y-4">
          <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{t("expired")}</p>
          <Link
            href="/mot-de-passe-oublie"
            className="inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t("expiredCta")}
          </Link>
        </div>
      )}

      {status === "success" && (
        <div className="mt-6 space-y-4">
          <p className="rounded-sm bg-green-50 px-3 py-2 text-sm text-green-700">{t("success")}</p>
          <Link
            href="/connexion"
            className="inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t("successCta")}
          </Link>
        </div>
      )}

      {status === "form" && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
              {t("newPassword")}
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted">{t("passwordHint")}</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              {t("confirmPassword")}
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-1"
            />
          </div>

          {error && <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("pending") : t("submit")}
          </Button>
        </form>
      )}
    </Card>
  );
}
