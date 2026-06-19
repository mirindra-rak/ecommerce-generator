"use client";

import { useEffect, useRef } from "react";

export function useUnsavedChanges(formRef: React.RefObject<HTMLFormElement | null>) {
  const snapshot = useRef<string | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    requestAnimationFrame(() => {
      snapshot.current = serialize(form);
    });

    function isDirty(): boolean {
      if (!form || snapshot.current === null) return false;
      return serialize(form) !== snapshot.current;
    }

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty()) e.preventDefault();
    }

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      if (isDirty() && !window.confirm(getMessage())) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    let skipPopState = false;

    function handlePopState() {
      if (skipPopState) {
        skipPopState = false;
        return;
      }
      if (!isDirty()) return;

      // popstate fires AFTER the browser navigated — push current page back
      skipPopState = true;
      history.pushState(null, "", location.href);

      if (window.confirm(getMessage())) {
        // User wants to leave — actually go back
        snapshot.current = null;
        history.back();
      }
    }

    // Anchor the current entry so popstate fires on back instead of leaving
    history.pushState(null, "", location.href);

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [formRef]);
}

function serialize(form: HTMLFormElement): string {
  const entries = Array.from(new FormData(form).entries()) as [string, string][];
  return new URLSearchParams(entries).toString();
}

function getMessage(): string {
  return "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?";
}
