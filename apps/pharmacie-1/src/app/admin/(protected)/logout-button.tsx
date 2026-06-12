"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@pharmacie/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/admin/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onLogout}
      disabled={pending}
      className="mt-3 w-full"
    >
      {pending ? "Déconnexion…" : "Se déconnecter"}
    </Button>
  );
}
