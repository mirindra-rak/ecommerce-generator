"use client";

import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

interface EmailVerificationBannerProps {
  email: string;
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const t = useTranslations("auth.emailBanner");
  const [resent, setResent] = useState(false);
  const [pending, setPending] = useState(false);

  const handleResend = useCallback(async () => {
    setPending(true);
    await authClient.sendVerificationEmail({ email });
    setResent(true);
    setPending(false);
  }, [email]);

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800">
      <span>{t("text")}</span>{" "}
      {resent ? (
        <span className="font-medium text-green-700">{t("resent")}</span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={pending}
          className="cursor-pointer font-medium underline hover:no-underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("resend")}
        </button>
      )}
    </div>
  );
}
