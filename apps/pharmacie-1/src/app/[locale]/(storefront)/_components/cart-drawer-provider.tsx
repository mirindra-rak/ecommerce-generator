"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartDrawerOpenReason = "manual" | "added";

interface CartDrawerContextValue {
  isOpen: boolean;
  openReason: CartDrawerOpenReason | null;
  openDrawer: (reason?: CartDrawerOpenReason) => void;
  closeDrawer: () => void;
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openReason, setOpenReason] = useState<CartDrawerOpenReason | null>(null);

  const openDrawer = useCallback((reason: CartDrawerOpenReason = "manual") => {
    setOpenReason(reason);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    setOpenReason(null);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setOpenReason(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const value = useMemo<CartDrawerContextValue>(
    () => ({ isOpen, openReason, openDrawer, closeDrawer }),
    [closeDrawer, isOpen, openDrawer, openReason],
  );

  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}

export function useCartDrawer() {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error("useCartDrawer must be used within CartDrawerProvider");
  }
  return context;
}
