import { createAuthClient } from "better-auth/react";

// Client Better Auth (composants client). baseURL omise → même origine que l'app.
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
