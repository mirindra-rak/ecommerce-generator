"use client";

import { IconButton } from "@pharmacie/ui";
import { useCartDrawer } from "./cart-drawer-provider";
import { CartIcon } from "./icons";

interface CartBadgeButtonProps {
  count: number;
  label: string;
}

export function CartBadgeButton({ count, label }: CartBadgeButtonProps) {
  const { openDrawer } = useCartDrawer();

  return (
    <IconButton label={label} onClick={() => openDrawer("manual")} className="cursor-pointer">
      <CartIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-sm bg-accent-600 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </IconButton>
  );
}
