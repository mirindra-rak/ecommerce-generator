"use client";

import { authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/navigation";
import { Button, Card, Heading } from "@pharmacie/ui";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export function VerifyEmailClient() {
  const t = useTranslations("auth.verifyEmail");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const hasError = !!error;
  const [resent, setResent] = useState(false);
  const [pending, setPending] = useState(false);

  const handleResend = useCallback(async () => {
    setPending(true);
    await authClient.sendVerificationEmail({ email: "" });
    setResent(true);
    setPending(false);
  }, []);

  return (
    <Card className="w-full max-w-sm p-8 text-center">
      <Heading as="h1" className="text-2xl">
        {t("title")}
      </Heading>

      {!hasError && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-green-700">{t("success")}</p>
          <Link
            href="/compte"
            className="inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t("successCta")}
          </Link>
        </div>
      )}

      {hasError && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-red-700">{t("expired")}</p>
          {resent ? (
            <p className="text-sm text-green-700">{t("resent")}</p>
          ) : (
            <Button variant="secondary" size="sm" onClick={handleResend} disabled={pending}>
              {t("resend")}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
