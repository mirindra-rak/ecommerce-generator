"use client";

import { authClient } from "@/lib/auth-client";
import { Button, Card, Input } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

export function ChangePasswordForm() {
  const t = useTranslations("auth.account.password");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setError(t("mismatch"));
      setPending(false);
      return;
    }

    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });

    if (changeError) {
      setError(t("wrongCurrent"));
      setPending(false);
      return;
    }

    setSuccess(true);
    setPending(false);
    (event.target as HTMLFormElement).reset();
  }

  return (
    <Card className="max-w-md p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">
            {t("currentPassword")}
          </label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1"
          />
        </div>

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

        {success && (
          <p className="rounded-sm bg-green-50 px-3 py-2 text-sm text-green-700">{t("success")}</p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? t("pending") : t("submit")}
        </Button>
      </form>
    </Card>
  );
}
