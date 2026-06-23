import { prisma } from "@pharmacie/core";
import {
  sendEmail,
  setEmailTransport,
  smtpTransport,
  renderEmailVerification,
  renderPasswordReset,
} from "@pharmacie/core/modules/email";
import { prismaAdapter } from "better-auth/adapters/prisma";

if (process.env.SMTP_HOST) {
  setEmailTransport(smtpTransport);
}

export const authOptions = {
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      const { subject, html } = renderPasswordReset({
        url,
        name: user.name,
      });
      await sendEmail({ to: user.email, subject, html });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 86400,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name: string };
      url: string;
    }) => {
      const { subject, html } = renderEmailVerification({
        url,
        name: user.name,
      });
      await sendEmail({ to: user.email, subject, html });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["CUSTOMER", "STAFF", "ADMIN"],
        required: false,
        defaultValue: "CUSTOMER",
        input: false,
      },
    },
  },
  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
};
